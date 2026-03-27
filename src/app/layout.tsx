import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Spline_Sans_Mono } from "next/font/google";
import { CopilotKit } from "@copilotkit/react-core";
import { DuckDBProvider } from "@/contexts/duckdb-context";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { AppStateBootstrap } from "@/components/state/app-state-bootstrap";
import "@copilotkit/react-ui/v2/styles.css";
import "./globals.css";
import { BackgroundShapes } from "@/components/layout/background-shapes";
import { cn } from "@/lib/utils";
import { INSIGHT_CANVAS_AGENT_ID } from "@/mastra/constants";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const splineMono = Spline_Sans_Mono({
  variable: "--font-spline-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "Insight Canvas",
  description:
    "Collaborative AI reasoning partner for data analysis. Built with CopilotKit.",
};

const RootLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
    <html lang="en">
      <body
        className={cn(
          `${jakarta.variable} ${splineMono.variable}`,
          "flex h-screen overflow-hidden font-sans antialiased bg-site-background p-2"
        )}
      >
        <BackgroundShapes />
        <CopilotKit
          runtimeUrl="/api/copilotkit"
          enableInspector={false}
          agent={INSIGHT_CANVAS_AGENT_ID}
        >
          <DuckDBProvider>
            <AppStateBootstrap />
            <AppSidebar />
            <div className="flex-1 ml-2">{children}</div>
          </DuckDBProvider>
        </CopilotKit>
      </body>
    </html>
  );
};

export default RootLayout;
