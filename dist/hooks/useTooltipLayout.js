import { useCallback, useLayoutEffect, useMemo, useRef, useState } from "react";
import { getTooltipAnchorStyle, getTooltipPosition } from "../utils/marker/coordinates.js";
export function useTooltipLayout(anchor, expanded, visible, layoutOptions) {
    const elementRef = useRef(null);
    const [measuredHeight, setMeasuredHeight] = useState(null);
    const hasFixedHeight = layoutOptions?.customHeight !== undefined;
    const setTooltipElement = useCallback((node) => {
        elementRef.current = node;
    }, []);
    useLayoutEffect(() => {
        if (!visible) {
            setMeasuredHeight(null);
            return;
        }
        if (hasFixedHeight) {
            return;
        }
        const node = elementRef.current;
        if (!node) {
            return;
        }
        const measure = () => {
            setMeasuredHeight(node.getBoundingClientRect().height);
        };
        measure();
        const resizeObserver = new ResizeObserver(measure);
        resizeObserver.observe(node);
        return () => {
            resizeObserver.disconnect();
        };
    }, [hasFixedHeight, visible, anchor?.left, anchor?.top, expanded, layoutOptions?.customWidth]);
    const layout = useMemo(() => {
        if (!anchor || !visible) {
            return null;
        }
        const position = getTooltipPosition(anchor, expanded, {
            width: layoutOptions?.customWidth,
            height: layoutOptions?.customHeight ?? measuredHeight ?? undefined,
        });
        return {
            position,
            anchorStyle: getTooltipAnchorStyle(position.placement),
        };
    }, [anchor, expanded, layoutOptions?.customHeight, layoutOptions?.customWidth, measuredHeight, visible]);
    return {
        layout,
        setTooltipElement,
    };
}
//# sourceMappingURL=useTooltipLayout.js.map