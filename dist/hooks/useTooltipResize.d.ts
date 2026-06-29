import { type RefObject } from "react";
export type TooltipCustomSize = {
    width: number;
    height: number;
};
export declare function useTooltipResize({ enabled, tooltipRef, }: {
    enabled: boolean;
    tooltipRef: RefObject<HTMLElement | null>;
}): {
    customSize: TooltipCustomSize | null;
    isResizing: boolean;
    ghostRef: import("react").MutableRefObject<HTMLDivElement | null>;
    handleResizePointerDown: (event: import("react").PointerEvent<HTMLElement>) => void;
    resetTooltipSize: () => void;
};
//# sourceMappingURL=useTooltipResize.d.ts.map