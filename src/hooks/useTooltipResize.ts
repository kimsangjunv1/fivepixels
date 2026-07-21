import { useCallback, useState, type RefObject } from "react";
import { useGhostCornerResize } from "@/hooks/useGhostCornerResize.js";
import { clampTooltipExpandedSize } from "@/utils/marker/coordinates.js";

export type TooltipCustomSize = {
    width: number;
    height: number;
};

export function useTooltipResize({
    enabled,
    tooltipRef,
}: {
    enabled: boolean;
    tooltipRef: RefObject<HTMLElement | null>;
}) {
    const [customSize, setCustomSize] = useState<TooltipCustomSize | null>(null);

    const handleResizeComplete = useCallback((size: TooltipCustomSize) => {
        setCustomSize(size);
    }, []);

    const { isResizing, ghostRef, handleResizePointerDown } = useGhostCornerResize({
        enabled,
        targetRef: tooltipRef,
        handleCorner: "bottom-right",
        clampSize: clampTooltipExpandedSize,
        onResizeComplete: handleResizeComplete,
    });

    const resetTooltipSize = useCallback(() => {
        setCustomSize(null);
    }, []);

    return {
        customSize,
        isResizing,
        ghostRef,
        handleResizePointerDown,
        resetTooltipSize,
    };
}
