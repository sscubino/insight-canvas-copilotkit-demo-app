import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

type DrawerContentProps = {
  children: ReactNode;
  className?: string;
};

const DrawerContent = ({ children, className }: DrawerContentProps) => (
  <div
    className={cn(
      "flex w-full flex-1 flex-col items-center justify-between gap-4 overflow-y-auto scrollbar-custom px-2 pb-3",
      className
    )}
  >
    {children}
  </div>
);

type DrawerProps = {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  className?: string;
};

const Drawer = ({ isOpen, onClose, children, className }: DrawerProps) => (
  <div
    className={cn(
      "absolute inset-0 z-50",
      isOpen ? "pointer-events-auto" : "pointer-events-none"
    )}
  >
    <div
      className={cn(
        "absolute inset-0 bg-foreground/5 transition-[opacity,backdrop-filter] duration-300",
        isOpen
          ? "opacity-100 backdrop-blur-lg"
          : "opacity-0 backdrop-blur-none pointer-events-none"
      )}
      onClick={onClose}
      role="presentation"
    />

    <div
      role="dialog"
      aria-modal={isOpen}
      aria-hidden={!isOpen}
      className={cn(
        "absolute inset-x-0 bottom-0 flex flex-col items-center rounded-t-2xl bg-surface-hover pt-5 max-h-[calc(100%-60px)]",
        "shadow-[0_-5px_25px_rgba(0,0,0,0.03)] transition-transform duration-300 ease-out",
        isOpen ? "translate-y-0" : "translate-y-full",
        className
      )}
    >
      <div className="mb-3 h-[3px] w-[100px] rounded-full bg-border" />
      {children}
    </div>
  </div>
);

export { Drawer, DrawerContent };
