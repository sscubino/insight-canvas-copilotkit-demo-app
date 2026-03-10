import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { CopilotKit } from "@copilotkit/react-core";
import { DuckDBProvider } from "@/lib/duckdb/duckdb-provider";
import "@copilotkit/react-ui/styles.css";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
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
        className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased`}
      >
        <CopilotKit
          runtimeUrl="/api/copilotkit"
          enableInspector={process.env.NODE_ENV === "development"}
        >
          <DuckDBProvider>{children}</DuckDBProvider>
        </CopilotKit>
      </body>
    </html>
  );
};

export default RootLayout;
