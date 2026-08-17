import { startTransition, useEffect, useState } from "react";
import { ProgressBar } from "./components/ProgressBar";
import { QuestionCard } from "./components/QuestionCard";
import { StatusPanel } from "./components/StatusPanel";
import { questions } from "./questions";
import { submitDiagnostic } from "./lib/api";
import { clearDraft, loadDraft, saveDraft } from "./lib/storage";
import {
  applyTelegramTheme,
  initializeTelegramApp,
  readTelegramContext
} from "./lib/telegram";
import {
  getFirstIncompleteQuestionIndex,
  serializeAnswers,
  validateQuestion
} from "./lib/validation";
import type { AnswerMap, DraftAnswer } from "./types";

type SubmitState = "idle" | "submitting" | "success" | "error";

export default function App() {
  const [answers, setAnswers] = useState<AnswerMap>(() => loadDraft());
  const [currentIndex, setCurrentIndex] = useState(() => getFirstIncompleteQuestionIndex(loadDraft()));
  const [error, setError] = useState<string | null>(null);
  const [submitState, setSubmitState] = useState<SubmitState>("idle");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [telegramContext, setTelegramContext] = useState(() => readTelegramContext());

  const currentQuestion = questions[currentIndex];

  useEffect(() => {
    return initializeTelegramApp(() => {
      const nextContext = readTelegramContext();
      setTelegramContext(nextContext);
      applyTelegramTheme(nextContext);
    });
  }, []);

  useEffect(() => {
    saveDraft(answers);
  }, [answers]);

  function updateAnswer(questionId: string, next: DraftAnswer) {
    setError(null);
    setSubmitError(null);
    setAnswers((previous) => ({
      ...previous,
      [questionId]: next
    }));
  }

  function goBack() {
    if (currentIndex === 0 || submitState === "submitting") {
      return;
    }

    setError(null);
    startTransition(() => {
      setCurrentIndex((previous) => Math.max(previous - 1, 0));
    });
  }

  function goForward() {
    const validationError = validateQuestion(currentQuestion, answers[currentQuestion.id]);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    startTransition(() => {
      setCurrentIndex((previous) => Math.min(previous + 1, questions.length - 1));
    });
  }

  async function handleSubmit() {
    const validationError = validateQuestion(currentQuestion, answers[currentQuestion.id]);
    if (validationError) {
      setError(validationError);
      return;
    }

    setSubmitState("submitting");
    setSubmitError(null);

    try {
      await submitDiagnostic({
        initData: telegramContext.initData,
        startParam: telegramContext.startParam,
        answers: serializeAnswers(answers)
      });

      clearDraft();
      setSubmitState("success");
    } catch {
      setSubmitState("error");
      setSubmitError(
        "Не удалось отправить анкету. Ответы сохранены, попробуй еще раз через пару минут."
      );
    }
  }

  function restart() {
    clearDraft();
    const nextAnswers = {};
    setAnswers(nextAnswers);
    setError(null);
    setSubmitError(null);
    setSubmitState("idle");
    setCurrentIndex(0);
  }

  if (submitState === "success") {
    return (
      <main className="app-shell">
        <header className="hero">
          <span className="hero__badge">Дарья на связи</span>
          <h1 className="hero__title">Анкета отправлена</h1>
          <p className="hero__lead">
            Дарья посмотрит ответы лично и вернется к тебе с понятным следующим шагом,
            без шаблонных выводов и без медицинских обещаний.
          </p>
        </header>
        <StatusPanel
          title="Все получилось"
          description="Если захочешь пройти анкету заново или обновить ответы, можно начать сначала."
          tone="success"
          action={{ label: "Заполнить заново", onClick: restart }}
        />
      </main>
    );
  }

  return (
    <main className="app-shell">
      <header className="hero">
        <span className="hero__badge">
          {telegramContext.isAvailable ? "Mini App внутри Telegram" : "Режим браузерной проверки"}
        </span>
        <h1 className="hero__title">Диагностика с Дарьей</h1>
        <p className="hero__lead">
          Короткая анкета, чтобы понять твой запрос, состояние и удобный старт без
          лишней теории.
        </p>
      </header>

      <ProgressBar current={currentIndex + 1} total={questions.length} />

      <QuestionCard
        question={currentQuestion}
        answer={answers[currentQuestion.id]}
        error={error}
        onChange={(next) => updateAnswer(currentQuestion.id, next)}
      />

      {submitError ? (
        <StatusPanel
          title="Нужна еще одна попытка"
          description={submitError}
          tone="error"
        />
      ) : null}

      <footer className="actions">
        <button
          className="button button--ghost"
          type="button"
          onClick={goBack}
          disabled={currentIndex === 0 || submitState === "submitting"}
        >
          Назад
        </button>

        {currentIndex === questions.length - 1 ? (
          <button
            className="button button--primary"
            type="button"
            onClick={handleSubmit}
            disabled={submitState === "submitting"}
          >
            {submitState === "submitting" ? "Отправляем..." : "Отправить анкету"}
          </button>
        ) : (
          <button className="button button--primary" type="button" onClick={goForward}>
            Продолжить
          </button>
        )}
      </footer>
    </main>
  );
}

