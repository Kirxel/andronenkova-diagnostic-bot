import type { DraftAnswer, Question } from "../types";

type QuestionCardProps = {
  question: Question;
  answer?: DraftAnswer;
  error: string | null;
  onChange: (next: DraftAnswer) => void;
};

export function QuestionCard({
  question,
  answer,
  error,
  onChange
}: QuestionCardProps) {
  if (question.kind === "number") {
    return (
      <section className="card" aria-labelledby={`question-${question.id}`}>
        <div className="card__eyebrow">Шаг анкеты</div>
        <h2 id={`question-${question.id}`} className="card__title">
          {question.title}
        </h2>
        {question.description ? (
          <p className="card__description">{question.description}</p>
        ) : null}

        <label className="field">
          <span className="field__label">{question.unit}</span>
          <input
            className="field__input"
            inputMode="decimal"
            type="number"
            min={question.min}
            max={question.max}
            placeholder={question.placeholder}
            value={answer?.value ?? ""}
            onChange={(event) => onChange({ value: event.target.value })}
          />
        </label>
        {error ? <p className="field__error">{error}</p> : null}
      </section>
    );
  }

  const selected = question.options.find((option) => option.value === answer?.value);

  return (
    <section className="card" aria-labelledby={`question-${question.id}`}>
      <div className="card__eyebrow">Шаг анкеты</div>
      <h2 id={`question-${question.id}`} className="card__title">
        {question.title}
      </h2>
      {question.description ? (
        <p className="card__description">{question.description}</p>
      ) : null}

      <fieldset className="choice-list">
        <legend className="sr-only">{question.title}</legend>
        {question.options.map((option) => {
          const checked = answer?.value === option.value;

          return (
            <label key={option.value} className={`choice ${checked ? "choice--active" : ""}`}>
              <input
                className="choice__input"
                type="radio"
                name={question.id}
                value={option.value}
                checked={checked}
                onChange={() =>
                  onChange({
                    value: option.value,
                    detail: checked ? answer?.detail : ""
                  })
                }
              />
              <span className="choice__content">
                <span className="choice__label">{option.label}</span>
                {option.hint ? <span className="choice__hint">{option.hint}</span> : null}
              </span>
            </label>
          );
        })}
      </fieldset>

      {selected?.detailRequired ? (
        <label className="field">
          <span className="field__label">{selected.detailLabel}</span>
          <textarea
            className="field__textarea"
            rows={4}
            placeholder={selected.detailPlaceholder}
            value={answer?.detail ?? ""}
            onChange={(event) =>
              onChange({
                value: answer?.value ?? selected.value,
                detail: event.target.value
              })
            }
          />
        </label>
      ) : null}

      {error ? <p className="field__error">{error}</p> : null}
    </section>
  );
}

