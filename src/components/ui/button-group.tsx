import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

type ButtonGroupProps = {
  children: ReactNode;
  className?: string;
} & Omit<React.ComponentPropsWithoutRef<"div">, "className" | "children">;

const ButtonGroup = ({ children, className, ...props }: ButtonGroupProps) => (
  <div
    role="group"
    className={cn(
      "flex overflow-hidden rounded-lg border border-border bg-surface shadow-sm",
      "*:rounded-none [&>*:not(:last-child)]:border-r [&>*:not(:last-child)]:border-border",
      className,
    )}
    {...props}
  >
    {children}
  </div>
);

export { ButtonGroup };
export type { ButtonGroupProps };
