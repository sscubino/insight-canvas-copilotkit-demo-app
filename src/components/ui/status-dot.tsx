import { cn } from "@/lib/utils";

type StatusDotProps = {
  className: string;
  pulse?: boolean;
};

const StatusDot = ({ className, pulse = false }: StatusDotProps) => (
  <span
    className={cn(
      "inline-block size-1.5 shrink-0 rounded-full",
      pulse ? "animate-[pulse_2s_infinite]" : "",
      className
    )}
    aria-hidden="true"
  />
);

export { StatusDot };
