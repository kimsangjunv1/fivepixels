import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { getMarkerDotSizePx, getMarkerLabelFontSizePx, } from "../../constants/markerAppearance.js";
import { resolveMarkerShapeStyle } from "../../utils/marker/markerShape.js";
export function MarkerSizePreview({ size, fontSize, shape, color, fontFamily, label = "1", ariaLabel }) {
    const dotSize = getMarkerDotSizePx(size);
    const showMarkerLabel = fontSize !== "none";
    const shapeStyle = resolveMarkerShapeStyle(shape, dotSize, showMarkerLabel, false);
    const markerFontSizePx = showMarkerLabel ? getMarkerLabelFontSizePx(fontSize) : undefined;
    return (_jsx("div", { className: "relative overflow-hidden rounded-[10px] border border-[var(--adaptive-border-subtle)] bg-[var(--adaptive-surface)]", "aria-label": ariaLabel, children: _jsxs("div", { className: "flex h-[88px]", children: [_jsx("div", { className: "w-[22%] shrink-0 bg-[var(--adaptive-black100)]" }), _jsxs("div", { className: "relative min-w-0 flex-1 p-[10px]", children: [_jsx("div", { className: "mb-[8px] h-[8px] w-[42%] rounded-[3px] bg-[var(--adaptive-black100)]" }), _jsxs("div", { className: "relative rounded-[8px] border border-[var(--adaptive-border-subtle)] bg-[var(--adaptive-black50)] p-[10px]", children: [_jsx("div", { className: "mb-[6px] h-[6px] w-[72%] rounded-[2px] bg-[var(--adaptive-black200)]" }), _jsx("div", { className: "mb-[6px] h-[6px] w-[58%] rounded-[2px] bg-[var(--adaptive-black200)]" }), _jsx("div", { className: "h-[6px] w-[34%] rounded-[2px] bg-[var(--adaptive-blue100)]" }), _jsx("div", { className: `pointer-events-none absolute left-[68%] top-[42%] ${shapeStyle.anchorClass}`, "aria-hidden": true, children: _jsx("div", { className: `flex items-center justify-center border-[2px] border-white shadow-[0_4px_10px_#00000090] ${shapeStyle.shapeClass} ${showMarkerLabel ? "text-white" : ""}`, style: {
                                            backgroundColor: color,
                                            width: shapeStyle.width,
                                            height: shapeStyle.height,
                                            minWidth: shapeStyle.width,
                                            minHeight: shapeStyle.height,
                                            paddingLeft: shapeStyle.paddingX,
                                            paddingRight: shapeStyle.paddingX,
                                            clipPath: shapeStyle.clipPath,
                                            fontSize: markerFontSizePx === undefined ? undefined : `${markerFontSizePx}px`,
                                            fontFamily: showMarkerLabel ? fontFamily : undefined,
                                            lineHeight: 1,
                                            fontWeight: 700,
                                        }, children: showMarkerLabel ? label : null }) })] })] })] }) }));
}
//# sourceMappingURL=MarkerSizePreview.js.map