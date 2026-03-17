"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { CaretLeftIcon } from "@/icons/caret-left";
import { CaretRightIcon } from "@/icons/caret-right";

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
          "relative flex shrink-0 flex-col overflow-hidden rounded-lg border border-border-card bg-surface-50 transition-[width] duration-300 ease-in-out",
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
            <button
              type="button"
              onClick={toggle}
              className="flex size-8 items-center justify-center rounded-lg p-2 text-foreground transition-colors hover:bg-surface-hover"
              aria-label="Expand sidebar"
              tabIndex={0}
            >
              <ExpandIcon width={16} height={16} />
            </button>
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
      <button
        type="button"
        onClick={toggle}
        className="flex size-8 shrink-0 items-center justify-center rounded-lg p-2 text-foreground transition-colors hover:bg-surface-hover"
        aria-label="Collapse sidebar"
        tabIndex={0}
      >
        <CollapseIcon width={16} height={16} />
      </button>
    </header>
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

export { Sidebar, SidebarHeader, SidebarContent, SidebarFooter, useSidebar };
