import { createContext, useContext, useMemo, useState } from "react";

export type QuestionType = "homestyle" | "product";

export type ApplicantInfo = {
  name: string;
  email: string;
  age?: number;
  role?: string;
  portfolioUrl?: string;
};

export type DesignTestImage = {
  imageId: string;
  src: string;
  imageType: QuestionType;
  displayLabel?: string | null;
};

export type ImageQuestion = {
  kind: "image";
  questionNumber: number;
  questionType: QuestionType;
  prompt?: string;
  images: DesignTestImage[];
};

export type ChoiceOption = {
  optionId: string;
  label: string;
  description?: string;
  value: number;
};

export type ChoiceQuestion = {
  kind: "selection";
  questionNumber: number;
  prompt: string;
  options: ChoiceOption[];
};

export type BoostOption = {
  optionId: string;
  label: string;
  description?: string;
  boost: number;
};

export type BoostQuestion = {
  kind: "boost";
  questionNumber: number;
  prompt: string;
  options: BoostOption[];
};

export type TestQuestion = ImageQuestion | ChoiceQuestion | BoostQuestion;

export type SubmissionBand = "Excellent" | "Good" | "Needs Work";

export type SubmissionResult = {
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

export type TestSessionContextValue = {
  applicant: ApplicantInfo | null;
  sessionId: string | null;
  questions: TestQuestion[];
  imageResponses: Record<string, number>;
  choiceResponses: Record<number, string>;
  results: SubmissionResult | null;
  startedAt: number | null;
  initializeSession: (info: ApplicantInfo) => string;
  setQuestions: (questions: TestQuestion[]) => void;
  recordImageResponse: (imageId: string, value: number) => void;
  recordChoiceResponse: (questionNumber: number, optionId: string) => void;
  setResults: (result: SubmissionResult | null) => void;
  resetSession: () => void;
};

const TestSessionContext = createContext<TestSessionContextValue | undefined>(
  undefined
);

const generateSessionId = () =>
  typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `session_${Date.now()}_${Math.random().toString(16).slice(2)}`;

export function TestSessionProvider({ children }: { children: React.ReactNode }) {
  const [applicant, setApplicant] = useState<ApplicantInfo | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [questions, setQuestionsState] = useState<TestQuestion[]>([]);
  const [imageResponses, setImageResponses] = useState<Record<string, number>>({});
  const [choiceResponses, setChoiceResponses] = useState<Record<number, string>>({});
  const [results, setResultsState] = useState<SubmissionResult | null>(null);
  const [startedAt, setStartedAt] = useState<number | null>(null);

  const initializeSession = (info: ApplicantInfo) => {
    const newSessionId = generateSessionId();
    setApplicant(info);
    setSessionId(newSessionId);
    setQuestionsState([]);
    setImageResponses({});
    setChoiceResponses({});
    setResultsState(null);
    setStartedAt(Date.now());
    return newSessionId;
  };

  const recordImageResponse = (imageId: string, value: number) => {
    setImageResponses((prev) => ({ ...prev, [imageId]: value }));
  };

  const recordChoiceResponse = (questionNumber: number, optionId: string) => {
    setChoiceResponses((prev) => ({ ...prev, [questionNumber]: optionId }));
  };

  const resetSession = () => {
    setApplicant(null);
    setSessionId(null);
    setQuestionsState([]);
    setImageResponses({});
    setChoiceResponses({});
    setResultsState(null);
    setStartedAt(null);
  };

  const value = useMemo<TestSessionContextValue>(
    () => ({
      applicant,
      sessionId,
      questions,
      imageResponses,
      choiceResponses,
      results,
      startedAt,
      initializeSession,
      setQuestions: setQuestionsState,
      recordImageResponse,
      recordChoiceResponse,
      setResults: setResultsState,
      resetSession
    }),
    [
      applicant,
      sessionId,
      questions,
      imageResponses,
      choiceResponses,
      results,
      startedAt
    ]
  );

  return (
    <TestSessionContext.Provider value={value}>
      {children}
    </TestSessionContext.Provider>
  );
}

export function useTestSession(): TestSessionContextValue {
  const context = useContext(TestSessionContext);
  if (!context) {
    throw new Error("useTestSession must be used within a TestSessionProvider");
  }
  return context;
}
