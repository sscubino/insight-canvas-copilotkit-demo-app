import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "ghost" | "secondary";
type ButtonSize = "sm-icon" | "icon" | "sm" | "md" | "lg";

type ButtonProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
} & React.ComponentPropsWithoutRef<"button">;

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-action text-invert font-mono font-medium uppercase tracking-wider hover:opacity-90",
  ghost: "text-foreground hover:bg-grey-5",
  secondary: "bg-surface text-foreground hover:bg-surface-hover",
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
      "inline-flex items-center justify-center rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action/40 cursor-pointer",
      variantStyles[variant],
      sizeStyles[size],
      className
    )}
    {...props}
  />
);

export { Button };
export type { ButtonProps, ButtonVariant, ButtonSize };
