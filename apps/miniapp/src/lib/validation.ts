import type {
  AnswerMap,
  ContactDraftAnswer,
  DraftAnswer,
  MultiValueDraftAnswer,
  Question,
  SubmissionAnswers
} from "../types";

function isMultiValueAnswer(answer: DraftAnswer | undefined): answer is MultiValueDraftAnswer {
  return Array.isArray((answer as MultiValueDraftAnswer | undefined)?.values);
}

function isContactAnswer(answer: DraftAnswer | undefined): answer is ContactDraftAnswer {
  return Boolean(
    answer &&
      typeof answer === "object" &&
      !("value" in answer) &&
      !("values" in answer)
  );
}

export function validateQuestion(
  question: Question,
  answer: DraftAnswer | undefined
): string | null {
  if (question.kind === "contact") {
    return null;
  }

  if (question.kind === "multiChoice") {
    if (!isMultiValueAnswer(answer) || answer.values.length === 0) {
      return "Выбери хотя бы один вариант, чтобы продолжить";
    }

    const hasInvalidValue = answer.values.some(
      (value) => !question.options.some((option) => option.value === value)
    );
    if (hasInvalidValue) {
      return "Выбери вариант из списка";
    }

    return null;
  }

  if (!answer || !("value" in answer) || !answer.value.trim()) {
    return "Выбери вариант, чтобы продолжить";
  }

  if (question.kind === "number") {
    const number = Number(answer.value);
    if (!Number.isFinite(number)) {
      return "Введи число";
    }
    if (number < question.min || number > question.max) {
      return `Укажи значение от ${question.min} до ${question.max}`;
    }

    return null;
  }

  const selected = question.options.find((option) => option.value === answer.value);
  if (!selected) {
    return "Выбери вариант из списка";
  }

  if (selected.detailRequired && !answer.detail?.trim()) {
    return "Добавь пару слов, чтобы Дарья увидела контекст";
  }

  return null;
}

export function getFirstIncompleteQuestionIndex(
  questions: Question[],
  answers: AnswerMap
): number {
  const firstIncomplete = questions.findIndex((question) => {
    return validateQuestion(question, answers[question.id]) !== null;
  });

  return firstIncomplete === -1 ? 0 : firstIncomplete;
}

export function serializeAnswers(
  questions: Question[],
  answers: AnswerMap
): SubmissionAnswers {
  return questions.reduce<SubmissionAnswers>((accumulator, question) => {
    const answer = answers[question.id];
    if (!answer) {
      return accumulator;
    }

    if (question.kind === "contact") {
      if (isContactAnswer(answer)) {
        if (answer.phone?.trim()) {
          accumulator.contactPhone = answer.phone.trim();
        }
        if (answer.maxProfile?.trim()) {
          accumulator.contactMax = answer.maxProfile.trim();
        }
      }
      return accumulator;
    }

    if (question.kind === "number") {
      if ("value" in answer) {
        accumulator[question.id] = Number(answer.value);
      }
      return accumulator;
    }

    if (question.kind === "multiChoice") {
      if (isMultiValueAnswer(answer) && answer.values.length > 0) {
        accumulator[question.id] = answer.values;
      }
      return accumulator;
    }

    if (!("value" in answer)) {
      return accumulator;
    }

    const selected = question.options.find((option) => option.value === answer.value);
    if (selected?.detailRequired && answer.detail?.trim()) {
      accumulator[question.id] = `${answer.value}: ${answer.detail.trim()}`;
      return accumulator;
    }

    accumulator[question.id] = answer.value;
    return accumulator;
  }, {});
}
