import { Checkbox } from "@/components/ui/checkbox";
import { FileIcon } from "@/components/icons/file";
import { cn } from "@/lib/utils";
import type { DatasetInfo } from "@/types/dataset";

const DatasetIcon = ({ source, emoji }: { source: string; emoji?: string }) => {
  return (
    <div className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-border-card/70 bg-surface-50 shadow-sm">
      {source === "sample" && emoji ? (
        <span className="text-sm" aria-hidden="true">
          {emoji}
        </span>
      ) : (
        <FileIcon width={16} height={16} className="text-foreground" />
      )}
    </div>
  );
};

const DatasetName = ({
  isSelected,
  children,
}: {
  isSelected: boolean;
  children: React.ReactNode;
}) => (
  <p
    className={cn(
      "truncate text-sm leading-snug",
      isSelected ? "font-semibold text-foreground" : "font-medium text-muted"
    )}
  >
    {children}
  </p>
);

const DatasetMeta = ({ dataset }: { dataset: DatasetInfo }) => (
  <p className="truncate font-mono text-xs font-medium text-dim">
    {formatMeta(dataset)}
  </p>
);

type DatasetCardProps = {
  dataset: DatasetInfo;
  onToggle: (id: string) => void;
};

const formatMeta = (dataset: DatasetInfo): string => {
  const parts: string[] = [];
  if (dataset.rowCount != null) parts.push(`${dataset.rowCount} rows`);
  if (dataset.columnCount != null) parts.push(`${dataset.columnCount} cols`);
  parts.push(dataset.fileName);
  return parts.join(" · ");
};

const DatasetCard = ({ dataset, onToggle }: DatasetCardProps) => {
  const { isSelected, name, id, source, emoji } = dataset;

  const handleClick = () => onToggle(id);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      onToggle(id);
    }
  };

  return (
    <div
      role="option"
      aria-selected={isSelected}
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className={cn(
        "flex cursor-pointer items-center gap-3 overflow-hidden rounded-lg border py-3 pl-3 pr-4 transition-colors",
        isSelected
          ? "border-mint bg-mint-light/30"
          : "border-border bg-surface-50 hover:bg-surface-hover"
      )}
    >
      <DatasetIcon source={source} emoji={emoji} />

      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <DatasetName isSelected={isSelected}>{name}</DatasetName>
        <DatasetMeta dataset={dataset} />
      </div>

      <div onClick={(e) => e.stopPropagation()}>
        <Checkbox
          checked={isSelected}
          onChange={() => onToggle(id)}
          aria-label={`Select ${name}`}
        />
      </div>
    </div>
  );
};

export { DatasetCard };
