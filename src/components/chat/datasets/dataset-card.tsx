import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { FileIcon } from "@/components/icons/file";
import { TrashIcon } from "@/components/icons/trash";
import { cn, noop } from "@/lib/utils";
import type { DatasetInfo } from "@/types/dataset";
import { Spinner } from "@/components/ui/spinner";

const formatMeta = (dataset: DatasetInfo): string => {
  const parts: string[] = [];
  if (dataset.rowCount != null) parts.push(`${dataset.rowCount} rows`);
  if (dataset.columnCount != null) parts.push(`${dataset.columnCount} cols`);
  parts.push(dataset.fileName);
  return parts.join(" · ");
};

const DatasetCardWrapper = ({
  isSelected,
  isDisabled = false,
  handleClick,
  handleKeyDown,
  children,
}: {
  isSelected: boolean;
  isDisabled?: boolean;
  handleClick: () => void;
  handleKeyDown: (e: React.KeyboardEvent) => void;
  children: React.ReactNode;
}) => (
  <div
    role="option"
    aria-selected={isSelected}
    aria-disabled={isDisabled}
    tabIndex={0}
    onClick={isDisabled ? noop : handleClick}
    onKeyDown={isDisabled ? noop : handleKeyDown}
    className={cn(
      "group flex cursor-pointer items-center gap-3 overflow-hidden rounded-lg border py-3 pl-3 pr-4 transition-colors",
      isSelected
        ? "border-accent bg-accent-foreground/10"
        : "border-border bg-surface-50 hover:bg-surface-hover"
    )}
  >
    {children}
  </div>
);

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

const DeleteButton = ({
  onDelete,
  datasetName,
  isDisabled = false,
}: {
  onDelete: (e: React.MouseEvent) => void;
  datasetName: string;
  isDisabled?: boolean;
}) => (
  <Button
    variant="destructive"
    size="sm-icon"
    onClick={onDelete}
    disabled={isDisabled}
    aria-label={`Delete ${datasetName}`}
    className="opacity-0 transition-all focus-visible:opacity-100 group-hover:opacity-100 group-focus-visible:opacity-100"
  >
    <TrashIcon />
  </Button>
);

const DatasetCardInfo = ({
  dataset,
  isSelected,
}: {
  dataset: DatasetInfo;
  isSelected: boolean;
}) => {
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-1">
      <DatasetName isSelected={isSelected}>{dataset.name}</DatasetName>
      <DatasetMeta dataset={dataset} />
    </div>
  );
};

const DatasetCardActions = ({
  dataset,
  onToggle,
  onDelete,
  isSelected,
  isLoading = false,
}: {
  dataset: DatasetInfo;
  onToggle: (id: string) => void;
  onDelete?: (id: string) => void;
  isSelected: boolean;
  isLoading?: boolean;
}) => {
  const { id, name } = dataset;

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete?.(id);
  };

  const handleChange = () => onToggle(id);

  return (
    <div className="flex items-center gap-2">
      {onDelete && (
        <DeleteButton
          onDelete={handleDelete}
          datasetName={name}
          isDisabled={isLoading}
        />
      )}
      <div onClick={(e) => e.stopPropagation()}>
        <div
          className={cn(
            "flex items-center justify-center size-6",
            !isLoading && "hidden"
          )}
        >
          <Spinner size="md" />
        </div>
        <Checkbox
          checked={isSelected}
          onChange={handleChange}
          aria-label={`Select ${name}`}
          tabIndex={-1}
          className={cn(isLoading && "hidden")}
        />
      </div>
    </div>
  );
};

type DatasetCardProps = {
  dataset: DatasetInfo;
  onToggle: (id: string) => void;
  onDelete?: (id: string) => void;
};

const DatasetCard = ({ dataset, onToggle, onDelete }: DatasetCardProps) => {
  const { isSelected, isLoaded, id, source, emoji } = dataset;

  const isSelectedAndLoaded = isSelected && isLoaded;
  const isLoading = isSelected && !isLoaded;

  const handleClick = () => onToggle(id);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      onToggle(id);
    }
  };

  return (
    <DatasetCardWrapper
      isSelected={isSelectedAndLoaded}
      isDisabled={isLoading}
      handleClick={handleClick}
      handleKeyDown={handleKeyDown}
    >
      <DatasetIcon source={source} emoji={emoji} />
      <DatasetCardInfo dataset={dataset} isSelected={isSelectedAndLoaded} />
      <DatasetCardActions
        dataset={dataset}
        onToggle={onToggle}
        onDelete={onDelete}
        isSelected={isSelectedAndLoaded}
        isLoading={isLoading}
      />
    </DatasetCardWrapper>
  );
};

export { DatasetCard };
