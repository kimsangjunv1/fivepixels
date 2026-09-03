import { type RefObject } from "react";
export type TooltipCustomSize = {
    width: number;
    height: number;
};
export type TooltipManualPosition = {
    left: number;
    top: number;
};
export declare function useTooltipResize({ enabled, tooltipRef, }: {
    enabled: boolean;
    tooltipRef: RefObject<HTMLElement | null>;
}): {
    customSize: TooltipCustomSize | null;
    manualPosition: TooltipManualPosition | null;
    isResizing: boolean;
    ghostRef: import("react").MutableRefObject<HTMLDivElement | null>;
    createResizePointerDown: (handle: import("../../shared/hooks/useGhostCornerResize.js").ResizeHandle) => (event: import("react").PointerEvent<HTMLElement>) => void;
    resetTooltipSize: () => void;
};
//# sourceMappingURL=useTooltipResize.d.ts.map