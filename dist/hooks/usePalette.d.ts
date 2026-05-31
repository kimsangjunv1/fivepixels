import type { ResolvedAppearance } from "../types/report-ui.js";
export declare function usePalette(_appearance: ResolvedAppearance): {
    panel: "var(--stitchable-panel-bg)";
    panelBorder: "var(--stitchable-panel-border)";
    text: "var(--stitchable-text)";
    muted: "var(--stitchable-muted)";
    input: "var(--stitchable-input-bg)";
    inputBorder: "var(--stitchable-input-border)";
    inputText: "var(--stitchable-input-text)";
    chip: "var(--stitchable-chip-bg)";
    overlay: "var(--stitchable-overlay-bg)";
    card: "var(--stitchable-card-bg)";
    accent: "var(--stitchable-accent)";
    danger: "var(--stitchable-danger)";
    error: "var(--stitchable-error)";
};
export type ReportPalette = ReturnType<typeof usePalette>;
//# sourceMappingURL=usePalette.d.ts.map