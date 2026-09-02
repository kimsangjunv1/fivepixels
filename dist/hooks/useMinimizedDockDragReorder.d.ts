import { type MouseEvent as ReactMouseEvent, type PointerEvent as ReactPointerEvent, type RefObject } from "react";
export declare const MINIMIZED_DOCK_DRAG_LIFT_PX = 10;
type UseMinimizedDockDragReorderOptions = {
    windowId: string;
    windowRef: RefObject<HTMLElement | null>;
    enabled: boolean;
    blockDrag?: boolean;
    minimizedWidth: number;
    dockPosition: {
        left: number;
        top: number;
    };
};
export declare function useMinimizedDockDragReorder({ windowId, windowRef, enabled, blockDrag, minimizedWidth, dockPosition, }: UseMinimizedDockDragReorderOptions): {
    isDockDragging: boolean;
    displayLeft: number;
    displayTop: number;
    handleMinimizedDockPointerDown: (event: ReactPointerEvent<HTMLElement>) => void;
    handleMinimizedDockClickCapture: (event: ReactMouseEvent<HTMLElement>) => void;
};
export {};
//# sourceMappingURL=useMinimizedDockDragReorder.d.ts.map