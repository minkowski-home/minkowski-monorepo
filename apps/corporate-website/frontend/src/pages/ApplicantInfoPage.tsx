import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ApplicantInfo,
  DesignTestImage,
  ImageQuestion,
  QuestionType,
  TestQuestion,
  useTestSession
} from "../context/TestSessionContext";
import { brandColors, typography } from "../styles/brand";

const initialForm: ApplicantInfo = {
  name: "",
  email: "",
  age: undefined,
  role: undefined,
  portfolioUrl: undefined
};

type ApiQuestion = {
  questionNumber: number;
  questionType: QuestionType;
  images: DesignTestImage[];
};

type ApiSupplementalSelection = {
  questionNumber: number;
  kind: "selection";
  prompt: string;
  correctOptionId: string;
  options: Array<{ optionId: string; label: string; value: number }>;
};

type ApiSupplementalBoost = {
  questionNumber: number;
  kind: "boost";
  prompt: string;
  options: Array<{ optionId: string; label: string; boost: number }>;
};

export default function ApplicantInfoPage() {
  const navigate = useNavigate();
  const { initializeSession, setQuestions } = useTestSession();
  const [formState, setFormState] = useState(initialForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const handleChange = <K extends keyof ApplicantInfo>(field: K, value: ApplicantInfo[K]) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const validate = () => {
    const nextErrors: Record<string, string> = {};
    if (!formState.name.trim()) {
      nextErrors.name = "Name is required.";
    }
    if (!formState.email.trim()) {
      nextErrors.email = "Email is required.";
    } else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(formState.email.trim())) {
      nextErrors.email = "Enter a valid email address.";
    }
    return nextErrors;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      setIsLoading(true);
      setFetchError(null);
      const sessionId = initializeSession({
        name: formState.name.trim(),
        email: formState.email.trim().toLowerCase(),
        age: formState.age ?? undefined,
        role: formState.role?.trim() || undefined,
        portfolioUrl: formState.portfolioUrl?.trim() || undefined
      });

      const [questionResponse, supplementalResponse] = await Promise.all([
        fetch("/api/design-test/questions"),
        fetch("/api/design-test/supplemental")
      ]);

      if (!questionResponse.ok) {
        throw new Error(`Failed to load test: ${questionResponse.status}`);
      }

      if (!supplementalResponse.ok) {
        throw new Error(`Failed to load supplemental questions: ${supplementalResponse.status}`);
      }

      const questions = (await questionResponse.json()) as ApiQuestion[];
      if (!Array.isArray(questions) || questions.length === 0) {
        throw new Error("No questions were returned from the server.");
      }

      const imageQuestions: ImageQuestion[] = questions.map((question) => {
        if (question.images.length !== 3) {
          throw new Error(
            `Question ${question.questionNumber} is missing assets. Please contact the administrator.`
          );
        }
        return {
          kind: "image",
          questionNumber: question.questionNumber,
          questionType: question.questionType,
          images: question.images
        };
      });

      const supplementalData = (await supplementalResponse.json()) as Array<
        ApiSupplementalSelection | ApiSupplementalBoost
      >;

      const supplementalQuestionsMapped: TestQuestion[] = supplementalData.map((item) => {
        if (item.kind === "selection") {
          return {
            kind: "selection",
            questionNumber: item.questionNumber,
            prompt: item.prompt,
            options: item.options.map((option) => ({
              optionId: option.optionId,
              label: option.label,
              value: option.value
            }))
          };
        }

        return {
          kind: "boost",
          questionNumber: item.questionNumber,
          prompt: item.prompt,
          options: item.options.map((option) => ({
            optionId: option.optionId,
            label: option.label,
            boost: option.boost
          }))
        };
      });

      const fullQuestionSet: TestQuestion[] = [...imageQuestions, ...supplementalQuestionsMapped].sort(
        (a, b) => a.questionNumber - b.questionNumber
      );

      setQuestions(fullQuestionSet);
      navigate("/test/1", { replace: true });
    } catch (error) {
      console.error(error);
      setFetchError(
        error instanceof Error
          ? error.message
          : "Unable to start the test. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section style={styles.section}>
      <header style={styles.header}>
        <h2 style={styles.title}>Applicant Information</h2>
        <p style={styles.subtitle}>
          We verify every submission before unlocking the assessment. Provide a few details so we
          can record your attempt.
        </p>
      </header>

      <form style={styles.form} onSubmit={handleSubmit} noValidate>
        <div style={styles.row}>
          <label style={styles.label} htmlFor="name">
            Full name
          </label>
          <input
            id="name"
            type="text"
            value={formState.name}
            onChange={(event) => handleChange("name", event.target.value)}
            style={{ ...styles.input, borderColor: errors.name ? brandColors.primary : "#d5d2cb" }}
            autoComplete="name"
            required
          />
          {errors.name ? <span style={styles.error}>{errors.name}</span> : null}
        </div>

        <div style={styles.row}>
          <label style={styles.label} htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={formState.email}
            onChange={(event) => handleChange("email", event.target.value)}
            style={{ ...styles.input, borderColor: errors.email ? brandColors.primary : "#d5d2cb" }}
            autoComplete="email"
            required
          />
          {errors.email ? <span style={styles.error}>{errors.email}</span> : null}
        </div>

        <div style={styles.rowGroup}>
          <div style={styles.column}>
            <label style={styles.label} htmlFor="age">
              Age (optional)
            </label>
            <input
              id="age"
              type="number"
              min={13}
              max={120}
              value={formState.age ?? ""}
              onChange={(event) => {
                const nextValue = event.target.value ? Number(event.target.value) : undefined;
                handleChange("age", nextValue);
              }}
              style={styles.input}
            />
          </div>
          <div style={styles.column}>
            <label style={styles.label} htmlFor="role">
              Current role (optional)
            </label>
            <input
              id="role"
              type="text"
              value={formState.role ?? ""}
              onChange={(event) =>
                handleChange("role", event.target.value ? event.target.value : undefined)
              }
              style={styles.input}
            />
          </div>
        </div>

        <div style={styles.row}>
          <label style={styles.label} htmlFor="portfolioUrl">
            Portfolio URL (optional)
          </label>
          <input
            id="portfolioUrl"
            type="url"
            value={formState.portfolioUrl ?? ""}
            onChange={(event) =>
              handleChange(
                "portfolioUrl",
                event.target.value ? event.target.value : undefined
              )
            }
            style={styles.input}
            placeholder="https://"
          />
        </div>

        {fetchError ? <div style={styles.errorCallout}>{fetchError}</div> : null}

        <button type="submit" style={styles.submit} disabled={isLoading}>
          {isLoading ? "Loading questions…" : "Continue to test"}
        </button>
      </form>
    </section>
  );
}

const styles: Record<string, React.CSSProperties> = {
  section: {
    display: "grid",
    gap: "var(--space-md)",
    padding: "var(--space-lg) 0",
    maxWidth: "720px"
  },
  header: {
    display: "grid",
    gap: "0.5rem"
  },
  title: {
    fontFamily: typography.heading,
    fontSize: "2rem",
    margin: 0,
    color: brandColors.text
  },
  subtitle: {
    margin: 0,
    color: brandColors.muted,
    lineHeight: 1.5
  },
  form: {
    display: "grid",
    gap: "1.5rem",
    padding: "1.75rem",
    borderRadius: "var(--radius-lg)",
    backgroundColor: "rgba(243, 242, 236, 0.65)",
    border: "1px solid rgba(32, 24, 24, 0.08)"
  },
  row: {
    display: "grid",
    gap: "0.5rem"
  },
  rowGroup: {
    display: "grid",
    gap: "1rem",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))"
  },
  column: {
    display: "grid",
    gap: "0.5rem"
  },
  label: {
    fontFamily: typography.heading,
    fontSize: "0.85rem",
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    color: brandColors.muted
  },
  input: {
    fontSize: "1rem",
    padding: "0.75rem 1rem",
    borderRadius: "var(--radius-md)",
    border: "1.5px solid #d5d2cb",
    backgroundColor: "#fbfbf8",
    fontFamily: typography.body,
    color: brandColors.text
  },
  error: {
    color: brandColors.primary,
    fontSize: "0.8rem"
  },
  errorCallout: {
    padding: "0.85rem 1rem",
    borderRadius: "var(--radius-md)",
    backgroundColor: "rgba(141, 39, 41, 0.12)",
    color: brandColors.primary,
    fontSize: "0.9rem"
  },
  submit: {
    justifySelf: "flex-start",
    border: "none",
    borderRadius: "var(--radius-md)",
    backgroundColor: brandColors.primary,
    color: brandColors.background,
    fontFamily: typography.heading,
    fontWeight: 600,
    fontSize: "1rem",
    padding: "0.75rem 1.5rem",
    cursor: "pointer"
  }
};
