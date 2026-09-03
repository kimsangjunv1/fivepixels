import { type PointerEvent as ReactPointerEvent, type RefObject } from "react";
export type WindowPosition = {
    left: number;
    top: number;
};
export declare function clampWindowPosition(left: number, top: number, width: number, height: number): WindowPosition;
export declare function useDraggableWindow({ enabled, windowRef }: {
    enabled: boolean;
    windowRef: RefObject<HTMLElement | null>;
}): {
    position: WindowPosition | null;
    isDragging: boolean;
    handleDragHandlePointerDown: (event: ReactPointerEvent<HTMLElement>) => void;
    resetPosition: () => void;
    setPosition: import("react").Dispatch<import("react").SetStateAction<WindowPosition | null>>;
};
//# sourceMappingURL=useDraggableWindow.d.ts.map