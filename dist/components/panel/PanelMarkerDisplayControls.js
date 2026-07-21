import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { APPEARANCE_SCALE_VALUES, MARKER_FONT_SIZE_VALUES } from "../../constants/markerAppearance.js";
import { DiscreteScaleDial } from "./DiscreteScaleDial.js";
/** Shared marker size + font size dials (onboarding display step + settings). */
export function PanelMarkerDisplayControls({ markerSize, fontSize, onMarkerSizeChange, onFontSizeChange, scaleLabels, markerFontSizeLabels, markerSizeLabel, markerFontSizeLabel, markerSizeAriaLabel, markerFontSizeAriaLabel, }) {
    return (_jsxs("div", { className: "flex flex-col gap-[12px]", children: [_jsxs("div", { children: [_jsx("p", { className: "mb-[6px] text-[11px] font-medium text-[var(--adaptive-black600)]", children: markerSizeLabel }), _jsx(DiscreteScaleDial, { values: APPEARANCE_SCALE_VALUES, value: markerSize, onChange: onMarkerSizeChange, labels: scaleLabels, ariaLabel: markerSizeAriaLabel })] }), _jsxs("div", { children: [_jsx("p", { className: "mb-[6px] text-[11px] font-medium text-[var(--adaptive-black600)]", children: markerFontSizeLabel }), _jsx(DiscreteScaleDial, { values: MARKER_FONT_SIZE_VALUES, value: fontSize, onChange: onFontSizeChange, labels: markerFontSizeLabels, ariaLabel: markerFontSizeAriaLabel })] })] }));
}
//# sourceMappingURL=PanelMarkerDisplayControls.js.map