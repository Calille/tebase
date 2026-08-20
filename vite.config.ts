import path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { tempo } from "tempo-devtools/dist/vite";

const conditionalPlugins: [string, Record<string, unknown>][] = [];

// @ts-ignore
if (process.env.TEMPO === "true") {
  conditionalPlugins.push(["tempo-devtools/swc", {}]);
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

export default defineConfig({
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
});
