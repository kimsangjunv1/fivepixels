import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { APPEARANCE_SCALE_VALUES } from "../constants/markerAppearance.js";
import { DiscreteScaleDial } from "./DiscreteScaleDial.js";
/** Shared marker size dial (onboarding display step + settings). */
export function PanelMarkerDisplayControls({ markerSize, onMarkerSizeChange, scaleLabels, markerSizeLabel, markerSizeAriaLabel, }) {
    return (_jsxs("div", { children: [_jsx("p", { className: "mb-[6px] text-[11px] font-medium text-[var(--adaptive-black600)]", children: markerSizeLabel }), _jsx(DiscreteScaleDial, { values: APPEARANCE_SCALE_VALUES, value: markerSize, onChange: onMarkerSizeChange, labels: scaleLabels, ariaLabel: markerSizeAriaLabel })] }));
}
//# sourceMappingURL=PanelMarkerDisplayControls.js.map