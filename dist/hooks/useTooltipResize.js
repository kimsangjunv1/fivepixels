import { useCallback, useState } from "react";
import { useGhostCornerResize } from "../hooks/useGhostCornerResize.js";
import { clampTooltipExpandedSize } from "../utils/marker/coordinates.js";
export function useTooltipResize({ enabled, tooltipRef, }) {
    const [customSize, setCustomSize] = useState(null);
    const [manualPosition, setManualPosition] = useState(null);
    const handleResizeComplete = useCallback((rect) => {
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
//# sourceMappingURL=useTooltipResize.js.map