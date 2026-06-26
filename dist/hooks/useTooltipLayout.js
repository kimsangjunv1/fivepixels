import { useCallback, useLayoutEffect, useMemo, useRef, useState } from "react";
import { getTooltipAnchorStyle, getTooltipPosition } from "@/utils/coordinates.js";
export function useTooltipLayout(anchor, expanded, visible) {
    const elementRef = useRef(null);
    const [measuredHeight, setMeasuredHeight] = useState(null);
    const setTooltipElement = useCallback((node) => {
        elementRef.current = node;
    }, []);
    useLayoutEffect(() => {
        if (!visible) {
            setMeasuredHeight(null);
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
    }, [visible, anchor?.left, anchor?.top, expanded]);
    const layout = useMemo(() => {
        if (!anchor || !visible) {
            return null;
        }
        const position = getTooltipPosition(anchor, expanded, {
            height: measuredHeight ?? undefined,
        });
        return {
            position,
            anchorStyle: getTooltipAnchorStyle(position.placement),
        };
    }, [anchor, expanded, measuredHeight, visible]);
    return {
        layout,
        setTooltipElement,
    };
}
//# sourceMappingURL=useTooltipLayout.js.map