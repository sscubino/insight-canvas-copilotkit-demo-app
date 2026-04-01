import { cn } from "@/lib/utils";

type SpinnerSize = "xs" | "sm" | "md" | "lg";

type SpinnerProps = {
  size?: SpinnerSize;
  className?: string;
  label?: string;
};

const sizeStyles: Record<SpinnerSize, string> = {
  xs: "h-3 w-3 border-2",
  sm: "h-4 w-4 border-2",
  md: "h-5 w-5 border-[2.5px]",
  lg: "h-6 w-6 border-[3px]",
};

const Spinner = ({
  size = "xs",
  className,
  label = "Loading",
}: SpinnerProps) => (
  <div
    role="status"
    aria-label={label}
    className={cn(
      "shrink-0 animate-spin rounded-full border-dim border-t-transparent",
      sizeStyles[size],
      className
    )}
  />
);

export { Spinner };
