import { type CSSProperties, type ReactNode, type Ref } from "react";
import type { WindowChromeControls } from "../../../../shared/types/windowChrome.js";
export type OverlayShellAnchoredProps = {
    anchor?: {
        left: number;
        top: number;
    } | null;
    /** When set, bypasses tooltip anchor layout (probe panels, etc.). */
    position?: {
        left: number;
        top: number;
        width?: number | string;
        opacity?: number;
    };
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
export declare function OverlayShellAnchored({ anchor, position, visible, expanded, resizable, zIndexClassName, className, surfaceClassName, contentClassName, prefix, controls, showControls, showResizeHandles, resizeWidthAriaLabel, resizeHeightAriaLabel, minWidth, style, dataChrome, dataAttributes, containerRef: outerContainerRef, onClick, children, }: OverlayShellAnchoredProps): import("react").JSX.Element | null;
//# sourceMappingURL=OverlayShellAnchored.d.ts.map