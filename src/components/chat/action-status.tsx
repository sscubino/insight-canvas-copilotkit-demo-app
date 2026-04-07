import { cn } from "@/lib/utils";
import { Spinner } from "@/components/ui/spinner";

type ActionStatusVariant = "loading" | "success" | "error" | "neutral";

type ActionStatusProps = {
  variant?: ActionStatusVariant;
  children: React.ReactNode;
  className?: string;
};

const variantStyles: Record<ActionStatusVariant, string> = {
  loading: "border-border bg-surface-hover text-muted font-mono",
  success: "border-accent-foreground bg-accent-foreground/10 text-accent",
  error: "border-destructive bg-destructive/10 text-destructive font-mono",
  neutral: "border-border bg-surface-hover text-muted",
};

const SuccessBadge = () => (
  <span
    className="inline-flex size-4 shrink-0 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-accent-foreground"
    aria-hidden="true"
  >
    ✓
  </span>
);

const ErrorBadge = () => (
  <span
    className="inline-flex size-4 shrink-0 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground"
    aria-hidden="true"
  >
    ✕
  </span>
);

const ActionStatus = ({
  variant = "neutral",
  children,
  className,
}: ActionStatusProps) => (
  <div
    className={cn(
      "flex items-center gap-2 rounded-lg border px-3 py-2 text-xs",
      variantStyles[variant],
      className
    )}
  >
    {variant === "loading" && <Spinner size="xs" />}
    {variant === "success" && <SuccessBadge />}
    {variant === "error" && <ErrorBadge />}
    <span className="truncate">{children}</span>
  </div>
);

export { ActionStatus };
