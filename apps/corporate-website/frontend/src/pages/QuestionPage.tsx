import { FormEvent, useEffect, useMemo, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import {
  BoostOption,
  ChoiceOption,
  DesignTestImage,
  ImageQuestion,
  SubmissionResult,
  TestQuestion,
  useTestSession
} from "../context/TestSessionContext";
import { brandColors, typography } from "../styles/brand";

const SCALE_VALUES = [0, 1, 2] as const;

export default function QuestionPage() {
  const { questionNumber } = useParams<{ questionNumber: string }>();
  const navigate = useNavigate();
  const {
    applicant,
    sessionId,
    questions,
    imageResponses,
    choiceResponses,
    recordImageResponse,
    recordChoiceResponse,
    setResults,
    startedAt
  } = useTestSession();

  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCompletionError, setShowCompletionError] = useState(false);
  const [previewImage, setPreviewImage] = useState<{ src: string; alt: string } | null>(null);

  const numericQuestionNumber = useMemo(() => {
    const parsed = Number(questionNumber);
    return Number.isFinite(parsed) && parsed >= 1 ? parsed : null;
  }, [questionNumber]);

  const question = useMemo<TestQuestion | undefined>(
    () => questions.find((entry) => entry.questionNumber === numericQuestionNumber),
    [questions, numericQuestionNumber]
  );

  useEffect(() => {
    if (!applicant || !sessionId) {
      return;
    }
    const beforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "Your progress will be lost.";
    };
    window.addEventListener("beforeunload", beforeUnload);
    return () => window.removeEventListener("beforeunload", beforeUnload);
  }, [applicant, sessionId]);

  useEffect(() => {
    setResults(null);
  }, [setResults]);

  useEffect(() => {
    if (!previewImage) {
      return;
    }
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setPreviewImage(null);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [previewImage]);

  if (!applicant || !sessionId) {
    return <Navigate to="/start" replace />;
  }

  if (!numericQuestionNumber || !question) {
    return <Navigate to="/test/1" replace />;
  }

  const totalQuestions = questions.length;
  const currentIndex = questions.findIndex((item) => item.questionNumber === question.questionNumber);
  const hasPrevious = currentIndex > 0;
  const hasNext = currentIndex < totalQuestions - 1;

  const isQuestionComplete = (() => {
    if (question.kind === "image") {
      return question.images.every((image) =>
        Object.prototype.hasOwnProperty.call(imageResponses, image.imageId)
      );
    }
    return Boolean(choiceResponses[question.questionNumber]);
  })();

  const handleSelection = (image: DesignTestImage, value: number) => {
    recordImageResponse(image.imageId, value);
    setShowCompletionError(false);
  };

  const handleChoiceSelection = (questionNumber: number, optionId: string) => {
    recordChoiceResponse(questionNumber, optionId);
    setShowCompletionError(false);
  };

  const handleNavigate = (targetQuestionNumber: number) => {
    if (!isQuestionComplete) {
      setShowCompletionError(true);
      return;
    }
    navigate(`/test/${targetQuestionNumber}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!isQuestionComplete) {
      setShowCompletionError(true);
      return;
    }

    try {
      setIsSubmitting(true);
      setSubmitError(null);

      const responsePayload = Object.entries(imageResponses).map(([imageId, selectedScore]) => ({
        imageId,
        selectedScore
      }));

      const choicePayload = Object.entries(choiceResponses).map(
        ([questionNumber, optionId]) => ({
          questionNumber: Number(questionNumber),
          optionId
        })
      );

      const metadata = {
        startedAt: startedAt ? new Date(startedAt).toISOString() : undefined,
        submittedAt: new Date().toISOString(),
        durationMs: startedAt ? Date.now() - startedAt : undefined,
        userAgent: typeof navigator !== "undefined" ? navigator.userAgent : undefined
      };

      const response = await fetch("/api/design-test/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          sessionId,
          applicant,
          responses: responsePayload,
          choices: choicePayload,
          metadata
        })
      });

      if (!response.ok) {
        throw new Error(`Submission failed with status ${response.status}`);
      }

      const result = (await response.json()) as SubmissionResult;
      setResults(result);
      navigate("/results", { replace: true });
    } catch (error) {
      console.error(error);
      setSubmitError(
        error instanceof Error ? error.message : "Unable to submit results. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderLikert = (image: DesignTestImage, index: number) => {
    const selected = imageResponses[image.imageId];

    return (
      <fieldset key={image.imageId} style={styles.imageCard} className="question-card">
        <legend style={styles.legend}>
          <span style={styles.imageLabel}>Option {index + 1}</span>
        </legend>
        <button
          type="button"
          style={styles.imageButton}
          onClick={() =>
            setPreviewImage({
              src: image.src,
              alt: `Enlarged preview of ${image.displayLabel ?? image.imageId}`
            })
          }
        >
          <img
            src={image.src}
            alt={`Question ${question.questionNumber} option`}
            style={styles.imageAsset}
            loading="lazy"
            onError={(event) => {
              (event.target as HTMLImageElement).style.visibility = "hidden";
            }}
          />
        </button>
        <div style={styles.likertRow} role="radiogroup" aria-label="Likert scale">
          {SCALE_VALUES.map((value) => {
            const inputId = `${image.imageId}-${value}`;
            return (
              <label key={value} style={styles.likertOption} className="likert-option">
                <input
                  id={inputId}
                  type="radio"
                  name={image.imageId}
                  value={value}
                  checked={selected === value}
                  onChange={() => handleSelection(image, value)}
                />
                <span>{value}</span>
              </label>
            );
          })}
        </div>
      </fieldset>
    );
  };

  const renderSelectionQuestion = (options: ChoiceOption[]) => {
    const selected = choiceResponses[question.questionNumber];
    return (
      <div style={styles.choiceList}>
        {options.map((option) => (
          <label key={option.optionId} style={styles.choiceCard} className="choice-card">
            <span style={styles.choiceHeader}>
              <input
                type="radio"
                name={`question-${question.questionNumber}`}
                value={option.optionId}
                checked={selected === option.optionId}
                onChange={() => handleChoiceSelection(question.questionNumber, option.optionId)}
              />
              <span style={styles.choiceLabel}>{option.label}</span>
            </span>
          </label>
        ))}
      </div>
    );
  };

  const renderBoostQuestion = (options: BoostOption[]) => {
    const transformed = options.map<ChoiceOption>((option) => ({
      optionId: option.optionId,
      label: option.label,
      value: 0
    }));
    return renderSelectionQuestion(transformed);
  };

  const renderQuestionBody = () => {
    switch (question.kind) {
      case "image":
        return (
          <div style={styles.imageGrid}>
            {question.images.map((img, idx) => renderLikert(img, idx))}
          </div>
        );
      case "selection":
        return renderSelectionQuestion(question.options);
      case "boost":
        return renderBoostQuestion(question.options);
      default:
        return null;
    }
  };

  const questionTypeLabel = question.kind === "image"
    ? question.questionType === "homestyle"
      ? "Homestyle"
      : "Product"
    : question.kind === "selection"
    ? "Scenario"
    : "Role Preference";

  return (
    <form style={styles.form} onSubmit={handleSubmit}>
      <header style={styles.header}>
        <div style={styles.breadcrumb}>
          <span style={styles.badge}>Question {question.questionNumber}</span>
          <span style={styles.meta}>
            {questionTypeLabel}
            {question.kind === "image" ? ` · ${question.images.length} images` : ""}
          </span>
        </div>
        {question.kind === "image" ? (
          <p style={styles.instructions}>
            Select a score for each image. Use the 0‑2 scale to indicate how well the asset aligns
            with Minkowski standards (0 = reject immediately, 2 = perfect fit).
          </p>
        ) : (
          <p style={styles.instructionsEmphasis}>{question.prompt}</p>
        )}
      </header>

      {submitError ? <div style={styles.errorCallout}>{submitError}</div> : null}
      {showCompletionError && !submitError ? (
        <div style={styles.warningCallout}>
          {question.kind === "image"
            ? "Please rate all three images before continuing."
            : "Please select an option before continuing."}
        </div>
      ) : null}

      {renderQuestionBody()}

      <footer style={styles.footer}>
        {hasPrevious ? (
          <button
            type="button"
            style={{ ...styles.navButton, backgroundColor: "#f9f7f2", color: brandColors.text }}
            onClick={() => handleNavigate(questions[currentIndex - 1].questionNumber)}
          >
            Previous
          </button>
        ) : (
          <span />
        )}

        {hasNext ? (
          <button
            type="button"
            style={styles.navButton}
            onClick={() => handleNavigate(questions[currentIndex + 1].questionNumber)}
          >
            Next
          </button>
        ) : (
          <button type="submit" style={styles.navButton} disabled={isSubmitting}>
            {isSubmitting ? "Submitting…" : "Submit"}
          </button>
        )}
      </footer>

      {previewImage ? (
        <div style={styles.modalOverlay} role="dialog" aria-modal="true">
          <div style={styles.modalContent}>
            <button
              type="button"
              style={styles.modalClose}
              onClick={() => setPreviewImage(null)}
              aria-label="Close image preview"
            >
              ×
            </button>
            <img src={previewImage.src} alt={previewImage.alt} style={styles.modalImage} />
          </div>
        </div>
      ) : null}
    </form>
  );
}

const styles: Record<string, React.CSSProperties> = {
  form: {
    display: "grid",
    gap: "var(--space-md)",
    padding: "var(--space-lg) 0"
  },
  header: {
    display: "grid",
    gap: "0.75rem"
  },
  breadcrumb: {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
    flexWrap: "wrap"
  },
  badge: {
    fontFamily: typography.heading,
    fontSize: "0.75rem",
    letterSpacing: "0.22em",
    textTransform: "uppercase",
    color: brandColors.background,
    backgroundColor: brandColors.primary,
    borderRadius: "999px",
    padding: "0.35rem 0.8rem"
  },
  meta: {
    fontFamily: typography.heading,
    fontSize: "0.85rem",
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    color: brandColors.muted
  },
  instructions: {
    margin: 0,
    color: brandColors.muted,
    lineHeight: 1.6,
    fontSize: "1.05rem"
  },
  instructionsEmphasis: {
    margin: 0,
    color: brandColors.text,
    lineHeight: 1.6,
    fontSize: "1.2rem",
    fontFamily: typography.heading
  },
  imageGrid: {
    display: "grid",
    gap: "1.5rem",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))"
  },
  choiceList: {
    display: "grid",
    gap: "1.25rem"
  },
  choiceCard: {
    display: "grid",
    gap: "0.6rem",
    padding: "1.2rem 1.5rem",
    borderRadius: "var(--radius-lg)",
    backgroundColor: "#fbfbf8",
    border: "1px solid rgba(32, 24, 24, 0.08)",
    fontSize: "1rem"
  },
  choiceHeader: {
    display: "flex",
    alignItems: "flex-start",
    gap: "0.85rem",
    fontFamily: typography.heading
  },
  choiceLabel: {
    fontSize: "1.1rem",
    lineHeight: 1.4,
    color: brandColors.text
  },
  imageCard: {
    display: "grid",
    gap: "0.75rem",
    padding: "1rem",
    borderRadius: "var(--radius-lg)",
    backgroundColor: "#fbfbf8",
    border: "1px solid rgba(32, 24, 24, 0.08)",
    minHeight: "100%"
  },
  imageButton: {
    border: "none",
    padding: 0,
    background: "transparent",
    borderRadius: "var(--radius-md)",
    overflow: "hidden",
    cursor: "zoom-in",
    position: "relative",
    display: "block"
  },
  legend: {
    margin: 0,
    fontFamily: typography.heading,
    fontSize: "1rem",
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    color: brandColors.muted
  },
  imageLabel: {
    wordBreak: "break-word"
  },
  imageAsset: {
    width: "100%",
    height: "100%",
    objectFit: "cover"
  },
  likertRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: "0.35rem"
  },
  likertOption: {
    flex: 1,
    display: "grid",
    justifyItems: "center",
    gap: "0.35rem",
    fontFamily: typography.heading,
    fontSize: "0.95rem",
    letterSpacing: "0.08em",
    color: brandColors.text
  },
  footer: {
    marginTop: "var(--space-md)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "1rem"
  },
  navButton: {
    border: "none",
    borderRadius: "var(--radius-md)",
    backgroundColor: brandColors.primary,
    color: brandColors.background,
    fontFamily: typography.heading,
    fontWeight: 600,
    fontSize: "1rem",
    padding: "0.75rem 1.5rem",
    cursor: "pointer"
  },
  errorCallout: {
    padding: "0.85rem 1rem",
    borderRadius: "var(--radius-md)",
    backgroundColor: "rgba(141, 39, 41, 0.12)",
    color: brandColors.primary,
    fontSize: "0.9rem"
  },
  warningCallout: {
    padding: "0.85rem 1rem",
    borderRadius: "var(--radius-md)",
    backgroundColor: "rgba(32, 24, 24, 0.05)",
    color: brandColors.text,
    fontSize: "0.9rem"
  },
  modalOverlay: {
    position: "fixed",
    inset: 0,
    backgroundColor: "rgba(0, 0, 0, 0.55)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
    padding: "2rem"
  },
  modalContent: {
    position: "relative",
    backgroundColor: brandColors.surface,
    padding: "1.5rem",
    borderRadius: "var(--radius-lg)",
    maxWidth: "620px",
    width: "min(90vw, 620px)",
    boxShadow: "0 24px 48px rgba(0, 0, 0, 0.3)",
    display: "grid",
    justifyItems: "center",
    gap: "1rem"
  },
  modalImage: {
    width: "100%",
    maxHeight: "70vh",
    objectFit: "contain",
    borderRadius: "var(--radius-md)",
    backgroundColor: "rgba(32, 24, 24, 0.08)"
  },
  modalClose: {
    position: "absolute",
    top: "0.5rem",
    right: "0.75rem",
    border: "none",
    background: "transparent",
    fontSize: "1.75rem",
    color: brandColors.muted,
    cursor: "pointer",
    lineHeight: 1
  }
};
