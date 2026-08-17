type ProgressBarProps = {
  current: number;
  total: number;
};

export function ProgressBar({ current, total }: ProgressBarProps) {
  const progress = Math.max((current / total) * 100, 4);

  return (
    <div className="progress">
      <div className="progress__meta">
        <span>Диагностика</span>
        <span>
          {current}/{total}
        </span>
      </div>
      <div aria-hidden="true" className="progress__track">
        <div className="progress__fill" style={{ width: `${progress}%` }} />
      </div>
    </div>
  );
}

