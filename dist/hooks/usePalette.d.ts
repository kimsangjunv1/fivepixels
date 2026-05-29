import type { ResolvedAppearance } from "../types/report-ui.js";
export declare function usePalette(appearance: ResolvedAppearance): {
    panel: string;
    panelBorder: string;
    text: string;
    muted: string;
    input: string;
    inputBorder: string;
    inputText: string;
    chip: string;
    overlay: string;
    card: string;
};
export type ReportPalette = ReturnType<typeof usePalette>;
//# sourceMappingURL=usePalette.d.ts.map