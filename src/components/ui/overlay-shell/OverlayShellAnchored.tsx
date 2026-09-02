import { useCallback, useRef, type CSSProperties, type ReactNode, type Ref } from "react";
import { CornerResizeGhost } from "@/components/ui/CornerResizeGhost.js";
import { WindowResizeHandles } from "@/components/ui/WindowResizeHandles.js";
import { WindowModeControls } from "@/components/ui/window/WindowModeControls.js";
import { useTooltipLayout } from "@/hooks/useTooltipLayout.js";
import { useTooltipResize } from "@/hooks/useTooltipResize.js";
import type { WindowChromeControls } from "@/types/windowChrome.js";

const DEFAULT_Z_CLASS = "pointer-events-auto fixed z-[1000001]";

export type OverlayShellAnchoredProps = {
    anchor?: { left: number; top: number } | null;
    /** When set, bypasses tooltip anchor layout (probe panels, etc.). */
    position?: { left: number; top: number; width?: number | string; opacity?: number };
    visible?: boolean;
    expanded?: boolean;
    resizable?: boolean;
    zIndexClassName?: string;
    className?: string;
    surfaceClassName?: string;
    contentClassName?: string;
    prefix?: ReactNode;
    controls?: WindowChromeControls;
    showControls?: boolean;
    showResizeHandles?: boolean;
    resizeWidthAriaLabel?: string;
    resizeHeightAriaLabel?: string;
    minWidth?: number;
    style?: CSSProperties;
    dataChrome?: string;
    dataAttributes?: Record<string, string>;
    containerRef?: Ref<HTMLDivElement>;
    onClick?: (event: React.MouseEvent<HTMLDivElement>) => void;
    children: ReactNode;
};

export function OverlayShellAnchored({
    anchor = null,
    position,
    visible = true,
    expanded = true,
    resizable = true,
    zIndexClassName = DEFAULT_Z_CLASS,
    className = "",
    surfaceClassName = "rounded-[16px] shadow-[var(--adaptive-popup-shadow)] bg-[var(--adaptive-neutralTintOpacity1000)] backdrop-blur-[5px]",
    contentClassName = "",
    prefix,
    controls,
    showControls = false,
    showResizeHandles = true,
    resizeWidthAriaLabel = "Resize width",
    resizeHeightAriaLabel = "Resize height",
    minWidth = 320,
    style,
    dataChrome,
    dataAttributes,
    containerRef: outerContainerRef,
    onClick,
    children,
}: OverlayShellAnchoredProps) {
    const contentRef = useRef<HTMLDivElement | null>(null);
    const useAnchorLayout = !position && anchor;

    const { customSize, manualPosition, isResizing, ghostRef, createResizePointerDown } = useTooltipResize({
        enabled: resizable && Boolean(useAnchorLayout || position),
        tooltipRef: contentRef,
    });

    const { layout: tooltipLayout, setTooltipElement } = useTooltipLayout(anchor, expanded, visible && Boolean(useAnchorLayout), {
        customWidth: customSize?.width,
        customHeight: customSize?.height,
    });

    const bindContainerRef = useCallback(
        (node: HTMLDivElement | null) => {
            contentRef.current = node;
            setTooltipElement(node);
        },
        [setTooltipElement],
    );

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

    return (
        <>
            {isResizing ? <CornerResizeGhost ghostRef={ghostRef} /> : null}

            <div
                ref={outerContainerRef}
                className={`${zIndexClassName} relative flex flex-col gap-[4px] overflow-visible ${className}`}
                style={{
                    left: resolvedLeft,
                    top: resolvedTop,
                    width: resolvedWidth,
                    minWidth,
                    opacity: position?.opacity,
                    ...(useAnchorLayout ? tooltipLayout?.anchorStyle : undefined),
                    ...style,
                }}
            >
                {prefix}

                <div
                    ref={bindContainerRef}
                    data-fivepixels-interactive=""
                    {...chromeProps}
                    {...(dataAttributes ?? {})}
                    onClick={onClick}
                    className={`relative ${surfaceClassName} ${contentClassName}`}
                    style={customSize?.height ? { height: customSize.height } : undefined}
                >
                    {showControls ? (
                        <div className="absolute right-[8px] top-[8px] z-[2] flex items-center gap-[2px]">
                            <WindowModeControls
                                closeAriaLabel={controls?.closeAriaLabel ?? "Close"}
                                minimizeAriaLabel={controls?.minimizeAriaLabel ?? "Minimize"}
                                maximizeAriaLabel={controls?.maximizeAriaLabel ?? "Maximize"}
                                closeDisabled={controls?.closeDisabled}
                                minimizeDisabled
                                maximizeDisabled
                                showMinimize={false}
                                showMaximize={false}
                                isMaximized={false}
                                onClose={controls?.onClose}
                            />
                        </div>
                    ) : null}

                    {children}

                    {showResizeHandles && resizable ? (
                        <WindowResizeHandles
                            resizeWidthAriaLabel={resizeWidthAriaLabel}
                            resizeHeightAriaLabel={resizeHeightAriaLabel}
                            createResizePointerDown={createResizePointerDown}
                        />
                    ) : null}
                </div>
            </div>
        </>
    );
}
