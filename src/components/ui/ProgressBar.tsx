interface ProgressBarProps {
  value: number;
  max?: number;
  label?: string;
  tone?: "blue" | "green";
}

export function ProgressBar({ value, max = 100, label, tone = "blue" }: ProgressBarProps) {
  const percent = max > 0 ? Math.max(0, Math.min(100, Math.round((value / max) * 100))) : 0;
  return (
    <div className="progress-bar" aria-label={label} role="progressbar" aria-valuemin={0} aria-valuemax={max} aria-valuenow={value}>
      <span className={`progress-bar-fill ${tone}`} style={{ width: `${percent}%` }} />
    </div>
  );
}
