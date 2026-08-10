import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { DOT_SIZE } from "../../constants/report.js";
import { getMarkerScaleFactor, resolveMarkerBadgeDisplay, } from "../../constants/markerAppearance.js";
import { getMarkerReplyBadgeSize, resolveMarkerGlyphPaint, resolveMarkerShapeStyle } from "../../utils/marker/markerShape.js";
import { MarkerReplyBadge } from "../../components/point/MarkerReplyBadge.js";
import { MarkerShapeGlyph } from "../../components/point/MarkerShapeGlyph.js";
export function MarkerSizePreview({ size, fontSize, shape, color, fontFamily, fillStyle = "filled", label = "1", ariaLabel, showReplyBadge = false, }) {
    const dotSize = DOT_SIZE * getMarkerScaleFactor(size);
    const badgeDisplay = fontSize === "none" ? { content: null, fontSizePx: undefined, fontWeight: undefined } : resolveMarkerBadgeDisplay(size, label);
    const showMarkerLabel = Boolean(badgeDisplay.content);
    const shapeStyle = resolveMarkerShapeStyle(shape, dotSize);
    const paint = resolveMarkerGlyphPaint(color, fillStyle, shapeStyle.strokeWidthPx);
    const replyBadgeSize = getMarkerReplyBadgeSize(dotSize);
    return (_jsx("div", { className: "relative overflow-hidden rounded-[10px] border border-[var(--adaptive-border-subtle)] bg-[var(--adaptive-surface)]", "aria-label": ariaLabel, children: _jsxs("div", { className: "flex h-[88px]", children: [_jsx("div", { className: "w-[22%] shrink-0 bg-[var(--adaptive-black100)]" }), _jsxs("div", { className: "relative min-w-0 flex-1 p-[10px]", children: [_jsx("div", { className: "mb-[8px] h-[8px] w-[42%] rounded-[3px] bg-[var(--adaptive-black100)]" }), _jsxs("div", { className: "relative rounded-[8px] border border-[var(--adaptive-border-subtle)] bg-[var(--adaptive-black50)] p-[10px]", children: [_jsx("div", { className: "mb-[6px] h-[6px] w-[72%] rounded-[2px] bg-[var(--adaptive-black200)]" }), _jsx("div", { className: "mb-[6px] h-[6px] w-[58%] rounded-[2px] bg-[var(--adaptive-black200)]" }), _jsx("div", { className: "h-[6px] w-[34%] rounded-[2px] bg-[var(--adaptive-blue100)]" }), _jsx("div", { className: `pointer-events-none absolute left-[68%] top-[42%] ${shapeStyle.anchorClass}`, "aria-hidden": true, children: _jsxs("div", { className: "relative flex items-center justify-center", style: { width: shapeStyle.width, height: shapeStyle.height }, children: [_jsx(MarkerShapeGlyph, { shape: shape, fill: paint.fill, width: shapeStyle.width, height: shapeStyle.height, stroke: paint.stroke, strokeWidthPx: paint.strokeWidthPx, style: { filter: "drop-shadow(0 4px 10px #00000090)" } }), showMarkerLabel ? (_jsx("span", { className: "absolute inset-0 z-[1] flex items-center justify-center", style: {
                                                    color: paint.labelColor,
                                                    fontSize: badgeDisplay.fontSizePx === undefined ? undefined : `${badgeDisplay.fontSizePx}px`,
                                                    fontWeight: badgeDisplay.fontWeight,
                                                    fontFamily,
                                                    lineHeight: 1,
                                                }, children: badgeDisplay.content })) : null, showReplyBadge ? (_jsx(MarkerReplyBadge, { size: replyBadgeSize, accentColor: color })) : null] }) })] })] })] }) }));
}
//# sourceMappingURL=MarkerSizePreview.js.map