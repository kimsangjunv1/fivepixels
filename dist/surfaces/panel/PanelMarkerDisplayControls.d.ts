import { type AppearanceScale } from "../../shared/constants/markerAppearance.js";
type PanelMarkerDisplayControlsProps = {
    markerSize: AppearanceScale;
    onMarkerSizeChange: (size: AppearanceScale) => void;
    scaleLabels: Record<AppearanceScale, string>;
    markerSizeLabel: string;
    markerSizeAriaLabel: string;
};
/** Shared marker size dial (onboarding display step + settings). */
export declare function PanelMarkerDisplayControls({ markerSize, onMarkerSizeChange, scaleLabels, markerSizeLabel, markerSizeAriaLabel, }: PanelMarkerDisplayControlsProps): import("react").JSX.Element;
export {};
//# sourceMappingURL=PanelMarkerDisplayControls.d.ts.map