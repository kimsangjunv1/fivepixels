import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useCallback, useRef } from "react";
import { CornerResizeGhost } from "../../../../surfaces/window/CornerResizeGhost.js";
import { WindowResizeHandles } from "../../../../surfaces/window/WindowResizeHandles.js";
import { WindowModeControls } from "../../../../surfaces/window/WindowModeControls.js";
import { useTooltipLayout } from "../../../../surfaces/tooltip/useTooltipLayout.js";
import { useTooltipResize } from "../../../../surfaces/tooltip/useTooltipResize.js";
const DEFAULT_Z_CLASS = "pointer-events-auto fixed z-[1000001]";
export function OverlayShellAnchored({ anchor = null, position, visible = true, expanded = true, resizable = true, zIndexClassName = DEFAULT_Z_CLASS, className = "", surfaceClassName = "rounded-[16px] shadow-[var(--adaptive-popup-shadow)] bg-[var(--adaptive-neutralTintOpacity1000)] backdrop-blur-[5px]", contentClassName = "", prefix, controls, showControls = false, showResizeHandles = true, resizeWidthAriaLabel = "Resize width", resizeHeightAriaLabel = "Resize height", minWidth = 320, style, dataChrome, dataAttributes, containerRef: outerContainerRef, onClick, children, }) {
    const contentRef = useRef(null);
    const useAnchorLayout = !position && anchor;
    const { customSize, manualPosition, isResizing, ghostRef, createResizePointerDown } = useTooltipResize({
        enabled: resizable && Boolean(useAnchorLayout || position),
        tooltipRef: contentRef,
    });
    const { layout: tooltipLayout, setTooltipElement } = useTooltipLayout(anchor, expanded, visible && Boolean(useAnchorLayout), {
        customWidth: customSize?.width,
        customHeight: customSize?.height,
    });
    const bindContainerRef = useCallback((node) => {
        contentRef.current = node;
        setTooltipElement(node);
    }, [setTooltipElement]);
    if (!visible) {
        return null;
    }
    if (useAnchorLayout && (!tooltipLayout?.position || !tooltipLayout.anchorStyle)) {
        return null;
    }
    const resolvedLeft = position?.left ?? manualPosition?.left ?? tooltipLayout?.position.left;
    const resolvedTop = position?.top ?? manualPosition?.top ?? tooltipLayout?.position.top;
    const resolvedWidth = position?.width ?? customSize?.width ?? tooltipLayout?.position.width;
    if (resolvedLeft === undefined || resolvedTop === undefined) {
        return null;
    }
    const chromeProps = dataChrome ? { "data-fp-chrome": dataChrome } : {};
    return (_jsxs(_Fragment, { children: [isResizing ? _jsx(CornerResizeGhost, { ghostRef: ghostRef }) : null, _jsxs("div", { ref: outerContainerRef, className: `${zIndexClassName} relative flex flex-col gap-[4px] overflow-visible ${className}`, style: {
                    left: resolvedLeft,
                    top: resolvedTop,
                    width: resolvedWidth,
                    minWidth,
                    opacity: position?.opacity,
                    ...(useAnchorLayout ? tooltipLayout?.anchorStyle : undefined),
                    ...style,
                }, children: [prefix, _jsxs("div", { ref: bindContainerRef, "data-fivepixels-interactive": "", ...chromeProps, ...(dataAttributes ?? {}), onClick: onClick, className: `relative ${surfaceClassName} ${contentClassName}`, style: customSize?.height ? { height: customSize.height } : undefined, children: [showControls ? (_jsx("div", { className: "absolute right-[8px] top-[8px] z-[2] flex items-center gap-[2px]", children: _jsx(WindowModeControls, { closeAriaLabel: controls?.closeAriaLabel ?? "Close", minimizeAriaLabel: controls?.minimizeAriaLabel ?? "Minimize", maximizeAriaLabel: controls?.maximizeAriaLabel ?? "Maximize", closeDisabled: controls?.closeDisabled, minimizeDisabled: true, maximizeDisabled: true, showMinimize: false, showMaximize: false, isMaximized: false, onClose: controls?.onClose }) })) : null, children, showResizeHandles && resizable ? (_jsx(WindowResizeHandles, { resizeWidthAriaLabel: resizeWidthAriaLabel, resizeHeightAriaLabel: resizeHeightAriaLabel, createResizePointerDown: createResizePointerDown })) : null] })] })] }));
}
//# sourceMappingURL=OverlayShellAnchored.js.map