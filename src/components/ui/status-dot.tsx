import { cn } from "@/lib/utils";

type StatusDotProps = {
  className: string;
  pulse?: boolean;
};

const StatusDot = ({ className, pulse = false }: StatusDotProps) => (
  <span
    className={cn("inline-block size-1.5 shrink-0 rounded-full", className, pulse ? "animate-[pulse_2s_infinite]" : "")}
    aria-hidden="true"
  />
);

export { StatusDot };
