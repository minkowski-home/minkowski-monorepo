import { Router } from "express";
import { z } from "zod";

import { getCollection } from "../db/mongo";

type QuestionType = "homestyle" | "product";

type ImageDocument = {
  imageId: string;
  src: string;
  actualScore: number;
  imageType: QuestionType;
  displayLabel?: string | null;
  filename?: string | null;
  questionNumber?: number | null;
};

type QuestionDocument = {
  questionNumber: number;
  questionType: QuestionType;
  images: ImageDocument[];
};

type SelectionOption = {
  optionId: string;
  label: string;
  value: number;
};

type BoostOption = {
  optionId: string;
  label: string;
  boost: number;
};

type SelectionQuestionDocument = {
  questionNumber: number;
  kind: "selection";
  prompt: string;
  correctOptionId: string;
  options: SelectionOption[];
};

type BoostQuestionDocument = {
  questionNumber: number;
  kind: "boost";
  prompt: string;
  options: BoostOption[];
};

type SubmissionBand = "Excellent" | "Good" | "Needs Work";

type SubmissionResult = {
  applicant: {
    name: string;
    email: string;
  };
  attemptNumber: number;
  sessionId: string;
  overallCloseness: number;
  overallClosenessPct: number;
  band: SubmissionBand;
};

const ApplicantInputSchema = z
  .object({
    name: z.string().min(2),
    email: z.string().email(),
    age: z.number().int().min(13).max(120).optional(),
    role: z.string().max(120).optional(),
    portfolioUrl: z.string().max(240).optional()
  })
  .strict();

const ResponseItemSchema = z
  .object({
    imageId: z.string().min(1),
    selectedScore: z.number().int().min(0).max(2)
  })
  .strict();

const ChoiceResponseSchema = z
  .object({
    questionNumber: z.number().int().min(1),
    optionId: z.string().min(1)
  })
  .strict();

const SubmissionMetadataSchema = z
  .object({
    startedAt: z.string().optional(),
    submittedAt: z.string().optional(),
    durationMs: z.number().int().min(0).optional(),
    userAgent: z.string().max(400).optional()
  })
  .passthrough();

const TestSubmissionRequestSchema = z
  .object({
    sessionId: z.string().min(6),
    applicant: ApplicantInputSchema,
    responses: z.array(ResponseItemSchema).min(1),
    choices: z.array(ChoiceResponseSchema).default([]),
    metadata: SubmissionMetadataSchema.optional()
  })
  .strict();

const router = Router();

const mean = (values: number[]): number => {
  if (!values.length) {
    return 0;
  }
  const total = values.reduce((sum, value) => sum + value, 0);
  return total / values.length;
};

const computeBand = (score: number): SubmissionBand => {
  if (score >= 0.85) {
    return "Excellent";
  }
  if (score >= 0.7) {
    return "Good";
  }
  return "Needs Work";
};

router.get("/questions", async (_req, res) => {
  try {
    const questionsCollection = await getCollection<QuestionDocument>("design_test_questions");
    const questions = await questionsCollection
      .find({}, { projection: { _id: 0 } })
      .sort({ questionNumber: 1 })
      .toArray();

    const payload = questions.map((question) => ({
      questionNumber: question.questionNumber,
      questionType: question.questionType,
      images: question.images.map((image) => ({
        imageId: image.imageId,
        src: image.src,
        imageType: image.imageType,
        displayLabel: image.displayLabel ?? null
      }))
    }));

    res.json(payload);
  } catch (error) {
    res.status(500).json({ detail: "Failed to load questions." });
  }
});

router.get("/supplemental", async (_req, res) => {
  try {
    const supplementalCollection = await getCollection<
      SelectionQuestionDocument | BoostQuestionDocument
    >("supplemental_questions");
    const docs = await supplementalCollection
      .find({}, { projection: { _id: 0 } })
      .sort({ questionNumber: 1 })
      .toArray();

    const payload = docs.map((doc) => {
      if (doc.kind === "selection") {
        return {
          questionNumber: doc.questionNumber,
          kind: "selection",
          prompt: doc.prompt,
          options: doc.options
        };
      }
      return {
        questionNumber: doc.questionNumber,
        kind: "boost",
        prompt: doc.prompt,
        options: doc.options
      };
    });

    res.json(payload);
  } catch (error) {
    res.status(500).json({ detail: "Failed to load supplemental questions." });
  }
});

router.post("/submit", async (req, res) => {
  const parsed = TestSubmissionRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ detail: "Invalid submission payload.", issues: parsed.error.issues });
    return;
  }

  const payload = parsed.data;
  const now = new Date();
  const normalizedEmail = payload.applicant.email.toLowerCase();

  try {
    const attemptsCollection = await getCollection<Record<string, unknown>>("attempts");
    const existingAttempt = await attemptsCollection.findOne({
      sessionId: payload.sessionId,
      applicantEmail: normalizedEmail
    });

    if (existingAttempt) {
      const result: SubmissionResult = {
        applicant: {
          name: String(existingAttempt.applicantName ?? payload.applicant.name),
          email: String(existingAttempt.applicantEmail ?? normalizedEmail)
        },
        attemptNumber: Number(existingAttempt.attemptNumber ?? 1),
        sessionId: String(existingAttempt.sessionId ?? payload.sessionId),
        overallCloseness: Number(existingAttempt.overallCloseness ?? 0),
        overallClosenessPct: Number(existingAttempt.overallClosenessPct ?? 0),
        band: (existingAttempt.band as SubmissionBand) ?? "Needs Work"
      };
      res.json(result);
      return;
    }

    const applicantsCollection = await getCollection<Record<string, unknown>>("applicants");
    const existingApplicant = await applicantsCollection.findOne({ email: normalizedEmail });
    const attemptNumber = existingApplicant
      ? Number(existingApplicant.attemptCount ?? 0) + 1
      : 1;

    const responseMap = new Map(payload.responses.map((item) => [item.imageId, item.selectedScore]));
    const choiceMap = new Map(payload.choices.map((item) => [item.questionNumber, item.optionId]));

    if (!choiceMap.has(9) || !choiceMap.has(10)) {
      res.status(400).json({ detail: "Additional questions 9 and 10 are required." });
      return;
    }

    const supplementalCollection = await getCollection<
      SelectionQuestionDocument | BoostQuestionDocument
    >("supplemental_questions");
    const supplementalDocs = await supplementalCollection.find({}, { projection: { _id: 0 } }).toArray();
    const supplementalMap = new Map<number, SelectionQuestionDocument | BoostQuestionDocument>();
    for (const doc of supplementalDocs) {
      supplementalMap.set(doc.questionNumber, doc);
    }

    const questionsCollection = await getCollection<QuestionDocument>("design_test_questions");
    const questions = await questionsCollection
      .find({}, { projection: { _id: 0 } })
      .sort({ questionNumber: 1 })
      .toArray();

    const imageIds = Array.from(responseMap.keys());
    const imagesCollection = await getCollection<ImageDocument>("images");
    const images = await imagesCollection
      .find({ imageId: { $in: imageIds } }, { projection: { _id: 0 } })
      .toArray();
    const actualScoreMap = new Map(images.map((image) => [image.imageId, image]));

    const questionResults: Array<Record<string, unknown>> = [];
    const allCloseness: number[] = [];
    const allErrors: number[] = [];

    for (const question of questions) {
      const imagesResult: Array<Record<string, unknown>> = [];
      const questionCloseness: number[] = [];
      const questionErrors: number[] = [];

      for (const image of question.images) {
        const response = responseMap.get(image.imageId);
        const actual = actualScoreMap.get(image.imageId);

        if (response === undefined || !actual) {
          imagesResult.push({
            imageId: image.imageId,
            selectedScore: response ?? null,
            actualScore: actual?.actualScore ?? null,
            excluded: true
          });
          continue;
        }

        const error = Math.abs(response - actual.actualScore);
        const closeness = 1 - error / 2;
        imagesResult.push({
          imageId: image.imageId,
          selectedScore: response,
          actualScore: actual.actualScore,
          error,
          closeness,
          excluded: false
        });

        questionCloseness.push(closeness);
        questionErrors.push(error);
        allCloseness.push(closeness);
        allErrors.push(error);
      }

      questionResults.push({
        questionNumber: question.questionNumber,
        questionType: question.questionType,
        closeness: questionCloseness.length ? mean(questionCloseness) : null,
        mae: questionErrors.length ? mean(questionErrors) : null,
        images: imagesResult
      });
    }

    const selectionDoc = supplementalMap.get(9);
    if (!selectionDoc || selectionDoc.kind !== "selection") {
      res.status(500).json({ detail: "Selection question metadata missing." });
      return;
    }

    const selectionOption = selectionDoc.options.find(
      (option) => option.optionId === choiceMap.get(9)
    );
    const correctSelection = selectionDoc.options.find(
      (option) => option.optionId === selectionDoc.correctOptionId
    );

    if (!selectionOption || !correctSelection) {
      res.status(400).json({ detail: "Invalid selection for question 9." });
      return;
    }

    const scenarioError = Math.abs(selectionOption.value - correctSelection.value);
    const scenarioCloseness = 1 - scenarioError / 2;
    allErrors.push(scenarioError);
    allCloseness.push(scenarioCloseness);

    const scenarioSummary = {
      questionNumber: 9,
      selectedOption: selectionOption.optionId,
      selectedLabel: selectionOption.label,
      selectedValue: selectionOption.value,
      correctValue: correctSelection.value,
      error: scenarioError,
      closeness: scenarioCloseness
    };

    const baseCloseness = mean(allCloseness);
    const mae = mean(allErrors);

    const boostDoc = supplementalMap.get(10);
    if (!boostDoc || boostDoc.kind !== "boost") {
      res.status(500).json({ detail: "Boost question metadata missing." });
      return;
    }

    const boostOption = boostDoc.options.find((option) => option.optionId === choiceMap.get(10));
    if (!boostOption) {
      res.status(400).json({ detail: "Invalid selection for question 10." });
      return;
    }

    const boostMultiplier = 1 + boostOption.boost;
    const overallCloseness = Math.min(baseCloseness * boostMultiplier, 1.0);
    const overallClosenessPct = Math.round(overallCloseness * 1000) / 10;
    const band = computeBand(overallCloseness);

    const result: SubmissionResult = {
      applicant: {
        name: payload.applicant.name,
        email: payload.applicant.email
      },
      attemptNumber,
      sessionId: payload.sessionId,
      overallCloseness,
      overallClosenessPct,
      band
    };

    const roleSummary = {
      questionNumber: 10,
      selectedOption: boostOption.optionId,
      selectedLabel: boostOption.label,
      boost: boostOption.boost
    };

    await attemptsCollection.insertOne({
      applicantEmail: normalizedEmail,
      applicantName: payload.applicant.name,
      attemptNumber,
      sessionId: payload.sessionId,
      submittedAt: now,
      overallCloseness: result.overallCloseness,
      overallClosenessPct: result.overallClosenessPct,
      baseCloseness,
      mae,
      band: result.band,
      imageQuestions: questionResults,
      scenarioQuestion: scenarioSummary,
      rolePreference: roleSummary,
      boostMultiplier,
      metadata: payload.metadata ?? null,
      submittedAtIso: now.toISOString()
    });

    const updateResult = await applicantsCollection.updateOne(
      { email: normalizedEmail },
      {
        $set: {
          name: payload.applicant.name,
          updatedAt: now,
          attemptCount: attemptNumber
        },
        $setOnInsert: {
          email: normalizedEmail,
          createdAt: now
        }
      },
      { upsert: true }
    );

    if (updateResult.matchedCount === 0 && !updateResult.upsertedId) {
      res.status(500).json({ detail: "Failed to upsert applicant document." });
      return;
    }

    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ detail: "Failed to submit results." });
  }
});

export default router;
