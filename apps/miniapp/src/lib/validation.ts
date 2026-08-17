import { questions } from "../questions";
import type { AnswerMap, DraftAnswer, Question } from "../types";

export function validateQuestion(
  question: Question,
  answer: DraftAnswer | undefined
): string | null {
  if (!answer?.value.trim()) {
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

export function getFirstIncompleteQuestionIndex(answers: AnswerMap): number {
  const firstIncomplete = questions.findIndex((question) => {
    return validateQuestion(question, answers[question.id]) !== null;
  });

  return firstIncomplete === -1 ? 0 : firstIncomplete;
}

export function serializeAnswers(answers: AnswerMap): Record<string, string | number> {
  return questions.reduce<Record<string, string | number>>((accumulator, question) => {
    const answer = answers[question.id];
    if (!answer) {
      return accumulator;
    }

    if (question.kind === "number") {
      accumulator[question.id] = Number(answer.value);
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

