import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { CloseIcon, MaximizeIcon, MinimizeIcon, MoreHorizontalIcon, RestoreIcon } from "../../components/icons/Icons.js";
import { CornerResizeGhost } from "../../components/ui/CornerResizeGhost.js";
import { CornerResizeHandle } from "../../components/ui/CornerResizeHandle.js";
import { clampWindowPosition, useDraggableWindow } from "../../hooks/useDraggableWindow.js";
import { useGhostCornerResize } from "../../hooks/useGhostCornerResize.js";
import { claimFloatingWindowZIndex, getFloatingWindowZBase } from "../../utils/overlay/floatingWindowStack.js";
const HEADER_BUTTON_CLASS = "flex h-[24px] w-[24px] shrink-0 items-center justify-center rounded-[6px] text-[var(--adaptive-black600)] transition-colors hover:bg-[var(--adaptive-tintOpacity200)] hover:text-[var(--adaptive-black900)]";
const CONTROL_BUTTON_SIZE = 24;
const CONTROL_BUTTON_GAP = 2;
const CONTROL_BUTTON_COUNT = 3;
const EXPANDED_CONTROLS_WIDTH = CONTROL_BUTTON_SIZE * CONTROL_BUTTON_COUNT + CONTROL_BUTTON_GAP * (CONTROL_BUTTON_COUNT - 1);
const HEADER_GAP = 10;
const MAXIMIZE_MARGIN = 12;
const DEFAULT_MIN_WIDTH = 200;
const DEFAULT_MIN_HEIGHT = 120;
function WindowIconButton({ ariaLabel, disabled, onClick, children }) {
    return (_jsx("button", { type: "button", "data-fivepixels-interactive": "", disabled: disabled || !onClick, onPointerDown: (event) => event.stopPropagation(), onClick: onClick, "aria-label": ariaLabel, className: `${HEADER_BUTTON_CLASS} ${disabled || !onClick ? "opacity-40" : "cursor-pointer"}`, children: children }));
}
function WindowModeControlButtons({ closeAriaLabel, minimizeAriaLabel, maximizeAriaLabel, closeDisabled, minimizeDisabled, maximizeDisabled, isMaximized, onClose, onMinimize, onMaximize, }) {
    return (_jsxs(_Fragment, { children: [_jsx(WindowIconButton, { ariaLabel: closeAriaLabel, disabled: closeDisabled, onClick: onClose, children: _jsx(CloseIcon, { className: "h-[15px] w-[15px]" }) }), _jsx(WindowIconButton, { ariaLabel: minimizeAriaLabel, disabled: minimizeDisabled, onClick: onMinimize, children: _jsx(MinimizeIcon, { className: "h-[15px] w-[15px]" }) }), _jsx(WindowIconButton, { ariaLabel: maximizeAriaLabel, disabled: maximizeDisabled, onClick: onMaximize, children: isMaximized ? _jsx(RestoreIcon, { className: "h-[15px] w-[15px]" }) : _jsx(MaximizeIcon, { className: "h-[15px] w-[15px]" }) })] }));
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
    const headerRef = useRef(null);
    const titleMeasureRef = useRef(null);
    const headerRightRef = useRef(null);
    const controlsClusterRef = useRef(null);
    const wasDraggingRef = useRef(false);
    const restoreFrameRef = useRef(null);
    const [stackZIndex, setStackZIndex] = useState(() => zIndex ?? claimFloatingWindowZIndex(getFloatingWindowZBase()));
    const [uncontrolledMode, setUncontrolledMode] = useState(defaultMode);
    const [controlsCollapsed, setControlsCollapsed] = useState(() => typeof width === "number" && width < 260);
    const [controlsExpanded, setControlsExpanded] = useState(false);
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
            setControlsExpanded(false);
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
    const closeAriaLabel = controls?.closeAriaLabel ?? "Close";
    const minimizeAriaLabel = isMinimized
        ? (controls?.restoreAriaLabel ?? controls?.minimizeAriaLabel ?? "Restore")
        : (controls?.minimizeAriaLabel ?? "Minimize");
    const maximizeAriaLabel = isMaximized
        ? (controls?.restoreAriaLabel ?? controls?.maximizeAriaLabel ?? "Restore")
        : (controls?.maximizeAriaLabel ?? "Maximize");
    const moreAriaLabel = controls?.moreAriaLabel ?? "More window controls";
    const modeControlButtons = (_jsx(WindowModeControlButtons, { closeAriaLabel: closeAriaLabel, minimizeAriaLabel: minimizeAriaLabel, maximizeAriaLabel: maximizeAriaLabel, closeDisabled: controls?.closeDisabled, minimizeDisabled: controls?.minimizeDisabled, maximizeDisabled: controls?.maximizeDisabled, isMaximized: isMaximized, onClose: handleClose, onMinimize: handleMinimize, onMaximize: handleMaximize }));
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
            const parts = [EXPANDED_CONTROLS_WIDTH, titleWidth, headerRightWidth].filter((width) => width > 0);
            const neededWidth = paddingX + parts.reduce((total, width) => total + width, 0) + HEADER_GAP * Math.max(0, parts.length - 1);
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
    return (_jsxs(_Fragment, { children: [isResizing ? _jsx(CornerResizeGhost, { ghostRef: ghostRef }) : null, _jsxs("div", { ref: windowRef, "data-fivepixels-interactive": "", "data-fp-chrome": dataChrome, "data-dragging": isDragging ? "true" : "false", "data-mode": mode, role: role, "aria-label": ariaLabel, onPointerDown: handleWindowPointerDown, className: `pointer-events-auto fixed flex flex-col overflow-hidden rounded-[16px] border border-[var(--adaptive-border-subtle)] bg-[var(--adaptive-black50)]/95 shadow-[var(--adaptive-popup-shadow)] backdrop-blur-[10px] ${className}`, style: {
                    left: resolvedPosition.left,
                    top: resolvedPosition.top,
                    zIndex: stackZIndex,
                    width: resolvedSizeStyle.width,
                    height: resolvedSizeStyle.height,
                    ...style,
                }, children: [_jsxs("header", { ref: headerRef, onPointerDown: handleDragHandlePointerDown, onDoubleClick: handleHeaderDoubleClick, className: `relative flex shrink-0 cursor-grab touch-none select-none items-center gap-[10px] border-b border-[var(--adaptive-border-subtle)] px-[12px] py-[8px] active:cursor-grabbing ${isMinimized ? "border-b-0" : ""} ${headerClassName}`, children: [title ? (_jsx("div", { ref: titleMeasureRef, "aria-hidden": true, className: "pointer-events-none invisible absolute whitespace-nowrap", children: title })) : null, showControls ? (controlsCollapsed ? (_jsxs("div", { ref: controlsClusterRef, className: "flex shrink-0 items-center gap-[2px]", children: [_jsx("button", { type: "button", "data-fivepixels-interactive": "", "aria-label": moreAriaLabel, "aria-expanded": controlsExpanded, onPointerDown: (event) => event.stopPropagation(), onClick: () => setControlsExpanded((current) => !current), className: `${HEADER_BUTTON_CLASS} cursor-pointer`, children: _jsx(MoreHorizontalIcon, { className: "h-[15px] w-[15px]" }) }), _jsx("div", { "aria-hidden": !controlsExpanded, className: `flex items-center gap-[2px] overflow-hidden transition-[max-width,opacity] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] ${controlsExpanded ? "max-w-[80px] opacity-100" : "pointer-events-none max-w-0 opacity-0"}`, children: modeControlButtons })] })) : (_jsx("div", { className: "flex shrink-0 items-center gap-[2px]", children: modeControlButtons }))) : null, title ? (_jsx("div", { className: "min-w-0 flex-1 overflow-hidden", children: _jsx("div", { className: "truncate", children: title }) })) : (_jsx("div", { className: "min-w-0 flex-1" })), headerRight ? (_jsx("div", { ref: headerRightRef, className: "flex shrink-0 items-center gap-[6px]", children: headerRight })) : null] }), !isMinimized && children ? _jsx("div", { className: `min-h-0 min-w-0 flex-1 overflow-auto ${contentClassName}`, children: children }) : null, resizable && mode === "normal" ? (_jsx(CornerResizeHandle, { corner: "bottom-right", ariaLabel: resizeAriaLabel, onPointerDown: handleResizePointerDown })) : null] })] }));
}
//# sourceMappingURL=FloatingWindow.js.map