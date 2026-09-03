import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { MARKER_SHAPE_VALUES } from "../constants/markerAppearance.js";
import { CheckIcon } from "../components/icons/Icons.js";
import { MarkerShapeGlyph } from "../marker/MarkerShapeGlyph.js";
import { resolveMarkerGlyphPaint, resolveMarkerShapeStyle } from "../utils/marker/markerShape.js";
function ShapePreview({ shape, previewColor, fillStyle, strokeColor = "#ffffff", }) {
    const preview = resolveMarkerShapeStyle(shape, 12);
    const paint = resolveMarkerGlyphPaint({
        color: previewColor,
        fillStyle,
        strokeColor,
        strokeWidthPx: preview.strokeWidthPx,
    });
    const width = Math.min(preview.width, 16);
    const height = Math.min(preview.height, 16);
    return (_jsx(MarkerShapeGlyph, { shape: shape, fill: paint.fill, width: width, height: height, stroke: paint.stroke, strokeWidthPx: paint.strokeWidthPx, style: { filter: "none" } }));
}
export function MarkerShapePicker({ value, onChange, labels, ariaLabel, previewColor, fillStyle = "filled", strokeColor = "#ffffff", }) {
    return (_jsx("div", { role: "radiogroup", "aria-label": ariaLabel, className: "grid grid-cols-4 gap-[6px]", children: MARKER_SHAPE_VALUES.map((shape) => {
            const active = shape === value;
            return (_jsxs("button", { type: "button", role: "radio", "aria-checked": active, onClick: () => onChange(shape), className: `group relative flex flex-col items-center gap-[5px] rounded-[8px] p-[4px] transition-colors ${active
                    ? "ring-2 ring-[var(--adaptive-blue500)] ring-offset-1 ring-offset-[var(--adaptive-black50)]"
                    : "ring-1 ring-[var(--adaptive-black200)] hover:ring-[var(--adaptive-black300)]"}`, children: [_jsxs("div", { className: "relative flex h-[28px] w-full items-center justify-center rounded-[5px] bg-[var(--adaptive-black100)]", children: [_jsx(ShapePreview, { shape: shape, previewColor: previewColor, fillStyle: fillStyle, strokeColor: strokeColor }), active ? (_jsx("span", { className: "absolute right-[2px] bottom-[2px] flex h-[12px] w-[12px] items-center justify-center rounded-full bg-[var(--adaptive-blue500)] text-white", children: _jsx(CheckIcon, { className: "h-[7px] w-[7px]" }) })) : null] }), _jsx("span", { className: `w-full truncate text-center text-[9px] leading-[1.2] ${active
                            ? "font-semibold text-[var(--adaptive-blue500)]"
                            : "font-medium text-[var(--adaptive-black600)] group-hover:text-[var(--adaptive-black800)]"}`, children: labels[shape] })] }, shape));
        }) }));
}
//# sourceMappingURL=MarkerShapePicker.js.map