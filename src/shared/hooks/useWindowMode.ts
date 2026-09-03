import { useCallback, useRef, useState, type RefObject } from "react";
import { clampWindowPosition, type WindowPosition } from "@/shared/hooks/useDraggableWindow.js";
import type { BoxSize } from "@/shared/hooks/useGhostCornerResize.js";
import type { WindowMode } from "@/shared/types/windowChrome.js";

const MAXIMIZE_MARGIN = 12;
const DEFAULT_MIN_WIDTH = 200;
const DEFAULT_MIN_HEIGHT = 120;

export function getWindowViewportSize() {
    if (typeof window === "undefined") {
        return { width: 1280, height: 720 };
    }

    return { width: window.innerWidth, height: window.innerHeight };
}

export function getMaximizedWindowFrame(minWidth = DEFAULT_MIN_WIDTH, minHeight = DEFAULT_MIN_HEIGHT): WindowPosition & BoxSize {
    const viewport = getWindowViewportSize();

    return {
        left: MAXIMIZE_MARGIN,
        top: MAXIMIZE_MARGIN,
        width: Math.max(minWidth, viewport.width - MAXIMIZE_MARGIN * 2),
        height: Math.max(minHeight, viewport.height - MAXIMIZE_MARGIN * 2),
    };
}

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

export function useWindowMode({
    mode: modeProp,
    defaultMode = "normal",
    onModeChange,
    minWidth = DEFAULT_MIN_WIDTH,
    minHeight = DEFAULT_MIN_HEIGHT,
    windowRef,
    normalSize,
    hasExplicitHeight,
    resolvedPosition,
    onPositionChange,
    setNormalSize,
    setHasExplicitHeight,
    setDragPosition,
}: UseWindowModeOptions) {
    const restoreFrameRef = useRef<(WindowPosition & BoxSize) | null>(null);
    const [uncontrolledMode, setUncontrolledMode] = useState<WindowMode>(defaultMode);
    const mode = modeProp ?? uncontrolledMode;
    const isMinimized = mode === "minimized";
    const isMaximized = mode === "maximized";

    const setMode = useCallback(
        (next: WindowMode) => {
            if (modeProp === undefined) {
                setUncontrolledMode(next);
            }

            onModeChange?.(next);
        },
        [modeProp, onModeChange],
    );

    const captureRestoreFrame = useCallback(() => {
        const node = windowRef.current;
        const rect = node?.getBoundingClientRect();

        restoreFrameRef.current = {
            left: rect?.left ?? resolvedPosition.left,
            top: rect?.top ?? resolvedPosition.top,
            width: rect?.width ?? normalSize.width,
            height: rect?.height ?? (hasExplicitHeight ? normalSize.height : Math.max(minHeight, rect?.height ?? minHeight)),
        };
    }, [hasExplicitHeight, minHeight, normalSize.height, normalSize.width, resolvedPosition.left, resolvedPosition.top, windowRef]);

    const toggleMinimized = useCallback(() => {
        if (isMinimized) {
            setMode("normal");
            return;
        }

        if (isMaximized) {
            captureRestoreFrame();
        }

        setMode("minimized");
    }, [captureRestoreFrame, isMaximized, isMinimized, setMode]);

    const toggleMaximized = useCallback(() => {
        if (isMaximized) {
            const restore = restoreFrameRef.current;

            if (restore) {
                setNormalSize({ width: restore.width, height: restore.height });
                setHasExplicitHeight(true);
                onPositionChange?.(clampWindowPosition(restore.left, restore.top, restore.width, restore.height));
                setDragPosition(clampWindowPosition(restore.left, restore.top, restore.width, restore.height));
            }

            setMode("normal");
            return;
        }

        captureRestoreFrame();
        setMode("maximized");
    }, [captureRestoreFrame, isMaximized, onPositionChange, setDragPosition, setHasExplicitHeight, setMode, setNormalSize]);

    return {
        mode,
        isMinimized,
        isMaximized,
        setMode,
        captureRestoreFrame,
        toggleMinimized,
        toggleMaximized,
    };
}
