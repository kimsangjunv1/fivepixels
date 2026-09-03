import { type RefObject } from "react";
import { type WindowPosition } from "../../shared/hooks/useDraggableWindow.js";
import type { BoxSize } from "../../shared/hooks/useGhostCornerResize.js";
import type { WindowMode } from "../../shared/types/windowChrome.js";
export declare function getWindowViewportSize(): {
    width: number;
    height: number;
};
export declare function getMaximizedWindowFrame(minWidth?: number, minHeight?: number): WindowPosition & BoxSize;
type UseWindowModeOptions = {
    mode?: WindowMode;
    defaultMode?: WindowMode;
    onModeChange?: (mode: WindowMode) => void;
    minWidth?: number;
    minHeight?: number;
    windowRef: RefObject<HTMLElement | null>;
    normalSize: BoxSize;
    hasExplicitHeight: boolean;
    resolvedPosition: WindowPosition;
    onPositionChange?: (position: WindowPosition) => void;
    setNormalSize: (size: BoxSize) => void;
    setHasExplicitHeight: (value: boolean) => void;
    setDragPosition: (position: WindowPosition) => void;
};
export declare function useWindowMode({ mode: modeProp, defaultMode, onModeChange, minWidth, minHeight, windowRef, normalSize, hasExplicitHeight, resolvedPosition, onPositionChange, setNormalSize, setHasExplicitHeight, setDragPosition, }: UseWindowModeOptions): {
    mode: WindowMode;
    isMinimized: boolean;
    isMaximized: boolean;
    setMode: (next: WindowMode) => void;
    captureRestoreFrame: () => void;
    toggleMinimized: () => void;
    toggleMaximized: () => void;
};
export {};
//# sourceMappingURL=useWindowMode.d.ts.map