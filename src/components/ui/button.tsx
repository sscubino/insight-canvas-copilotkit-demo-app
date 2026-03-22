import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "ghost" | "secondary" | "destructive";
type ButtonSize = "sm-icon" | "icon" | "sm" | "md" | "lg";

type ButtonProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
} & React.ComponentPropsWithoutRef<"button">;

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-action text-invert font-mono font-medium uppercase tracking-wider hover:opacity-90 disabled:text-dim disabled:bg-action/10 disabled:opacity-100",
  ghost:
    "text-foreground hover:bg-grey-5 disabled:text-dim disabled:bg-transparent",
  secondary:
    "bg-surface text-foreground hover:bg-surface-hover disabled:text-dim disabled:bg-surface",
  destructive:
    "bg-destructive/10 text-destructive hover:bg-destructive/25 disabled:text-dim disabled:bg-transparent",
};

const sizeStyles: Record<ButtonSize, string> = {
  "sm-icon": "size-6 p-1 rounded-sm",
  icon: "size-8 p-2",
  sm: "gap-1.5 px-2.5 py-1.5 text-xs",
  md: "gap-2 h-10 px-3 text-sm",
  lg: "gap-2 p-3 text-sm",
};

const Button = ({
  variant = "ghost",
  size = "md",
  className,
  type = "button",
  ...props
}: ButtonProps) => (
  <button
    type={type}
    className={cn(
      "inline-flex items-center justify-center rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action/40 cursor-pointer disabled:cursor-auto",
      variantStyles[variant],
      sizeStyles[size],
      className
    )}
    {...props}
  />
);

export { Button };
export type { ButtonProps, ButtonVariant, ButtonSize };
