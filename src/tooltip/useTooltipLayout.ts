import { useCallback, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { Marker } from "@/types/report-ui.js";
import { getTooltipAnchorStyle, getTooltipPosition } from "@/utils/marker/coordinates.js";

export type TooltipAnchor = Pick<Marker, "left" | "top">;

export type TooltipLayoutOptions = {
    customWidth?: number;
    customHeight?: number;
};

export function useTooltipLayout(
    anchor: TooltipAnchor | null,
    expanded: boolean,
    visible: boolean,
    layoutOptions?: TooltipLayoutOptions,
) {
    const elementRef = useRef<HTMLElement | null>(null);
    const [measuredHeight, setMeasuredHeight] = useState<number | null>(null);
    const hasFixedHeight = layoutOptions?.customHeight !== undefined;

    const setTooltipElement = useCallback((node: HTMLElement | null) => {
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
