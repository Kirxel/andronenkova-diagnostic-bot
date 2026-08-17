type StatusPanelProps = {
  title: string;
  description: string;
  tone?: "default" | "error" | "success";
  action?: {
    label: string;
    onClick: () => void;
  };
};

export function StatusPanel({
  title,
  description,
  tone = "default",
  action
}: StatusPanelProps) {
  return (
    <section className={`card status status--${tone}`}>
      <div className="card__eyebrow">Статус</div>
      <h2 className="card__title">{title}</h2>
      <p className="card__description">{description}</p>
      {action ? (
        <button className="button button--primary" type="button" onClick={action.onClick}>
          {action.label}
        </button>
      ) : null}
    </section>
  );
}

