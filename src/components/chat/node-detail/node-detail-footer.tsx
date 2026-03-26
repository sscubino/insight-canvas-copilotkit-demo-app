import { PlayIcon } from "@/components/icons/play";
import { TrashIcon } from "@/components/icons/trash";
import { Button } from "@/components/ui/button";
import { DrawerFooter } from "@/components/ui/drawer";
import { CanvasNode } from "@/types/canvas";

const NodeDetailFooter = ({
  node,
  hasPendingEdits,
  handleRemoveNode,
  handleRunEdits,
}: {
  node: CanvasNode | null;
  hasPendingEdits: boolean;
  handleRemoveNode: () => void;
  handleRunEdits: () => void;
}) => {
  if (!node) return null;

  if (node.data.variant === "chart")
    return (
      <DrawerFooter className="flex">
        <Button
          variant="destructive"
          size="md"
          onClick={handleRemoveNode}
          className="w-full"
        >
          <TrashIcon width={16} height={16} />
          Remove Chart
        </Button>
      </DrawerFooter>
    );

  return (
    <DrawerFooter className="flex gap-2">
      <Button variant="destructive" size="md" onClick={handleRemoveNode}>
        <TrashIcon width={16} height={16} />
      </Button>
      <Button
        variant="primary"
        size="md"
        onClick={handleRunEdits}
        className="w-full"
        disabled={!hasPendingEdits}
      >
        <PlayIcon width={16} height={16} />
        Run Edits
      </Button>
    </DrawerFooter>
  );
};

export { NodeDetailFooter };
