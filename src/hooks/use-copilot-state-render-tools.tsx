import { ActionStatus } from "@/components/chat/action-status";
import { useRenderTool } from "@copilotkit/react-core/v2";
import z from "zod";

const useCopilotStateRenderTools = () => {
  useRenderTool(
    {
      name: "AGUISendStateSnapshot",
      parameters: z.object({ snapshot: z.any() }),
      render: ({ status }) =>
        status === "complete" ? (
          <ActionStatus variant="success">Canvas updated</ActionStatus>
        ) : (
          <ActionStatus variant="loading">Updating canvas…</ActionStatus>
        ),
    },
    []
  );

  useRenderTool(
    {
      name: "AGUISendStateDelta",
      parameters: z.object({ delta: z.array(z.any()) }),
      render: ({ status }) =>
        status === "complete" ? (
          <ActionStatus variant="success">Canvas updated</ActionStatus>
        ) : (
          <ActionStatus variant="loading">Updating canvas…</ActionStatus>
        ),
    },
    []
  );
};

export { useCopilotStateRenderTools };
