import { jsx as _jsx, Fragment as _Fragment } from "react/jsx-runtime";
import { useCallback, useEffect, useMemo, useState } from "react";
import { HoverTooltip } from "../../components/ui/HoverTooltip.js";
import { useReportPreferences, useReportSession } from "../../providers/reportContext.js";
import { getMarkerDotSize } from "../../utils/marker/markerRuntime.js";
import { resolveMarkerGlyphPaint, resolveMarkerShapeStyle } from "../../utils/marker/markerShape.js";
import { MEMO_MARKER_COLOR, resolveMemoMarkerPositions } from "../../utils/memo/elementMemoMarkers.js";
import { MarkerShapeGlyph } from "./MarkerShapeGlyph.js";
const MARKER_ANCHOR_BASE_CLASS = "pointer-events-auto fixed z-[1000000]";
const MARKER_BUTTON_BASE_CLASS = "flex items-center justify-center border-0 bg-transparent p-0 shadow-none";
function MemoMarkerButton({ marker, markerAppearance, ariaLabel, onActivate }) {
    const dotSize = getMarkerDotSize();
    const shapeStyle = resolveMarkerShapeStyle(markerAppearance.shape, dotSize);
    const paint = resolveMarkerGlyphPaint(MEMO_MARKER_COLOR, markerAppearance.fillStyle, shapeStyle.strokeWidthPx);
    const handleClick = useCallback((event) => {
        event.stopPropagation();
        onActivate(marker, event.clientX, event.clientY);
    }, [marker, onActivate]);
    return (_jsx("div", { className: `${MARKER_ANCHOR_BASE_CLASS} ${shapeStyle.anchorClass}`, style: {
            left: marker.left,
            top: marker.top,
        }, "data-fivepixels-interactive": "", onPointerDown: (event) => event.stopPropagation(), onClick: (event) => event.stopPropagation(), children: _jsx("div", { className: "relative transition-transform duration-150", children: _jsx(HoverTooltip, { content: marker.text, multiline: true, children: _jsx("button", { type: "button", "data-fivepixels-interactive": "", "aria-label": ariaLabel, onClick: handleClick, className: `${MARKER_BUTTON_BASE_CLASS} relative`, style: {
                        width: shapeStyle.width,
                        height: shapeStyle.height,
                        minWidth: shapeStyle.width,
                        minHeight: shapeStyle.height,
                    }, children: _jsx("span", { className: "pointer-events-none absolute inset-0 flex items-center justify-center", children: _jsx(MarkerShapeGlyph, { shape: markerAppearance.shape, fill: paint.fill, width: shapeStyle.width, height: shapeStyle.height, stroke: paint.stroke, strokeWidthPx: paint.strokeWidthPx }) }) }) }) }) }));
}
export function MemoMarkersLayer() {
    const { elementMemos, openMemoComposer } = useReportSession();
    const { markerAppearance, messages } = useReportPreferences();
    const [tick, setTick] = useState(0);
    useEffect(() => {
        if (Object.keys(elementMemos).length === 0) {
            return;
        }
        const update = () => setTick((value) => value + 1);
        update();
        window.addEventListener("resize", update);
        window.addEventListener("scroll", update, true);
        return () => {
            window.removeEventListener("resize", update);
            window.removeEventListener("scroll", update, true);
        };
    }, [elementMemos]);
    const markers = useMemo(() => resolveMemoMarkerPositions(elementMemos), [elementMemos, tick]);
    const handleActivate = useCallback((marker, clientX, clientY) => {
        openMemoComposer(marker.elementKey, clientX, clientY + 8);
    }, [openMemoComposer]);
    if (markers.length === 0) {
        return null;
    }
    return (_jsx(_Fragment, { children: markers.map((marker) => (_jsx(MemoMarkerButton, { marker: marker, markerAppearance: markerAppearance, ariaLabel: messages.pickTarget.memoMarkerAriaLabel(marker.text), onActivate: handleActivate }, marker.elementKey))) }));
}
//# sourceMappingURL=MemoMarkersLayer.js.map