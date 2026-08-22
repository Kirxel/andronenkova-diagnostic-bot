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
  | "contact";

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

export type ContactQuestion = {
  id: QuestionId;
  kind: "contact";
  title: string;
  description?: string;
  phoneLabel: string;
  phonePlaceholder: string;
  maxLabel: string;
  maxPlaceholder: string;
};

export type Question =
  | ChoiceQuestion
  | MultiChoiceQuestion
  | NumberQuestion
  | ContactQuestion;

export type SingleValueDraftAnswer = {
  value: string;
  detail?: string;
};

export type MultiValueDraftAnswer = {
  values: string[];
};

export type ContactDraftAnswer = {
  phone?: string;
  maxProfile?: string;
};

export type DraftAnswer =
  | SingleValueDraftAnswer
  | MultiValueDraftAnswer
  | ContactDraftAnswer;

export type AnswerMap = Partial<Record<QuestionId, DraftAnswer>>;

export type SubmissionAnswers = Partial<
  Record<QuestionId | "contactPhone" | "contactMax", string | number | string[]>
>;

export type DiagnosticSubmissionPayload = {
  initData: string;
  startParam: string | null;
  answers: SubmissionAnswers;
};
