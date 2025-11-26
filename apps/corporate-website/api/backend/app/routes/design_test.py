"""Routes for the Design Sense assessment API."""

from __future__ import annotations

from datetime import datetime, timezone
from statistics import mean
from typing import Any

from fastapi import APIRouter, HTTPException, status

from ..db import (
    get_applicants_collection,
    get_attempts_collection,
    get_images_collection,
    get_questions_collection,
    get_supplemental_questions_collection,
)
from ..models import (
    ApplicantInput,
    ApplicantSummary,
    ImageDocument,
    ImageResult,
    PublicBoostQuestion,
    PublicImage,
    PublicQuestion,
    QuestionDocument,
    QuestionResult,
    QuestionType,
    BoostQuestionDocument,
    PublicSelectionQuestion,
    SelectionQuestionDocument,
    SubmissionBand,
    SubmissionMetadata,
    SubmissionResult,
    TestSubmissionRequest,
)

router = APIRouter(prefix="/api/design-test", tags=["design-test"])


def _deserialize_question(document: dict[str, Any]) -> QuestionDocument:
    """Convert a raw MongoDB document into a strongly typed QuestionDocument."""
    payload = dict(document)
    object_id = payload.pop("_id", None)
    if object_id is not None:
        payload["id"] = str(object_id)
    return QuestionDocument.model_validate(payload)


def _question_to_public(question: QuestionDocument) -> PublicQuestion:
    """Strip private fields to expose a public-friendly question payload."""
    public_images = [
        PublicImage(
            imageId=image.imageId,
            src=image.src,
            imageType=image.imageType,
            displayLabel=image.displayLabel,
        )
        for image in question.images
    ]
    return PublicQuestion(
        questionNumber=question.questionNumber,
        questionType=question.questionType,
        images=public_images,
    )


async def _fetch_supplemental_docs() -> dict[int, SelectionQuestionDocument | BoostQuestionDocument]:
    """Load supplemental selection/boost questions keyed by question number."""
    collection = await get_supplemental_questions_collection()
    supplemental: dict[int, SelectionQuestionDocument | BoostQuestionDocument] = {}
    async for raw in collection.find():
        kind = raw.get("kind")
        if kind == "selection":
            doc = SelectionQuestionDocument.model_validate(raw)
        elif kind == "boost":
            doc = BoostQuestionDocument.model_validate(raw)
        else:
            continue
        supplemental[doc.questionNumber] = doc
    return supplemental


def _selection_to_public(doc: SelectionQuestionDocument) -> PublicSelectionQuestion:
    """Expose a selection question in the public API schema."""
    return PublicSelectionQuestion(
        questionNumber=doc.questionNumber,
        kind="selection",
        prompt=doc.prompt,
        options=doc.options,
    )


def _boost_to_public(doc: BoostQuestionDocument) -> PublicBoostQuestion:
    """Expose a boost question in the public API schema."""
    return PublicBoostQuestion(
        questionNumber=doc.questionNumber,
        kind="boost",
        prompt=doc.prompt,
        options=doc.options,
    )


@router.get("/questions", response_model=list[PublicQuestion])
async def list_questions() -> list[PublicQuestion]:
    """Return all assessment questions in display order."""
    collection = await get_questions_collection()
    cursor = collection.find().sort("questionNumber", 1)
    questions: list[PublicQuestion] = []
    async for doc in cursor:
        question = _deserialize_question(doc)
        questions.append(_question_to_public(question))
    return questions


@router.get("/supplemental", response_model=list[PublicSelectionQuestion | PublicBoostQuestion])
async def list_supplemental_questions() -> list[PublicSelectionQuestion | PublicBoostQuestion]:
    """Return supplemental questions (selection + boost) in order."""
    docs = await _fetch_supplemental_docs()
    result: list[PublicSelectionQuestion | PublicBoostQuestion] = []
    for question_number in sorted(docs.keys()):
        doc = docs[question_number]
        if isinstance(doc, SelectionQuestionDocument):
            result.append(_selection_to_public(doc))
        elif isinstance(doc, BoostQuestionDocument):
            result.append(_boost_to_public(doc))
    return result


async def _ensure_applicant(applicant: ApplicantInput, *, now: datetime) -> tuple[dict[str, Any] | None, int]:
    """Fetch an existing applicant by email and return their next attempt number."""
    applicants = await get_applicants_collection()
    normalized_email = applicant.email.lower()
    existing = await applicants.find_one({"email": normalized_email})
    if existing:
        attempt_number = int(existing.get("attemptCount", 0)) + 1
        return existing, attempt_number
    return None, 1


async def _update_applicant(
    applicant: ApplicantInput,
    attempt_number: int,
    *,
    now: datetime,
) -> None:
    """Upsert applicant metadata with the latest attempt information."""
    applicants = await get_applicants_collection()
    normalized_email = applicant.email.lower()
    update_payload = {
        "name": applicant.name,
        "updatedAt": now,
        "attemptCount": attempt_number,
    }
    result = await applicants.update_one(
        {"email": normalized_email},
        {
            "$set": update_payload,
            "$setOnInsert": {
                "email": normalized_email,
                "createdAt": now,
            },
        },
        upsert=True,
    )
    if result.matched_count == 0 and result.upserted_id is None:
        raise RuntimeError("Failed to upsert applicant document")


def _compute_band(score: float) -> SubmissionBand:
    """Translate a score into a qualitative band."""
    return SubmissionBand.from_score(score)


def _mean(values: list[float]) -> float:
    """Safe mean helper that tolerates empty lists."""
    return float(mean(values)) if values else 0.0


@router.post("/submit", response_model=SubmissionResult, status_code=status.HTTP_201_CREATED)
async def submit_results(payload: TestSubmissionRequest) -> SubmissionResult:
    """Compute the applicant's score, persist the attempt, and return the summary."""
    now = datetime.now(timezone.utc)
    normalized_email = payload.applicant.email.lower()
    attempts_collection = await get_attempts_collection()

    existing_attempt = await attempts_collection.find_one(
        {"sessionId": payload.sessionId, "applicantEmail": normalized_email}
    )
    if existing_attempt:
        return SubmissionResult.model_validate(
            {
                "applicant": {
                    "name": existing_attempt.get("applicantName"),
                    "email": existing_attempt.get("applicantEmail"),
                },
                "attemptNumber": existing_attempt.get("attemptNumber", 1),
                "sessionId": existing_attempt.get("sessionId"),
                "overallCloseness": existing_attempt.get("overallCloseness", 0.0),
                "overallClosenessPct": existing_attempt.get("overallClosenessPct", 0.0),
                "band": existing_attempt.get("band", SubmissionBand.NEEDS_WORK.value),
            }
        )

    applicant_doc, attempt_number = await _ensure_applicant(payload.applicant, now=now)

    response_map = {item.imageId: item.selectedScore for item in payload.responses}
    choice_map = {item.questionNumber: item.optionId for item in payload.choices}

    if 9 not in choice_map or 10 not in choice_map:
        raise HTTPException(status_code=400, detail="Additional questions 9 and 10 are required.")

    supplemental_docs = await _fetch_supplemental_docs()

    questions_collection = await get_questions_collection()
    question_cursor = questions_collection.find().sort("questionNumber", 1)
    questions: list[QuestionDocument] = []
    async for document in question_cursor:
        questions.append(_deserialize_question(document))

    image_ids = list(response_map.keys())
    images_collection = await get_images_collection()
    images_cursor = images_collection.find({"imageId": {"$in": image_ids}})
    actual_score_map: dict[str, ImageDocument] = {}
    async for image_doc in images_cursor:
        actual_image = ImageDocument.model_validate(image_doc)
        actual_score_map[actual_image.imageId] = actual_image

    question_results: list[QuestionResult] = []
    all_closeness: list[float] = []
    all_errors: list[float] = []
    scenario_summary: dict[str, Any] | None = None

    for question in questions:
        images: list[ImageResult] = []
        question_closeness: list[float] = []
        question_errors: list[float] = []

        for image in question.images:
            response = response_map.get(image.imageId)
            actual = actual_score_map.get(image.imageId)

            if response is None or actual is None:
                images.append(
                    ImageResult(
                        imageId=image.imageId,
                        selectedScore=response,
                        actualScore=actual.actualScore if actual else None,
                        excluded=True,
                    )
                )
                continue

            error = abs(response - actual.actualScore)
            closeness = 1 - (error / 2)
            images.append(
                ImageResult(
                    imageId=image.imageId,
                    selectedScore=response,
                    actualScore=actual.actualScore,
                    error=error,
                    closeness=closeness,
                    excluded=False,
                )
            )
            question_closeness.append(closeness)
            question_errors.append(error)
            all_closeness.append(closeness)
            all_errors.append(error)

        question_results.append(
            QuestionResult(
                questionNumber=question.questionNumber,
                questionType=question.questionType,
                closeness=_mean(question_closeness) if question_closeness else None,
                mae=_mean(question_errors) if question_errors else None,
                images=images,
            )
        )

    selection_doc_raw = supplemental_docs.get(9)
    if not isinstance(selection_doc_raw, SelectionQuestionDocument):
        raise HTTPException(status_code=500, detail="Selection question metadata missing.")

    selection_option_map = {option.optionId: option for option in selection_doc_raw.options}
    scenario_option_id = choice_map[9]
    selected_option = selection_option_map.get(scenario_option_id)
    correct_option = selection_option_map.get(selection_doc_raw.correctOptionId)
    if selected_option is None or correct_option is None:
        raise HTTPException(status_code=400, detail="Invalid selection for question 9.")

    selected_value = selected_option.value
    correct_value = correct_option.value
    scenario_error = abs(selected_value - correct_value)
    scenario_closeness = 1 - (scenario_error / 2)
    all_errors.append(scenario_error)
    all_closeness.append(scenario_closeness)
    scenario_summary = {
        "questionNumber": 9,
        "selectedOption": scenario_option_id,
        "selectedLabel": selected_option.label,
        "selectedValue": selected_value,
        "correctValue": correct_value,
        "error": scenario_error,
        "closeness": scenario_closeness,
    }

    base_closeness = _mean(all_closeness)
    mae = _mean(all_errors)

    boost_doc_raw = supplemental_docs.get(10)
    if not isinstance(boost_doc_raw, BoostQuestionDocument):
        raise HTTPException(status_code=500, detail="Boost question metadata missing.")

    boost_option_map = {option.optionId: option for option in boost_doc_raw.options}
    boost_option_id = choice_map[10]
    boost_option = boost_option_map.get(boost_option_id)
    if boost_option is None:
        raise HTTPException(status_code=400, detail="Invalid selection for question 10.")

    boost_multiplier = 1 + boost_option.boost
    boosted_closeness = min(base_closeness * boost_multiplier, 1.0)
    overall_closeness = boosted_closeness
    band = _compute_band(overall_closeness)

    metadata_dict = payload.metadata.model_dump() if payload.metadata else None
    overall_closeness_pct = round(overall_closeness * 100, 1)

    result = SubmissionResult(
        applicant=ApplicantSummary(name=payload.applicant.name, email=payload.applicant.email),
        attemptNumber=attempt_number,
        sessionId=payload.sessionId,
        overallCloseness=overall_closeness,
        overallClosenessPct=overall_closeness_pct,
        band=band,
    )

    role_summary = {
        "questionNumber": 10,
        "selectedOption": boost_option_id,
        "selectedLabel": boost_option.label,
        "boost": boost_option.boost,
    }

    await attempts_collection.insert_one(
        {
            "applicantEmail": normalized_email,
            "applicantName": payload.applicant.name,
            "attemptNumber": attempt_number,
            "sessionId": payload.sessionId,
            "submittedAt": now,
            "overallCloseness": result.overallCloseness,
            "overallClosenessPct": result.overallClosenessPct,
            "baseCloseness": base_closeness,
            "mae": mae,
            "band": result.band.value,
            "imageQuestions": [
                {
                    "questionNumber": question.questionNumber,
                    "questionType": question.questionType.value,
                    "closeness": question.closeness,
                    "mae": question.mae,
                    "images": [
                        {
                            "imageId": image.imageId,
                            "selectedScore": image.selectedScore,
                            "actualScore": image.actualScore,
                            "error": image.error,
                            "closeness": image.closeness,
                            "excluded": image.excluded,
                        }
                        for image in question.images
                    ],
                }
                for question in question_results
            ],
            "scenarioQuestion": scenario_summary,
            "rolePreference": role_summary,
            "boostMultiplier": boost_multiplier,
            "metadata": metadata_dict,
            "submittedAtIso": now.isoformat(),
        }
    )

    await _update_applicant(payload.applicant, attempt_number, now=now)

    return result
