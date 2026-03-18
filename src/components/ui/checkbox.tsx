import { cn } from "@/lib/utils";

type CheckboxProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  "aria-label": string;
  className?: string;
};

const Checkbox = ({
  checked,
  onChange,
  "aria-label": ariaLabel,
  className,
}: CheckboxProps) => {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      onChange(!checked);
    }
  };

  return (
    <button
      role="checkbox"
      type="button"
      aria-checked={checked}
      aria-label={ariaLabel}
      tabIndex={0}
      onClick={() => onChange(!checked)}
      onKeyDown={handleKeyDown}
      className={cn(
        "flex size-6 shrink-0 items-center justify-center rounded transition-colors cursor-pointer",
        checked
          ? "bg-mint"
          : "border border-border bg-surface-50",
        className
      )}
    >
      {checked && (
        <svg
          width={16}
          height={16}
          viewBox="0 0 16 16"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M12 5L6.5 10.5L4 8"
            stroke="white"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </button>
  );
};

export { Checkbox };
export type { CheckboxProps };
