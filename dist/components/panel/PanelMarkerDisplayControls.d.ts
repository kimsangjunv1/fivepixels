import { type AppearanceScale, type MarkerFontSize } from "../../constants/markerAppearance.js";
type PanelMarkerDisplayControlsProps = {
    markerSize: AppearanceScale;
    fontSize: MarkerFontSize;
    onMarkerSizeChange: (size: AppearanceScale) => void;
    onFontSizeChange: (size: MarkerFontSize) => void;
    scaleLabels: Record<AppearanceScale, string>;
    markerFontSizeLabels: Record<MarkerFontSize, string>;
    markerSizeLabel: string;
    markerFontSizeLabel: string;
    markerSizeAriaLabel: string;
    markerFontSizeAriaLabel: string;
};
/** Shared marker size + font size dials (onboarding display step + settings). */
export declare function PanelMarkerDisplayControls({ markerSize, fontSize, onMarkerSizeChange, onFontSizeChange, scaleLabels, markerFontSizeLabels, markerSizeLabel, markerFontSizeLabel, markerSizeAriaLabel, markerFontSizeAriaLabel, }: PanelMarkerDisplayControlsProps): import("react").JSX.Element;
export {};
//# sourceMappingURL=PanelMarkerDisplayControls.d.ts.map