export type QuestionId =
  | "sex"
  | "ageRange"
  | "weightKg"
  | "goal"
  | "injuries"
  | "experience"
  | "nutrition"
  | "wellbeing"
  | "labTests"
  | "sleep"
  | "readiness";

export type QuestionOption = {
  value: string;
  label: string;
  hint?: string;
  detailLabel?: string;
  detailPlaceholder?: string;
  detailRequired?: boolean;
};

export type ChoiceQuestion = {
  id: QuestionId;
  kind: "choice";
  title: string;
  description?: string;
  options: QuestionOption[];
};

export type NumberQuestion = {
  id: QuestionId;
  kind: "number";
  title: string;
  description?: string;
  min: number;
  max: number;
  placeholder: string;
  unit: string;
};

export type Question = ChoiceQuestion | NumberQuestion;

export type DraftAnswer = {
  value: string;
  detail?: string;
};

export type AnswerMap = Partial<Record<QuestionId, DraftAnswer>>;

export type SubmissionAnswers = Partial<Record<QuestionId, string | number>>;

export type DiagnosticSubmissionPayload = {
  initData: string;
  startParam: string | null;
  answers: SubmissionAnswers;
};
