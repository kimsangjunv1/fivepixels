import { APPEARANCE_SCALE_VALUES, type AppearanceScale } from "@/shared/constants/markerAppearance.js";
import { DiscreteScaleDial } from "./DiscreteScaleDial.js";

type PanelMarkerDisplayControlsProps = {
    markerSize: AppearanceScale;
    onMarkerSizeChange: (size: AppearanceScale) => void;
    scaleLabels: Record<AppearanceScale, string>;
    markerSizeLabel: string;
    markerSizeAriaLabel: string;
};

/** Shared marker size dial (onboarding display step + settings). */
export function PanelMarkerDisplayControls({
    markerSize,
    onMarkerSizeChange,
    scaleLabels,
    markerSizeLabel,
    markerSizeAriaLabel,
}: PanelMarkerDisplayControlsProps) {
    return (
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
    );
}
