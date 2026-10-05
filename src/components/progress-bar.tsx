type ProgressBarProps = {
  value: number;
  color: string;
  className?: string;
};

export function ProgressBar({ value, color, className }: ProgressBarProps) {
  const width = Math.max(0, Math.min(100, value));

  return (
    <div
      className={`h-1.5 overflow-hidden rounded-full bg-white/10 ${className ?? ""}`}
      role="progressbar"
      aria-valuenow={width}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className="h-full rounded-full transition-[width] duration-500"
        style={{ width: `${width}%`, background: color }}
      />
    </div>
  );
}
