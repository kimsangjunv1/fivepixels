import { type CSSProperties, type ReactNode } from "react";
import { type BoxSize } from "../../hooks/useGhostCornerResize.js";
import type { WindowChromeControls, WindowMinimizePolicy, WindowMode } from "../../types/windowChrome.js";
export type FloatingWindowMode = WindowMode;
export type FloatingWindowControls = WindowChromeControls;
export type FloatingWindowProps = {
    children?: ReactNode;
    title?: ReactNode;
    headerRight?: ReactNode;
    controls?: FloatingWindowControls;
    showControls?: boolean;
    mode?: FloatingWindowMode;
    defaultMode?: FloatingWindowMode;
    onModeChange?: (mode: FloatingWindowMode) => void;
    minimizePolicy?: WindowMinimizePolicy;
    /** Required when `minimizePolicy` is `dock`. */
    windowId?: string;
    className?: string;
    contentClassName?: string;
    headerClassName?: string;
    style?: CSSProperties;
    width?: number | string;
    height?: number | string;
    minWidth?: number;
    minHeight?: number;
    resizable?: boolean;
    resizeAriaLabel?: string;
    zIndex?: number;
    enabled?: boolean;
    position: {
        left: number;
        top: number;
    };
    onPositionChange?: (position: {
        left: number;
        top: number;
    }) => void;
    onSizeChange?: (size: BoxSize) => void;
    ariaLabel?: string;
    dataChrome?: string;
    role?: string;
};
export declare function FloatingWindow({ children, title, headerRight, controls, showControls, mode: modeProp, defaultMode, onModeChange, minimizePolicy, windowId, className, contentClassName, headerClassName, style, width, height, minWidth, minHeight, resizable, resizeAriaLabel, zIndex, enabled, position, onPositionChange, onSizeChange, ariaLabel, dataChrome, role, }: FloatingWindowProps): import("react").JSX.Element;
//# sourceMappingURL=FloatingWindow.d.ts.map