import { cn } from "@/lib/utils";

type StatusDotProps = {
  className: string;
};

const StatusDot = ({ className }: StatusDotProps) => (
  <span
    className={cn("inline-block size-1.5 shrink-0 rounded-full", className)}
    aria-hidden="true"
  />
);

export { StatusDot };
