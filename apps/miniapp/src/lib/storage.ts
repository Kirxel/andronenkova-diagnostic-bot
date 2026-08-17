import type { AnswerMap } from "../types";

const STORAGE_KEY = "daria-diagnostic-draft";

export function loadDraft(): AnswerMap {
  if (typeof window === "undefined") {
    return {};
  }

  const raw = window.sessionStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return {};
  }

  try {
    return JSON.parse(raw) as AnswerMap;
  } catch {
    return {};
  }
}

export function saveDraft(answers: AnswerMap): void {
  if (typeof window === "undefined") {
    return;
  }

  window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(answers));
}

export function clearDraft(): void {
  if (typeof window === "undefined") {
    return;
  }

  window.sessionStorage.removeItem(STORAGE_KEY);
}

