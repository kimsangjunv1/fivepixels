import { useCallback, useState } from "react";
import { useGhostCornerResize } from "../hooks/useGhostCornerResize.js";
import { clampTooltipExpandedSize } from "../utils/coordinates.js";
export function useTooltipResize({ enabled, tooltipRef, }) {
    const [customSize, setCustomSize] = useState(null);
    const handleResizeComplete = useCallback((size) => {
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
//# sourceMappingURL=useTooltipResize.js.map