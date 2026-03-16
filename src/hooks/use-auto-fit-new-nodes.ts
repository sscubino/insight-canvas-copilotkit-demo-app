"use client";

import { useEffect, useRef, type RefObject } from "react";
import { useReactFlow } from "@xyflow/react";
import type { CanvasNode } from "@/types/canvas";

type UseAutoFitNewNodesParams = {
  nodes: CanvasNode[];
  containerRef: RefObject<HTMLDivElement | null>;
};

const FALLBACK_NODE_WIDTH = 220;
const FALLBACK_NODE_HEIGHT = 150;

export const useAutoFitNewNodes = ({
  nodes,
  containerRef,
}: UseAutoFitNewNodesParams) => {
  const { fitView, flowToScreenPosition } = useReactFlow();
  const prevNodeIdsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    const currentIds = new Set(nodes.map((node) => node.id));
    const newNodes = nodes.filter(
      (node) => !prevNodeIdsRef.current.has(node.id)
    );
    prevNodeIdsRef.current = currentIds;

    const container = containerRef.current;
    if (newNodes.length === 0 || !container) return;

    const rect = container.getBoundingClientRect();

    const hasOffscreenNode = newNodes.some((node) => {
      const nodeWidth = node.measured?.width ?? FALLBACK_NODE_WIDTH;
      const nodeHeight = node.measured?.height ?? FALLBACK_NODE_HEIGHT;

      const topLeft = flowToScreenPosition(node.position);
      const bottomRight = flowToScreenPosition({
        x: node.position.x + nodeWidth,
        y: node.position.y + nodeHeight,
      });

      return (
        topLeft.x < rect.left ||
        bottomRight.x > rect.right ||
        topLeft.y < rect.top ||
        bottomRight.y > rect.bottom
      );
    });

    if (!hasOffscreenNode) return;

    const timer = setTimeout(() => {
      fitView({ padding: { x: 0.1, y: 0.3 }, duration: 500 });
    }, 50);

    return () => clearTimeout(timer);
  }, [nodes.length, containerRef, fitView, flowToScreenPosition]);
};
