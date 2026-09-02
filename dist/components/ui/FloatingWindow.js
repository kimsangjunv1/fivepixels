import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { MoreHorizontalIcon } from "../../components/icons/Icons.js";
import { CornerResizeGhost } from "../../components/ui/CornerResizeGhost.js";
import { WindowResizeHandles } from "../../components/ui/WindowResizeHandles.js";
import { WINDOW_EXPANDED_CONTROLS_WIDTH, WINDOW_HEADER_BUTTON_CLASS, WINDOW_HEADER_GAP, WindowModeControls, } from "../../components/ui/window/WindowModeControls.js";
import { clampWindowPosition, useDraggableWindow } from "../../hooks/useDraggableWindow.js";
import { useGhostCornerResize } from "../../hooks/useGhostCornerResize.js";
import { useOverlayMinimizedDock } from "../../hooks/useOverlayMinimizedDock.js";
import { useMinimizedDockDragReorder } from "../../hooks/useMinimizedDockDragReorder.js";
import { getMaximizedWindowFrame, getWindowViewportSize, useWindowMode } from "../../hooks/useWindowMode.js";
import { claimFloatingWindowZIndex, getFloatingWindowZBase } from "../../utils/overlay/floatingWindowStack.js";
import { MINIMIZED_WINDOW_HEIGHT } from "../../utils/overlay/minimizedDockLayout.js";
const DEFAULT_MIN_WIDTH = 200;
const DEFAULT_MIN_HEIGHT = 120;
const MAXIMIZE_MARGIN = 12;
export function FloatingWindow({ children, title, headerRight, controls, showControls = true, mode: modeProp, defaultMode = "normal", onModeChange, minimizePolicy = "inplace", windowId, className = "", contentClassName = "", headerClassName = "", style, width, height, minWidth = DEFAULT_MIN_WIDTH, minHeight = DEFAULT_MIN_HEIGHT, resizable = true, resizeAriaLabel = "Resize window", zIndex, enabled = true, position, onPositionChange, onSizeChange, ariaLabel, dataChrome, role, }) {
    const windowRef = useRef(null);
    const headerRef = useRef(null);
    const titleMeasureRef = useRef(null);
    const headerRightRef = useRef(null);
    const controlsClusterRef = useRef(null);
    const wasDraggingRef = useRef(false);
    const [stackZIndex, setStackZIndex] = useState(() => zIndex ?? claimFloatingWindowZIndex(getFloatingWindowZBase()));
    const [controlsCollapsed, setControlsCollapsed] = useState(() => typeof width === "number" && width < 260);
    const [controlsExpanded, setControlsExpanded] = useState(false);
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
    const { position: dragPosition, isDragging, handleDragHandlePointerDown, setPosition: setDragPosition, } = useDraggableWindow({
        enabled,
        windowRef,
    });
    const resolvedPositionBeforeMode = useMemo(() => dragPosition ?? position, [dragPosition, position]);
    const { mode, isMinimized, isMaximized, setMode, captureRestoreFrame, toggleMinimized, toggleMaximized, } = useWindowMode({
        mode: modeProp,
        defaultMode,
        onModeChange,
        minWidth,
        minHeight,
        windowRef,
        normalSize,
        hasExplicitHeight,
        resolvedPosition: resolvedPositionBeforeMode,
        onPositionChange,
        setNormalSize,
        setHasExplicitHeight,
        setDragPosition,
    });
    const dockEnabled = minimizePolicy === "dock" && Boolean(windowId);
    const overlayDock = useOverlayMinimizedDock({
        windowId: windowId ?? "overlay-window",
        enabled: dockEnabled,
        isMinimized,
        onMinimizedChange: (minimized) => setMode(minimized ? "minimized" : "normal"),
    });
    const showDockMinimizedChrome = dockEnabled && isMinimized && overlayDock.dockMorph?.phase !== "restoring";
    const dockDrag = useMinimizedDockDragReorder({
        windowId: windowId ?? "overlay-window",
        windowRef,
        enabled: showDockMinimizedChrome && overlayDock.dockCount >= 2,
        blockDrag: overlayDock.dockMorph !== null,
        minimizedWidth: overlayDock.minimizedWidth,
        dockPosition: overlayDock.dockPosition,
    });
    const isDockDragging = dockDrag.isDockDragging;
    const dragEnabled = enabled && mode === "normal" && !showDockMinimizedChrome && !overlayDock.dockMorph;
    useEffect(() => {
        if (isDragging) {
            bringToFront();
            setControlsExpanded(false);
        }
    }, [bringToFront, isDragging]);
    const clampSize = useCallback((nextWidth, nextHeight) => {
        const viewport = getWindowViewportSize();
        return {
            width: Math.min(Math.max(nextWidth, minWidth), Math.max(minWidth, viewport.width - MAXIMIZE_MARGIN * 2)),
            height: Math.min(Math.max(nextHeight, minHeight), Math.max(minHeight, viewport.height - MAXIMIZE_MARGIN * 2)),
        };
    }, [minHeight, minWidth]);
    const handleResizeComplete = useCallback((rect) => {
        const nextSize = { width: rect.width, height: rect.height };
        setNormalSize(nextSize);
        setHasExplicitHeight(true);
        setDragPosition(clampWindowPosition(rect.left, rect.top, rect.width, rect.height));
        onSizeChange?.(nextSize);
    }, [onSizeChange, setDragPosition]);
    const { isResizing, ghostRef, createResizePointerDown } = useGhostCornerResize({
        enabled: enabled && resizable && mode === "normal" && !overlayDock.dockMorph,
        targetRef: windowRef,
        clampSize,
        onResizeComplete: handleResizeComplete,
    });
    const resolvedPosition = useMemo(() => {
        if (overlayDock.dockMorph) {
            return { left: overlayDock.dockMorph.left, top: overlayDock.dockMorph.top };
        }
        if (showDockMinimizedChrome) {
            return {
                left: dockDrag.displayLeft,
                top: dockDrag.displayTop,
            };
        }
        if (isMaximized) {
            return getMaximizedWindowFrame(minWidth, minHeight);
        }
        return resolvedPositionBeforeMode;
    }, [
        dockDrag.displayLeft,
        dockDrag.displayTop,
        isMaximized,
        minHeight,
        minWidth,
        overlayDock.dockMorph,
        resolvedPositionBeforeMode,
        showDockMinimizedChrome,
    ]);
    const resolvedSizeStyle = useMemo(() => {
        if (isMaximized) {
            const frame = getMaximizedWindowFrame(minWidth, minHeight);
            return { width: frame.width, height: frame.height };
        }
        if (overlayDock.dockMorph) {
            return { width: overlayDock.dockMorph.width, height: overlayDock.dockMorph.height };
        }
        if (showDockMinimizedChrome) {
            return { width: overlayDock.minimizedWidth, height: MINIMIZED_WINDOW_HEIGHT };
        }
        if (isMinimized && minimizePolicy === "inplace") {
            return {
                width: typeof width === "number" || typeof width === "string" ? width : normalSize.width,
                height: undefined,
            };
        }
        return {
            width: typeof width === "string" && !hasExplicitHeight ? width : normalSize.width,
            height: hasExplicitHeight ? normalSize.height : typeof height === "number" || typeof height === "string" ? height : undefined,
        };
    }, [
        hasExplicitHeight,
        height,
        isMaximized,
        isMinimized,
        minimizePolicy,
        normalSize.height,
        normalSize.width,
        overlayDock.dockMorph,
        overlayDock.minimizedWidth,
        showDockMinimizedChrome,
        width,
    ]);
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
    const handleClose = useCallback(() => {
        controls?.onClose?.();
    }, [controls]);
    const getCurrentFrame = useCallback(() => {
        const node = windowRef.current;
        const rect = node?.getBoundingClientRect();
        return {
            left: rect?.left ?? resolvedPositionBeforeMode.left,
            top: rect?.top ?? resolvedPositionBeforeMode.top,
            width: rect?.width ?? normalSize.width,
            height: rect?.height ?? (hasExplicitHeight ? normalSize.height : minHeight),
        };
    }, [hasExplicitHeight, minHeight, normalSize.height, normalSize.width, resolvedPositionBeforeMode.left, resolvedPositionBeforeMode.top]);
    const handleMinimize = useCallback(() => {
        if (minimizePolicy === "none") {
            return;
        }
        if (isMinimized) {
            if (dockEnabled) {
                overlayDock.restoreFromDock({
                    left: resolvedPositionBeforeMode.left,
                    top: resolvedPositionBeforeMode.top,
                    width: normalSize.width,
                    height: hasExplicitHeight ? normalSize.height : minHeight,
                });
                return;
            }
            toggleMinimized();
            return;
        }
        if (isMaximized) {
            captureRestoreFrame();
        }
        if (dockEnabled) {
            overlayDock.minimizeToDock(getCurrentFrame());
            return;
        }
        toggleMinimized();
    }, [
        captureRestoreFrame,
        dockEnabled,
        getCurrentFrame,
        hasExplicitHeight,
        isMaximized,
        isMinimized,
        minHeight,
        minimizePolicy,
        normalSize.height,
        normalSize.width,
        overlayDock,
        resolvedPositionBeforeMode.left,
        resolvedPositionBeforeMode.top,
        toggleMinimized,
    ]);
    const handleMaximize = useCallback(() => {
        if (showDockMinimizedChrome) {
            handleMinimize();
            return;
        }
        toggleMaximized();
    }, [handleMinimize, showDockMinimizedChrome, toggleMaximized]);
    const handleHeaderDoubleClick = useCallback(() => {
        if (controls?.maximizeDisabled || showDockMinimizedChrome) {
            return;
        }
        toggleMaximized();
    }, [controls?.maximizeDisabled, showDockMinimizedChrome, toggleMaximized]);
    const handleDragPointerDown = useCallback((event) => {
        if (!dragEnabled) {
            return;
        }
        handleDragHandlePointerDown(event);
    }, [dragEnabled, handleDragHandlePointerDown]);
    const closeAriaLabel = controls?.closeAriaLabel ?? "Close";
    const minimizeAriaLabel = isMinimized ? (controls?.restoreAriaLabel ?? controls?.minimizeAriaLabel ?? "Restore") : (controls?.minimizeAriaLabel ?? "Minimize");
    const maximizeAriaLabel = isMaximized ? (controls?.restoreAriaLabel ?? controls?.maximizeAriaLabel ?? "Restore") : (controls?.maximizeAriaLabel ?? "Maximize");
    const moreAriaLabel = controls?.moreAriaLabel ?? "More window controls";
    const modeControlButtons = (_jsx(WindowModeControls, { closeAriaLabel: closeAriaLabel, minimizeAriaLabel: minimizeAriaLabel, maximizeAriaLabel: maximizeAriaLabel, closeDisabled: controls?.closeDisabled, minimizeDisabled: controls?.minimizeDisabled || minimizePolicy === "none", maximizeDisabled: controls?.maximizeDisabled || showDockMinimizedChrome, showMinimize: minimizePolicy !== "none", isMaximized: isMaximized, onClose: handleClose, onMinimize: handleMinimize, onMaximize: handleMaximize }));
    useLayoutEffect(() => {
        const header = headerRef.current;
        if (!header || !showControls) {
            setControlsCollapsed(false);
            setControlsExpanded(false);
            return;
        }
        const updateControlsLayout = () => {
            const paddingX = Number.parseFloat(getComputedStyle(header).paddingLeft) + Number.parseFloat(getComputedStyle(header).paddingRight);
            const titleWidth = titleMeasureRef.current?.scrollWidth ?? 0;
            const headerRightWidth = headerRightRef.current?.offsetWidth ?? 0;
            const parts = [WINDOW_EXPANDED_CONTROLS_WIDTH, titleWidth, headerRightWidth].filter((value) => value > 0);
            const neededWidth = paddingX + parts.reduce((total, value) => total + value, 0) + WINDOW_HEADER_GAP * Math.max(0, parts.length - 1);
            const nextCollapsed = neededWidth > header.clientWidth + 0.5;
            setControlsCollapsed(nextCollapsed);
            if (!nextCollapsed) {
                setControlsExpanded(false);
            }
        };
        updateControlsLayout();
        const resizeObserver = typeof ResizeObserver !== "undefined" ? new ResizeObserver(updateControlsLayout) : null;
        resizeObserver?.observe(header);
        if (titleMeasureRef.current) {
            resizeObserver?.observe(titleMeasureRef.current);
        }
        if (headerRightRef.current) {
            resizeObserver?.observe(headerRightRef.current);
        }
        window.addEventListener("resize", updateControlsLayout);
        return () => {
            resizeObserver?.disconnect();
            window.removeEventListener("resize", updateControlsLayout);
        };
    }, [headerRight, showControls, title]);
    useEffect(() => {
        if (!controlsCollapsed || !controlsExpanded) {
            return;
        }
        const handlePointerDown = (event) => {
            const path = event.composedPath();
            if (controlsClusterRef.current && path.includes(controlsClusterRef.current)) {
                return;
            }
            setControlsExpanded(false);
        };
        const handleKeyDown = (event) => {
            if (event.key === "Escape") {
                setControlsExpanded(false);
            }
        };
        window.addEventListener("pointerdown", handlePointerDown);
        window.addEventListener("keydown", handleKeyDown);
        return () => {
            window.removeEventListener("pointerdown", handlePointerDown);
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [controlsCollapsed, controlsExpanded]);
    const dockLayoutTransition = isDockDragging ? undefined : overlayDock.layoutTransition;
    const handleHeaderPointerDown = useCallback((event) => {
        if (showDockMinimizedChrome) {
            dockDrag.handleMinimizedDockPointerDown(event);
            return;
        }
        handleDragPointerDown(event);
    }, [dockDrag, handleDragPointerDown, showDockMinimizedChrome]);
    return (_jsxs(_Fragment, { children: [isResizing ? _jsx(CornerResizeGhost, { ghostRef: ghostRef }) : null, _jsxs("div", { ref: windowRef, "data-fivepixels-interactive": "", "data-fp-chrome": dataChrome, "data-dragging": isDragging ? "true" : "false", "data-mode": mode, role: role, "aria-label": ariaLabel, onPointerDown: handleWindowPointerDown, className: `pointer-events-auto fixed flex flex-col rounded-[16px] bg-[var(--adaptive-black50)]/95 shadow-[var(--adaptive-popup-shadow)] backdrop-blur-[10px] ${resizable && mode === "normal" && !showDockMinimizedChrome ? "overflow-visible" : "overflow-hidden"} ${className}`, style: {
                    left: resolvedPosition.left,
                    top: resolvedPosition.top,
                    zIndex: isDockDragging ? stackZIndex + 100 : stackZIndex,
                    width: resolvedSizeStyle.width,
                    height: resolvedSizeStyle.height,
                    transition: dockLayoutTransition,
                    ...(isDockDragging ? { cursor: "grabbing", transform: "scale(1.03)", willChange: "left, top, transform" } : null),
                    ...style,
                }, children: [_jsxs("header", { ref: headerRef, onPointerDown: handleHeaderPointerDown, onClickCapture: showDockMinimizedChrome ? dockDrag.handleMinimizedDockClickCapture : undefined, onDoubleClick: handleHeaderDoubleClick, className: `relative flex shrink-0 touch-none select-none items-center gap-[10px] px-[12px] py-[8px] ${dragEnabled || (showDockMinimizedChrome && overlayDock.dockCount > 1)
                            ? `cursor-grab ${isDockDragging ? "cursor-grabbing" : ""}`
                            : ""} ${showDockMinimizedChrome || (isMinimized && minimizePolicy === "inplace") ? "border-b-0" : "border-b border-[var(--adaptive-border-subtle)]"} ${headerClassName}`, children: [title ? (_jsx("div", { ref: titleMeasureRef, "aria-hidden": true, className: "pointer-events-none invisible absolute whitespace-nowrap", children: title })) : null, showControls ? (controlsCollapsed ? (_jsxs("div", { ref: controlsClusterRef, className: "flex shrink-0 items-center gap-[2px]", children: [_jsx("button", { type: "button", "data-fivepixels-interactive": "", "aria-label": moreAriaLabel, "aria-expanded": controlsExpanded, onPointerDown: (event) => event.stopPropagation(), onClick: () => setControlsExpanded((current) => !current), className: `${WINDOW_HEADER_BUTTON_CLASS} cursor-pointer`, children: _jsx(MoreHorizontalIcon, { className: "h-[15px] w-[15px]" }) }), _jsx("div", { "aria-hidden": !controlsExpanded, className: `flex items-center gap-[2px] overflow-hidden transition-[max-width,opacity] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] ${controlsExpanded ? "max-w-[80px] opacity-100" : "pointer-events-none max-w-0 opacity-0"}`, children: modeControlButtons })] })) : (_jsx("div", { className: "flex shrink-0 items-center gap-[2px]", children: modeControlButtons }))) : null, title ? (_jsx("div", { className: "min-w-0 flex-1 overflow-hidden", children: _jsx("div", { className: "truncate", children: title }) })) : (_jsx("div", { className: "min-w-0 flex-1" })), headerRight ? (_jsx("div", { ref: headerRightRef, className: "flex shrink-0 items-center gap-[6px]", children: headerRight })) : null] }), !isMinimized && children ? _jsx("div", { className: `min-h-0 min-w-0 flex-1 overflow-auto rounded-[16px] ${contentClassName}`, children: children }) : null, resizable && mode === "normal" && !showDockMinimizedChrome ? (_jsx(WindowResizeHandles, { resizeWidthAriaLabel: resizeAriaLabel, resizeHeightAriaLabel: resizeAriaLabel, createResizePointerDown: createResizePointerDown })) : null] })] }));
}
//# sourceMappingURL=FloatingWindow.js.map