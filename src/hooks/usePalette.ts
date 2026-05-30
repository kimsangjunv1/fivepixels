import { useMemo } from "react";
import type { ResolvedAppearance } from "../types/report-ui.js";

export function usePalette(appearance: ResolvedAppearance) {
    return useMemo(
        () =>
            appearance === "dark"
                ? {
                      panel: "rgba(15, 23, 42, 0.94)",
                      panelBorder: "rgba(148, 163, 184, 0.22)",
                      text: "#f8fafc",
                      muted: "rgba(226, 232, 240, 0.68)",
                      input: "#0f172a",
                      inputBorder: "rgba(148, 163, 184, 0.28)",
                      inputText: "#f8fafc",
                      chip: "rgba(51, 65, 85, 0.9)",
                      overlay: "rgba(15, 23, 42, 0.08)",
                      card: "rgba(15, 23, 42, 0.82)",
                  }
                : {
                      panel: "rgba(255, 255, 255, 0.96)",
                      panelBorder: "rgba(15, 23, 42, 0.12)",
                      text: "#0f172a",
                      muted: "rgba(71, 85, 105, 0.82)",
                      input: "#ffffff",
                      inputBorder: "rgba(148, 163, 184, 0.35)",
                      inputText: "#0f172a",
                      chip: "rgba(226, 232, 240, 0.92)",
                      overlay: "rgba(15, 23, 42, 0.04)",
                      card: "rgba(255, 255, 255, 0.97)",
                  },
        [appearance],
    );
}

export type ReportPalette = ReturnType<typeof usePalette>;
