import { APPEARANCE_SCALE_VALUES, MARKER_FONT_SIZE_VALUES, type AppearanceScale, type MarkerFontSize } from "@/constants/markerAppearance.js";
import { DiscreteScaleDial } from "./DiscreteScaleDial.js";

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
export function PanelMarkerDisplayControls({
    markerSize,
    fontSize,
    onMarkerSizeChange,
    onFontSizeChange,
    scaleLabels,
    markerFontSizeLabels,
    markerSizeLabel,
    markerFontSizeLabel,
    markerSizeAriaLabel,
    markerFontSizeAriaLabel,
}: PanelMarkerDisplayControlsProps) {
    return (
        <div className="flex flex-col gap-[12px]">
            <div>
                <p className="mb-[6px] text-[11px] font-medium text-[var(--adaptive-black600)]">{markerSizeLabel}</p>
                <DiscreteScaleDial
                    values={APPEARANCE_SCALE_VALUES}
                    value={markerSize}
                    onChange={onMarkerSizeChange}
                    labels={scaleLabels}
                    ariaLabel={markerSizeAriaLabel}
                />
            </div>
            <div>
                <p className="mb-[6px] text-[11px] font-medium text-[var(--adaptive-black600)]">{markerFontSizeLabel}</p>
                <DiscreteScaleDial
                    values={MARKER_FONT_SIZE_VALUES}
                    value={fontSize}
                    onChange={onFontSizeChange}
                    labels={markerFontSizeLabels}
                    ariaLabel={markerFontSizeAriaLabel}
                />
            </div>
        </div>
    );
}
