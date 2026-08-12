import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CornerResizeGhost } from "../../components/ui/CornerResizeGhost.js";
import { CornerResizeHandle } from "../../components/ui/CornerResizeHandle.js";
import { clampWindowPosition, useDraggableWindow } from "../../hooks/useDraggableWindow.js";
import { useGhostCornerResize } from "../../hooks/useGhostCornerResize.js";
import { claimFloatingWindowZIndex, getFloatingWindowZBase } from "../../utils/overlay/floatingWindowStack.js";
const TRAFFIC_LIGHT_BASE = "h-[12px] w-[12px] shrink-0 rounded-full border border-black/10 transition-[filter,transform] duration-150 hover:brightness-95 active:scale-[0.96]";
const MAXIMIZE_MARGIN = 12;
const DEFAULT_MIN_WIDTH = 200;
const DEFAULT_MIN_HEIGHT = 120;
function TrafficLightButton({ colorClassName, ariaLabel, disabled, onClick }) {
    return (_jsx("button", { type: "button", "data-fivepixels-interactive": "", disabled: disabled || !onClick, onPointerDown: (event) => event.stopPropagation(), onClick: onClick, "aria-label": ariaLabel, className: `${TRAFFIC_LIGHT_BASE} ${colorClassName} ${disabled || !onClick ? "opacity-40" : "cursor-pointer"}` }));
}
function getViewportSize() {
    if (typeof window === "undefined") {
        return { width: 1280, height: 720 };
    }
    return { width: window.innerWidth, height: window.innerHeight };
}
function getMaximizedFrame() {
    const viewport = getViewportSize();
    return {
        left: MAXIMIZE_MARGIN,
        top: MAXIMIZE_MARGIN,
        width: Math.max(DEFAULT_MIN_WIDTH, viewport.width - MAXIMIZE_MARGIN * 2),
        height: Math.max(DEFAULT_MIN_HEIGHT, viewport.height - MAXIMIZE_MARGIN * 2),
    };
}
export function FloatingWindow({ children, title, headerRight, controls, showControls = true, mode: modeProp, defaultMode = "normal", onModeChange, className = "", contentClassName = "", headerClassName = "", style, width, height, minWidth = DEFAULT_MIN_WIDTH, minHeight = DEFAULT_MIN_HEIGHT, resizable = true, resizeAriaLabel = "Resize window", zIndex, enabled = true, position, onPositionChange, onSizeChange, ariaLabel, dataChrome, role, }) {
    const windowRef = useRef(null);
    const wasDraggingRef = useRef(false);
    const restoreFrameRef = useRef(null);
    const [stackZIndex, setStackZIndex] = useState(() => zIndex ?? claimFloatingWindowZIndex(getFloatingWindowZBase()));
    const [uncontrolledMode, setUncontrolledMode] = useState(defaultMode);
    const mode = modeProp ?? uncontrolledMode;
    const isMinimized = mode === "minimized";
    const isMaximized = mode === "maximized";
    const bringToFront = useCallback(() => {
        setStackZIndex(claimFloatingWindowZIndex(zIndex ?? getFloatingWindowZBase()));
    }, [zIndex]);
    const handleWindowPointerDown = useCallback(() => {
        bringToFront();
    }, [bringToFront]);
    const numericDefaultWidth = typeof width === "number" ? width : minWidth;
    const numericDefaultHeight = typeof height === "number" ? height : null;
    const [normalSize, setNormalSize] = useState(() => ({
        width: numericDefaultWidth,
        height: numericDefaultHeight ?? minHeight,
    }));
    const [hasExplicitHeight, setHasExplicitHeight] = useState(numericDefaultHeight !== null);
    const setMode = useCallback((next) => {
        if (modeProp === undefined) {
            setUncontrolledMode(next);
        }
        onModeChange?.(next);
    }, [modeProp, onModeChange]);
    const { position: dragPosition, isDragging, handleDragHandlePointerDown, setPosition: setDragPosition } = useDraggableWindow({
        enabled: enabled && !isMaximized,
        windowRef,
    });
    useEffect(() => {
        if (isDragging) {
            bringToFront();
        }
    }, [bringToFront, isDragging]);
    const clampSize = useCallback((nextWidth, nextHeight) => {
        const viewport = getViewportSize();
        return {
            width: Math.min(Math.max(nextWidth, minWidth), Math.max(minWidth, viewport.width - MAXIMIZE_MARGIN * 2)),
            height: Math.min(Math.max(nextHeight, minHeight), Math.max(minHeight, viewport.height - MAXIMIZE_MARGIN * 2)),
        };
    }, [minHeight, minWidth]);
    const { isResizing, ghostRef, handleResizePointerDown } = useGhostCornerResize({
        enabled: enabled && resizable && mode === "normal",
        targetRef: windowRef,
        handleCorner: "bottom-right",
        clampSize,
        onResizeComplete: (size) => {
            setNormalSize(size);
            setHasExplicitHeight(true);
            onSizeChange?.(size);
        },
    });
    const resolvedPosition = useMemo(() => {
        if (isMaximized) {
            return getMaximizedFrame();
        }
        return dragPosition ?? position;
    }, [dragPosition, isMaximized, position]);
    const resolvedSizeStyle = useMemo(() => {
        if (isMaximized) {
            const frame = getMaximizedFrame();
            return { width: frame.width, height: frame.height };
        }
        if (isMinimized) {
            return {
                width: typeof width === "number" || typeof width === "string" ? width : normalSize.width,
                height: undefined,
            };
        }
        return {
            width: typeof width === "string" && !hasExplicitHeight ? width : normalSize.width,
            height: hasExplicitHeight ? normalSize.height : typeof height === "number" || typeof height === "string" ? height : undefined,
        };
    }, [hasExplicitHeight, height, isMaximized, isMinimized, normalSize.height, normalSize.width, width]);
    useEffect(() => {
        if (wasDraggingRef.current && !isDragging && dragPosition) {
            onPositionChange?.(dragPosition);
        }
        wasDraggingRef.current = isDragging;
    }, [dragPosition, isDragging, onPositionChange]);
    useEffect(() => {
        if (typeof width === "number") {
            setNormalSize((current) => (current.width === width ? current : { ...current, width }));
        }
    }, [width]);
    useEffect(() => {
        if (typeof height === "number") {
            setHasExplicitHeight(true);
            setNormalSize((current) => (current.height === height ? current : { ...current, height }));
        }
    }, [height]);
    const captureRestoreFrame = useCallback(() => {
        const node = windowRef.current;
        const rect = node?.getBoundingClientRect();
        restoreFrameRef.current = {
            left: rect?.left ?? resolvedPosition.left,
            top: rect?.top ?? resolvedPosition.top,
            width: rect?.width ?? normalSize.width,
            height: rect?.height ?? (hasExplicitHeight ? normalSize.height : Math.max(minHeight, rect?.height ?? minHeight)),
        };
    }, [hasExplicitHeight, minHeight, normalSize.height, normalSize.width, resolvedPosition.left, resolvedPosition.top]);
    const handleClose = useCallback(() => {
        controls?.onClose?.();
    }, [controls]);
    const handleMinimize = useCallback(() => {
        if (isMinimized) {
            setMode("normal");
            return;
        }
        if (isMaximized) {
            captureRestoreFrame();
        }
        setMode("minimized");
    }, [captureRestoreFrame, isMaximized, isMinimized, setMode]);
    const handleMaximize = useCallback(() => {
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
    }, [captureRestoreFrame, isMaximized, onPositionChange, setDragPosition, setMode]);
    const handleHeaderDoubleClick = useCallback(() => {
        if (controls?.maximizeDisabled) {
            return;
        }
        handleMaximize();
    }, [controls?.maximizeDisabled, handleMaximize]);
    const minimizeAriaLabel = isMinimized
        ? (controls?.restoreAriaLabel ?? controls?.minimizeAriaLabel ?? "Restore")
        : (controls?.minimizeAriaLabel ?? "Minimize");
    const maximizeAriaLabel = isMaximized
        ? (controls?.restoreAriaLabel ?? controls?.maximizeAriaLabel ?? "Restore")
        : (controls?.maximizeAriaLabel ?? "Maximize");
    return (_jsxs(_Fragment, { children: [isResizing ? _jsx(CornerResizeGhost, { ghostRef: ghostRef }) : null, _jsxs("div", { ref: windowRef, "data-fivepixels-interactive": "", "data-fp-chrome": dataChrome, "data-dragging": isDragging ? "true" : "false", "data-mode": mode, role: role, "aria-label": ariaLabel, onPointerDown: handleWindowPointerDown, className: `pointer-events-auto fixed flex flex-col overflow-hidden rounded-[16px] border border-[var(--adaptive-border-subtle)] bg-[var(--adaptive-black50)]/95 shadow-[var(--adaptive-popup-shadow)] backdrop-blur-[10px] ${className}`, style: {
                    left: resolvedPosition.left,
                    top: resolvedPosition.top,
                    zIndex: stackZIndex,
                    width: resolvedSizeStyle.width,
                    height: resolvedSizeStyle.height,
                    ...style,
                }, children: [_jsxs("header", { onPointerDown: handleDragHandlePointerDown, onDoubleClick: handleHeaderDoubleClick, className: `flex shrink-0 cursor-grab touch-none select-none items-center gap-[10px] border-b border-[var(--adaptive-border-subtle)] px-[12px] py-[8px] active:cursor-grabbing ${isMinimized ? "border-b-0" : ""} ${headerClassName}`, children: [showControls ? (_jsxs("div", { className: "flex shrink-0 items-center gap-[6px]", children: [_jsx(TrafficLightButton, { colorClassName: "bg-[#FF5F57]", ariaLabel: controls?.closeAriaLabel ?? "Close", disabled: controls?.closeDisabled, onClick: handleClose }), _jsx(TrafficLightButton, { colorClassName: "bg-[#FEBC2E]", ariaLabel: minimizeAriaLabel, disabled: controls?.minimizeDisabled, onClick: handleMinimize }), _jsx(TrafficLightButton, { colorClassName: "bg-[#28C840]", ariaLabel: maximizeAriaLabel, disabled: controls?.maximizeDisabled, onClick: handleMaximize })] })) : null, title ? _jsx("div", { className: "min-w-0 flex-1", children: title }) : _jsx("div", { className: "min-w-0 flex-1" }), headerRight ? _jsx("div", { className: "flex shrink-0 items-center gap-[6px]", children: headerRight }) : null] }), !isMinimized && children ? _jsx("div", { className: `min-h-0 min-w-0 flex-1 overflow-auto ${contentClassName}`, children: children }) : null, resizable && mode === "normal" ? (_jsx(CornerResizeHandle, { corner: "bottom-right", ariaLabel: resizeAriaLabel, onPointerDown: handleResizePointerDown })) : null] })] }));
}
//# sourceMappingURL=FloatingWindow.js.map