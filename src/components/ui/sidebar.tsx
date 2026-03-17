"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Button, ButtonProps } from "@/components/ui/button";
import { CaretLeftIcon } from "@/components/icons/caret-left";
import { CaretRightIcon } from "@/components/icons/caret-right";

type SidebarSide = "left" | "right";

type SidebarContextValue = {
  collapsed: boolean;
  toggle: () => void;
  side: SidebarSide;
};

const SidebarContext = createContext<SidebarContextValue | null>(null);

const useSidebar = () => {
  const ctx = useContext(SidebarContext);
  if (!ctx) throw new Error("useSidebar must be used within a Sidebar");
  return ctx;
};

type SidebarProps = {
  side?: SidebarSide;
  expandedWidth: string;
  innerMinWidth: string;
  children: ReactNode;
  className?: string;
} & Omit<React.ComponentPropsWithoutRef<"aside">, "className" | "children">;

const COLLAPSED_WIDTH = "w-[68px]";

const Sidebar = ({
  side = "left",
  expandedWidth,
  innerMinWidth,
  children,
  className,
  ...props
}: SidebarProps) => {
  const [collapsed, setCollapsed] = useState(false);
  const toggle = () => setCollapsed((prev) => !prev);
  const ExpandIcon = side === "left" ? CaretRightIcon : CaretLeftIcon;

  return (
    <SidebarContext.Provider value={{ collapsed, toggle, side }}>
      <aside
        className={cn(
          "relative flex shrink-0 flex-col card-container transition-[width] duration-300 ease-in-out",
          collapsed ? COLLAPSED_WIDTH : expandedWidth,
          className
        )}
        {...props}
      >
        <div
          className={cn(
            "flex flex-1 flex-col",
            innerMinWidth,
            collapsed && "pointer-events-none"
          )}
        >
          {children}
        </div>

        <div className="pointer-events-none absolute inset-0 flex flex-col items-center">
          <div
            className={cn(
              "flex h-12 w-full shrink-0 items-center justify-center border-b-2 border-border-card transition-opacity duration-200",
              collapsed ? "pointer-events-auto opacity-100" : "opacity-0"
            )}
          >
            <Button
              variant="ghost"
              size="icon"
              onClick={toggle}
              aria-label="Expand sidebar"
            >
              <ExpandIcon width={16} height={16} />
            </Button>
          </div>
        </div>
      </aside>
    </SidebarContext.Provider>
  );
};

type SidebarHeaderProps = {
  children: ReactNode;
  className?: string;
};

const SidebarHeader = ({ children, className }: SidebarHeaderProps) => {
  const { collapsed, toggle, side } = useSidebar();
  const CollapseIcon = side === "left" ? CaretLeftIcon : CaretRightIcon;

  return (
    <header
      className={cn(
        "flex h-12 shrink-0 items-center justify-between border-b border-border-card pl-5 pr-3 transition-opacity duration-200",
        collapsed && "opacity-0 pointer-events-none",
        className
      )}
    >
      {children}
      <Button
        variant="ghost"
        size="icon"
        onClick={toggle}
        className="shrink-0"
        aria-label="Collapse sidebar"
      >
        <CollapseIcon width={16} height={16} />
      </Button>
    </header>
  );
};

type SidebarTitleProps = {
  children: ReactNode;
  className?: string;
};

const SidebarTitle = ({ children, className }: SidebarTitleProps) => {
  return (
    <span
      className={cn(
        "text-lg font-medium text-foreground whitespace-nowrap",
        className
      )}
    >
      {children}
    </span>
  );
};

type SidebarContentProps = {
  children: ReactNode;
  className?: string;
};

const SidebarContent = ({ children, className }: SidebarContentProps) => {
  const { collapsed } = useSidebar();

  return (
    <div
      className={cn(
        "flex min-h-0 flex-1 flex-col transition-opacity duration-200",
        collapsed && "opacity-0 pointer-events-none",
        className
      )}
    >
      {children}
    </div>
  );
};

type SidebarNavSectionProps = {
  children: ReactNode;
  className?: string;
};

const SidebarNavSection = ({ children, className }: SidebarNavSectionProps) => {
  return (
    <div className={cn("px-3 pb-3 border-b border-border-card", className)}>
      {children}
    </div>
  );
};

type SidebarNavSectionTitleProps = {
  children: ReactNode;
  className?: string;
};

const SidebarNavSectionTitle = ({
  children,
  className,
}: SidebarNavSectionTitleProps) => {
  return (
    <h2
      className={cn(
        "px-3 pt-5 pb-3 text-xs font-medium uppercase text-dim",
        className
      )}
    >
      {children}
    </h2>
  );
};

type SidebarNavButtonProps = ButtonProps & {
  isActive?: boolean;
};

const SidebarNavButton = ({
  isActive = false,
  className,
  ...props
}: SidebarNavButtonProps) => {
  return (
    <Button
      variant={isActive ? "secondary" : "ghost"}
      size="md"
      className={cn(
        "w-full justify-start gap-3 text-left *:truncate",
        isActive ? "font-semibold" : "font-medium"
      )}
      aria-current={isActive ? "true" : undefined}
      {...props}
    />
  );
};

type SidebarFooterProps = {
  children: ReactNode;
  hideWhenCollapsed?: boolean;
  className?: string;
};

const SidebarFooter = ({
  hideWhenCollapsed = true,
  children,
  className,
}: SidebarFooterProps) => {
  const { collapsed } = useSidebar();

  return (
    <div
      className={cn(
        "border-t border-border-card p-3 transition-[width,opacity]",
        hideWhenCollapsed ? "duration-200" : "duration-300",
        collapsed && !hideWhenCollapsed ? COLLAPSED_WIDTH : "w-full",
        collapsed && hideWhenCollapsed
          ? "opacity-0 pointer-events-none"
          : "pointer-events-auto",
        className
      )}
    >
      {children}
    </div>
  );
};

export {
  Sidebar,
  SidebarHeader,
  SidebarTitle,
  SidebarContent,
  SidebarNavSection,
  SidebarNavSectionTitle,
  SidebarNavButton,
  SidebarFooter,
  useSidebar,
};
