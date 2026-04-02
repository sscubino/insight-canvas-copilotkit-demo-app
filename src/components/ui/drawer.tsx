import { cn, noop } from "@/lib/utils";
import type { ComponentPropsWithoutRef, PointerEvent, ReactNode } from "react";
import { useEffect, useRef, useState } from "react";

type DrawerContentProps = {
  children: ReactNode;
  className?: string;
};

const DrawerContent = ({ children, className }: DrawerContentProps) => (
  <div
    className={cn(
      "flex w-full flex-1 flex-col gap-4 overflow-y-auto scrollbar-custom px-2 pb-3",
      className
    )}
  >
    {children}
  </div>
);

type DrawerSectionProps = ComponentPropsWithoutRef<"div">;

const DrawerHeader = ({
  children,
  className,
  ...props
}: DrawerSectionProps) => (
  <div
    className={cn(
      "sticky top-0 z-10 w-full bg-surface-hover px-4 mb-5",
      className
    )}
    {...props}
  >
    {children}
  </div>
);

const DrawerTitle = ({ children, className, ...props }: DrawerSectionProps) => (
  <h2 className={cn("text-xl leading-tight font-medium", className)} {...props}>
    {children}
  </h2>
);

const DrawerFooter = ({
  children,
  className,
  ...props
}: DrawerSectionProps) => (
  <div
    className={cn(
      "sticky bottom-0 z-10 w-full bg-surface-hover px-4 mb-3 pt-2",
      className
    )}
    {...props}
  >
    {children}
  </div>
);

const DRAG_CLOSE_THRESHOLD = 80;

const DrawerDialog = ({
  isOpen,
  onClose,
  children,
  dragCloseThreshold = DRAG_CLOSE_THRESHOLD,
  className,
}: {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  dragCloseThreshold?: number;
  className?: string;
}) => {
  const [dragOffset, setDragOffset] = useState(0);
  const dragStartYRef = useRef<number | null>(null);
  const isDraggingRef = useRef(false);

  useEffect(() => {
    if (isOpen) return;
    setDragOffset(0);
    dragStartYRef.current = null;
    isDraggingRef.current = false;
  }, [isOpen]);

  const handleDragEnd = () => {
    if (!isDraggingRef.current) return;

    const shouldClose = dragOffset >= dragCloseThreshold;
    setDragOffset(0);
    dragStartYRef.current = null;
    isDraggingRef.current = false;

    if (shouldClose) {
      onClose();
    }
  };

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (!isOpen || event.button !== 0) return;

    dragStartYRef.current = event.clientY;
    isDraggingRef.current = true;
    setDragOffset(0);
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current || dragStartYRef.current === null) return;

    const nextOffset = Math.max(0, event.clientY - dragStartYRef.current);
    setDragOffset(nextOffset);
  };

  const handlePointerUp = () => {
    handleDragEnd();
  };

  const handlePointerCancel = () => {
    setDragOffset(0);
    dragStartYRef.current = null;
    isDraggingRef.current = false;
  };

  return (
    <div
      role="dialog"
      aria-modal={isOpen}
      aria-hidden={!isOpen}
      className={cn(
        "absolute inset-x-0 bottom-0 flex flex-col items-center rounded-t-2xl bg-surface-hover max-h-[calc(100%-60px)]",
        "shadow-[0_-5px_25px_rgba(0,0,0,0.03)] ease-out",
        dragOffset > 0
          ? "transition-none"
          : "transition-transform duration-300",
        isOpen ? "translate-y-0" : "translate-y-full",
        className
      )}
      style={
        dragOffset > 0
          ? { transform: `translateY(${dragOffset}px)` }
          : undefined
      }
      inert={!isOpen}
    >
      <div
        className="mb-3 flex w-full touch-none justify-center pb-1 pt-5"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
      >
        <div className="h-[3px] w-[100px] rounded-full bg-border" />
      </div>
      {children}
    </div>
  );
};

type DrawerProps = {
  isOpen: boolean;
  onClose?: () => void;
  children: ReactNode;
  className?: string;
};

const Drawer = ({
  isOpen,
  onClose = noop,
  children,
  className,
}: DrawerProps) => {
  return (
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

      <DrawerDialog isOpen={isOpen} onClose={onClose} className={className}>
        {children}
      </DrawerDialog>
    </div>
  );
};

export { Drawer, DrawerContent, DrawerHeader, DrawerFooter, DrawerTitle };
