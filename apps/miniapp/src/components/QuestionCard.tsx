import type {
  ContactDraftAnswer,
  DraftAnswer,
  MultiValueDraftAnswer,
  Question,
  SingleValueDraftAnswer
} from "../types";

type QuestionCardProps = {
  question: Question;
  answer?: DraftAnswer;
  error: string | null;
  onChange: (next: DraftAnswer) => void;
};

function isMultiValueAnswer(answer: DraftAnswer | undefined): answer is MultiValueDraftAnswer {
  return Array.isArray((answer as MultiValueDraftAnswer | undefined)?.values);
}

function isSingleValueAnswer(answer: DraftAnswer | undefined): answer is SingleValueDraftAnswer {
  return typeof (answer as SingleValueDraftAnswer | undefined)?.value === "string";
}

function isContactAnswer(answer: DraftAnswer | undefined): answer is ContactDraftAnswer {
  return Boolean(
    answer &&
      typeof answer === "object" &&
      !("value" in answer) &&
      !("values" in answer)
  );
}

export function QuestionCard({
  question,
  answer,
  error,
  onChange
}: QuestionCardProps) {
  if (question.kind === "contact") {
    const contactAnswer = isContactAnswer(answer) ? answer : {};

    return (
      <section className="card" aria-labelledby={`question-${question.id}`}>
        <div className="card__eyebrow">Шаг анкеты</div>
        <h2 id={`question-${question.id}`} className="card__title">
          {question.title}
        </h2>
        {question.description ? (
          <p className="card__description">{question.description}</p>
        ) : null}

        <div className="contact-fields">
          <label className="field">
            <span className="field__label">{question.phoneLabel}</span>
            <input
              className="field__input"
              inputMode="tel"
              type="tel"
              placeholder={question.phonePlaceholder}
              value={contactAnswer.phone ?? ""}
              onChange={(event) =>
                onChange({
                  phone: event.target.value,
                  maxProfile: contactAnswer.maxProfile ?? ""
                })
              }
            />
          </label>

          <label className="field">
            <span className="field__label">{question.maxLabel}</span>
            <input
              className="field__input"
              type="text"
              placeholder={question.maxPlaceholder}
              value={contactAnswer.maxProfile ?? ""}
              onChange={(event) =>
                onChange({
                  phone: contactAnswer.phone ?? "",
                  maxProfile: event.target.value
                })
              }
            />
          </label>
        </div>

        {error ? <p className="field__error">{error}</p> : null}
      </section>
    );
  }

  if (question.kind === "multiChoice") {
    const selectedValues = isMultiValueAnswer(answer) ? answer.values : [];

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
            const checked = selectedValues.includes(option.value);

            return (
              <label key={option.value} className={`choice ${checked ? "choice--active" : ""}`}>
                <input
                  className="choice__input"
                  type="checkbox"
                  name={`${question.id}-${option.value}`}
                  value={option.value}
                  checked={checked}
                  onChange={() =>
                    onChange({
                      values: checked
                        ? selectedValues.filter((value) => value !== option.value)
                        : [...selectedValues, option.value]
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

        {error ? <p className="field__error">{error}</p> : null}
      </section>
    );
  }

  if (question.kind === "number") {
    const singleAnswer = isSingleValueAnswer(answer) ? answer : undefined;

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
            value={singleAnswer?.value ?? ""}
            onChange={(event) => onChange({ value: event.target.value })}
          />
        </label>
        {error ? <p className="field__error">{error}</p> : null}
      </section>
    );
  }

  const singleAnswer = isSingleValueAnswer(answer) ? answer : undefined;
  const selected = question.options.find((option) => option.value === singleAnswer?.value);

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
          const checked = singleAnswer?.value === option.value;

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
                    detail: checked ? singleAnswer?.detail : ""
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
            value={singleAnswer?.detail ?? ""}
            onChange={(event) =>
              onChange({
                value: singleAnswer?.value ?? selected.value,
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
