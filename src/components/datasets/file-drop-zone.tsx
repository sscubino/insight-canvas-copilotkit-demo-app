"use client";

import { useCallback, useRef, useState } from "react";
import { FileIcon } from "@/components/icons/file";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const ACCEPTED_EXTENSIONS = [".csv", ".json"];
const ACCEPT_STRING = ACCEPTED_EXTENSIONS.join(",");

type FileDropZoneProps = {
  onFileSelect: (file: File) => void;
  className?: string;
};

const isValidFile = (file: File): boolean => {
  const ext = `.${file.name.split(".").pop()?.toLowerCase()}`;
  return ACCEPTED_EXTENSIONS.includes(ext);
};

const FileDropZone = ({ onFileSelect, className }: FileDropZoneProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dragCounterRef = useRef(0);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current += 1;
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current -= 1;
    if (dragCounterRef.current === 0) setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      dragCounterRef.current = 0;

      const file = e.dataTransfer.files[0];
      if (file && isValidFile(file)) {
        onFileSelect(file);
      }
    },
    [onFileSelect]
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file && isValidFile(file)) {
        onFileSelect(file);
      }
      if (inputRef.current) inputRef.current.value = "";
    },
    [onFileSelect]
  );

  const handleBrowseClick = useCallback(() => {
    inputRef.current?.click();
  }, []);

  return (
    <div
      className={cn("relative w-full", className)}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {/* Gradient dashed border via SVG */}
      <svg
        className="pointer-events-none absolute inset-0 size-full"
        aria-hidden="true"
      >
        <defs>
          <linearGradient
            id="drop-zone-gradient"
            x1="0%"
            y1="50%"
            x2="100%"
            y2="50%"
          >
            <stop offset="0%" stopColor="rgba(154, 223, 72, 0.6)" />
            <stop offset="47.6%" stopColor="rgba(129, 255, 236, 0.6)" />
            <stop offset="100%" stopColor="rgba(202, 164, 255, 0.6)" />
          </linearGradient>
        </defs>
        <rect
          x="1"
          y="1"
          width="calc(100% - 2px)"
          height="calc(100% - 2px)"
          rx="7"
          ry="7"
          fill="none"
          stroke="url(#drop-zone-gradient)"
          strokeWidth="2"
          strokeDasharray="8 6"
        />
      </svg>

      <div
        className={cn(
          "flex h-[212px] flex-col items-center justify-center gap-3 rounded-lg px-4 py-5 transition-colors",
          isDragging ? "bg-mint-light/20" : "bg-white/40"
        )}
      >
        <FileIcon
          width={20}
          height={20}
          className="text-foreground"
          aria-hidden="true"
        />

        <p className="text-sm font-medium leading-snug text-foreground">
          Drag and drop file or
        </p>

        <Button
          variant="primary"
          size="sm"
          onClick={handleBrowseClick}
          aria-label="Browse files to upload"
        >
          BROWSE FILE
        </Button>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT_STRING}
        onChange={handleInputChange}
        className="hidden"
        aria-hidden="true"
        tabIndex={-1}
      />
    </div>
  );
};

export { FileDropZone };
