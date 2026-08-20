import path from "path";
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react-swc";
import { tempo } from "tempo-devtools/dist/vite";

const conditionalPlugins: [string, Record<string, unknown>][] = [];

// @ts-ignore
if (process.env.TEMPO === "true") {
  conditionalPlugins.push(["tempo-devtools/swc", {}]);
}

function assertVercelEnv(command: "build" | "serve") {
  if (process.env.VERCEL && command === "build") {
    if (!process.env.VITE_SUPABASE_URL || !process.env.VITE_SUPABASE_ANON_KEY) {
      throw new Error(
        "Vercel build is missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. Add both in the Vercel project Environment Variables (Production and Preview), then redeploy."
      );
    }
  }
}

const stripTempoHtml = {
  name: "strip-tempo-html",
  transformIndexHtml(html: string) {
    const keepTempo =
      process.env.TEMPO === "true" ||
      process.env.VITE_TEMPO === "true" ||
      process.env.NODE_ENV !== "production";
    if (keepTempo) return html;
    return html.replace(
      /\s*<script src="https:\/\/api\.tempolabs\.ai[^"]*"><\/script>/,
      ""
    );
  },
};

export default defineConfig(({ command }) => {
  assertVercelEnv(command);

  return {
    base:
      process.env.NODE_ENV === "development"
        ? "/"
        : process.env.VITE_BASE_PATH || "/",
    optimizeDeps: {
      entries: ["src/main.tsx", "src/tempobook/**/*"],
    },
    plugins: [
      react({
        plugins: conditionalPlugins,
      }),
      tempo(),
      stripTempoHtml,
    ],
    resolve: {
      preserveSymlinks: true,
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    server: {
      // @ts-ignore
      allowedHosts: true,
      port: 3000,
    },
    test: {
      environment: "jsdom",
      setupFiles: "./src/test/setup.ts",
    },
  };
});
