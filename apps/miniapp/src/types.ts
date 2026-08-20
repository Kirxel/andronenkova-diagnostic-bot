export type QuestionId =
  | "sex"
  | "ageRange"
  | "heightCm"
  | "weightKg"
  | "goal"
  | "injuries"
  | "experience"
  | "nutrition"
  | "wellbeing"
  | "labTests"
  | "sleep"
  | "readiness"
  | "contactMethod";

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

export type MultiChoiceQuestion = {
  id: QuestionId;
  kind: "multiChoice";
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

export type Question = ChoiceQuestion | MultiChoiceQuestion | NumberQuestion;

export type SingleValueDraftAnswer = {
  value: string;
  detail?: string;
};

export type MultiValueDraftAnswer = {
  values: string[];
};

export type DraftAnswer = SingleValueDraftAnswer | MultiValueDraftAnswer;

export type AnswerMap = Partial<Record<QuestionId, DraftAnswer>>;

export type SubmissionAnswers = Partial<
  Record<QuestionId | "contactValue", string | number | string[]>
>;

export type DiagnosticSubmissionPayload = {
  initData: string;
  startParam: string | null;
  answers: SubmissionAnswers;
};
