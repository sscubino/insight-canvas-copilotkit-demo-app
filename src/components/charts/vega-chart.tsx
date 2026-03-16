"use client";

import { useEffect, useRef, useState, memo } from "react";
import { cn } from "@/lib/utils";

type VegaChartProps = {
  spec: Record<string, unknown> | undefined;
  className?: string;
};

const DEFAULT_CHART_WIDTH = 176;
const DEFAULT_CHART_HEIGHT = 190;

const asObject = (value: unknown): Record<string, unknown> | undefined => {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return undefined;
  }
  return value as Record<string, unknown>;
};

const withDefaultChartLayout = (spec: Record<string, unknown>) => {
  const config = asObject(spec.config);
  const axisX = asObject(config?.axisX);
  const axisY = asObject(config?.axisY);
  const barConfig = asObject(config?.bar);
  const scaleConfig = asObject(config?.scale);

  return {
    ...spec,
    width: spec.width ?? DEFAULT_CHART_WIDTH,
    height: spec.height ?? DEFAULT_CHART_HEIGHT,
    autosize: spec.autosize ?? { type: "fit", contains: "padding" },
    config: {
      ...config,
      bar: {
        ...barConfig,
        discreteBandSize: barConfig?.discreteBandSize ?? 28,
      },
      scale: {
        ...scaleConfig,
        bandPaddingInner: scaleConfig?.bandPaddingInner ?? 0.35,
      },
      axisX: {
        ...axisX,
        labelAngle: axisX?.labelAngle ?? -35,
      },
      axisY: {
        ...axisY,
        titlePadding: axisY?.titlePadding ?? 8,
      },
    },
  };
};

const VegaChart = memo(({ spec, className }: VegaChartProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let cancelled = false;

    const renderChart = async () => {
      try {
        if (!spec) {
          container.innerHTML = "";
          return;
        }

        const vegaEmbed = (await import("vega-embed")).default;
        if (cancelled || !container) return;

        const normalizedSpec = withDefaultChartLayout(spec);
        setError(null);

        await vegaEmbed(
          container,
          normalizedSpec as Parameters<typeof vegaEmbed>[1],
          {
            actions: false,
            renderer: "svg",
          }
        );
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Failed to render chart"
          );
        }
      }
    };

    renderChart();

    return () => {
      cancelled = true;
    };
  }, [spec]);

  if (error) {
    return (
      <p
        className={cn(
          "rounded-md border border-experiment-border bg-experiment-bg p-2 text-xs text-experiment",
          className
        )}
      >
        {error}
      </p>
    );
  }

  return (
    <div
      ref={containerRef}
      className={cn(
        "w-full overflow-hidden [&_.vega-embed]:p-0! pr-6",
        className
      )}
      role="img"
      aria-label="Data visualization chart"
    />
  );
});

VegaChart.displayName = "VegaChart";

export { VegaChart };
