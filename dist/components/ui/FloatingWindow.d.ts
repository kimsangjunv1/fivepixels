import { type CSSProperties, type ReactNode } from "react";
import { type WindowPosition } from "../../hooks/useDraggableWindow.js";
import { type BoxSize } from "../../hooks/useGhostCornerResize.js";
export type FloatingWindowMode = "normal" | "minimized" | "maximized";
export type FloatingWindowControls = {
    onClose?: () => void;
    closeAriaLabel?: string;
    minimizeAriaLabel?: string;
    maximizeAriaLabel?: string;
    restoreAriaLabel?: string;
    closeDisabled?: boolean;
    minimizeDisabled?: boolean;
    maximizeDisabled?: boolean;
};
export type FloatingWindowProps = {
    children?: ReactNode;
    title?: ReactNode;
    headerRight?: ReactNode;
    controls?: FloatingWindowControls;
    showControls?: boolean;
    mode?: FloatingWindowMode;
    defaultMode?: FloatingWindowMode;
    onModeChange?: (mode: FloatingWindowMode) => void;
    className?: string;
    contentClassName?: string;
    headerClassName?: string;
    style?: CSSProperties;
    /** Preferred width in normal mode. */
    width?: number | string;
    /** Preferred height in normal mode. Omit for content-sized height until resized. */
    height?: number | string;
    minWidth?: number;
    minHeight?: number;
    resizable?: boolean;
    resizeAriaLabel?: string;
    zIndex?: number;
    enabled?: boolean;
    position: WindowPosition;
    onPositionChange?: (position: WindowPosition) => void;
    onSizeChange?: (size: BoxSize) => void;
    ariaLabel?: string;
    dataChrome?: string;
    role?: string;
};
export declare function FloatingWindow({ children, title, headerRight, controls, showControls, mode: modeProp, defaultMode, onModeChange, className, contentClassName, headerClassName, style, width, height, minWidth, minHeight, resizable, resizeAriaLabel, zIndex, enabled, position, onPositionChange, onSizeChange, ariaLabel, dataChrome, role, }: FloatingWindowProps): import("react").JSX.Element;
//# sourceMappingURL=FloatingWindow.d.ts.map