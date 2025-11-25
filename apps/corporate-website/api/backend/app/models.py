from enum import Enum
from typing import Any

from pydantic import BaseModel, ConfigDict, EmailStr, Field # type: ignore


class QuestionType(str, Enum):
    HOMESTYLE = "homestyle"
    PRODUCT = "product"


class ImageDocument(BaseModel):
    imageId: str = Field(..., min_length=1)
    src: str = Field(..., min_length=1)
    actualScore: int = Field(..., ge=0, le=2)
    imageType: QuestionType
    displayLabel: str | None = None
    filename: str | None = None
    questionNumber: int | None = None

    model_config = ConfigDict(extra="allow")


class PublicImage(BaseModel):
    imageId: str = Field(..., min_length=1)
    src: str = Field(..., min_length=1)
    imageType: QuestionType
    displayLabel: str | None = None

    model_config = ConfigDict(extra="forbid")


class SelectionOption(BaseModel):
    optionId: str = Field(..., min_length=1)
    label: str = Field(..., min_length=1)
    value: int = Field(..., ge=0, le=2)

    model_config = ConfigDict(extra="forbid")


class BoostOptionModel(BaseModel):
    optionId: str = Field(..., min_length=1)
    label: str = Field(..., min_length=1)
    boost: float = Field(..., ge=0.0)

    model_config = ConfigDict(extra="forbid")


class QuestionDocument(BaseModel):
    id: str | None = Field(default=None, alias="id")
    questionNumber: int = Field(..., ge=1)
    questionType: QuestionType
    images: list[ImageDocument] = Field(..., min_length=1)

    model_config = ConfigDict(from_attributes=True, populate_by_name=True)


class PublicQuestion(BaseModel):
    questionNumber: int = Field(..., ge=1)
    questionType: QuestionType
    images: list[PublicImage] = Field(..., min_length=1)

    model_config = ConfigDict(extra="forbid")


class SelectionQuestionDocument(BaseModel):
    id: str | None = Field(default=None, alias="id")
    questionNumber: int = Field(..., ge=1)
    kind: str = Field(..., pattern="^(selection)$")
    prompt: str = Field(..., min_length=3)
    correctOptionId: str = Field(..., min_length=1)
    options: list[SelectionOption] = Field(..., min_length=1)

    model_config = ConfigDict(from_attributes=True, populate_by_name=True)


class BoostQuestionDocument(BaseModel):
    id: str | None = Field(default=None, alias="id")
    questionNumber: int = Field(..., ge=1)
    kind: str = Field(..., pattern="^(boost)$")
    prompt: str = Field(..., min_length=3)
    options: list[BoostOptionModel] = Field(..., min_length=1)

    model_config = ConfigDict(from_attributes=True, populate_by_name=True)


class PublicSelectionQuestion(BaseModel):
    questionNumber: int
    kind: str = Field(..., pattern="^(selection)$")
    prompt: str
    options: list[SelectionOption]

    model_config = ConfigDict(extra="forbid")


class PublicBoostQuestion(BaseModel):
    questionNumber: int
    kind: str = Field(..., pattern="^(boost)$")
    prompt: str
    options: list[BoostOptionModel]

    model_config = ConfigDict(extra="forbid")


class ApplicantInput(BaseModel):
    name: str = Field(..., min_length=2)
    email: EmailStr
    age: int | None = Field(default=None, ge=13, le=120)
    role: str | None = Field(default=None, max_length=120)
    portfolioUrl: str | None = Field(default=None, max_length=240)

    model_config = ConfigDict(extra="forbid")


class ResponseItem(BaseModel):
    imageId: str = Field(..., min_length=1)
    selectedScore: int = Field(..., ge=0, le=2)

    model_config = ConfigDict(extra="forbid")


class SubmissionMetadata(BaseModel):
    startedAt: str | None = None
    submittedAt: str | None = None
    durationMs: int | None = Field(default=None, ge=0)
    userAgent: str | None = Field(default=None, max_length=400)

    model_config = ConfigDict(extra="allow")


class ChoiceResponse(BaseModel):
    questionNumber: int = Field(..., ge=1)
    optionId: str = Field(..., min_length=1)

    model_config = ConfigDict(extra='forbid')


class TestSubmissionRequest(BaseModel):
    sessionId: str = Field(..., min_length=6)
    applicant: ApplicantInput
    responses: list[ResponseItem] = Field(..., min_length=1)
    choices: list[ChoiceResponse] = Field(default_factory=list)
    metadata: SubmissionMetadata | None = None

    model_config = ConfigDict(extra="forbid")


class ApplicantSummary(BaseModel):
    name: str
    email: EmailStr

    model_config = ConfigDict(extra="forbid")


class ImageResult(BaseModel):
    imageId: str
    selectedScore: int | None = None
    actualScore: int | None = None
    error: float | None = None
    closeness: float | None = None
    excluded: bool = False

    model_config = ConfigDict(extra="forbid")


class QuestionResult(BaseModel):
    questionNumber: int
    questionType: QuestionType
    closeness: float | None
    mae: float | None
    images: list[ImageResult]

    model_config = ConfigDict(extra="forbid")


class SubmissionBand(str, Enum):
    EXCELLENT = "Excellent"
    GOOD = "Good"
    NEEDS_WORK = "Needs Work"

    @classmethod
    def from_score(cls, score: float) -> "SubmissionBand":
        if score >= 0.85:
            return cls.EXCELLENT
        if score >= 0.70:
            return cls.GOOD
        return cls.NEEDS_WORK


class SubmissionResult(BaseModel):
    applicant: ApplicantSummary
    attemptNumber: int
    sessionId: str
    overallCloseness: float
    overallClosenessPct: float
    band: SubmissionBand

    model_config = ConfigDict(extra="forbid")
