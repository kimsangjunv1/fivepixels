import { useCallback, useState, type RefObject } from "react";
import { useGhostCornerResize, type BoxRect } from "@/shared/hooks/useGhostCornerResize.js";
import { clampTooltipExpandedSize } from "@/shared/utils/marker/coordinates.js";

export type TooltipCustomSize = {
    width: number;
    height: number;
};

export type TooltipManualPosition = {
    left: number;
    top: number;
};

export function useTooltipResize({
    enabled,
    tooltipRef,
}: {
    enabled: boolean;
    tooltipRef: RefObject<HTMLElement | null>;
}) {
    const [customSize, setCustomSize] = useState<TooltipCustomSize | null>(null);
    const [manualPosition, setManualPosition] = useState<TooltipManualPosition | null>(null);

    const handleResizeComplete = useCallback((rect: BoxRect) => {
        setCustomSize({ width: rect.width, height: rect.height });
        setManualPosition({ left: rect.left, top: rect.top });
    }, []);

    const { isResizing, ghostRef, createResizePointerDown } = useGhostCornerResize({
        enabled,
        targetRef: tooltipRef,
        clampSize: clampTooltipExpandedSize,
        onResizeComplete: handleResizeComplete,
    });

    const resetTooltipSize = useCallback(() => {
        setCustomSize(null);
        setManualPosition(null);
    }, []);

    return {
        customSize,
        manualPosition,
        isResizing,
        ghostRef,
        createResizePointerDown,
        resetTooltipSize,
    };
}
