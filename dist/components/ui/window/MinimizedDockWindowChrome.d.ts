import type { MouseEvent as ReactMouseEvent, PointerEvent as ReactPointerEvent, ReactNode } from "react";
export declare const MINIMIZED_DOCK_SURFACE_CLASS = "bg-[var(--adaptive-fillOpacity700)] backdrop-blur-[20px] shadow-[var(--adaptive-popup-shadow)]";
export type MinimizedDockWindowChromeProps = {
    badgeLabel: string;
    badgeValue?: string;
    restoreAriaLabel: string;
    restoreTitle?: string;
    onRestore: () => void;
    restoreDisabled?: boolean;
    closeAriaLabel: string;
    closeTitle?: string;
    onClose: () => void;
    closeDisabled?: boolean;
    dockCount: number;
    isDockDragging: boolean;
    onPointerDown: (event: ReactPointerEvent<HTMLElement>) => void;
    onClickCapture: (event: ReactMouseEvent<HTMLElement>) => void;
    surfaceClassName?: string;
    children?: ReactNode;
};
export declare function MinimizedDockWindowChrome({ badgeLabel, badgeValue, restoreAriaLabel, restoreTitle, onRestore, restoreDisabled, closeAriaLabel, closeTitle, onClose, closeDisabled, dockCount, isDockDragging, onPointerDown, onClickCapture, surfaceClassName, children, }: MinimizedDockWindowChromeProps): import("react").JSX.Element;
export declare function MinimizedDockSimpleSubtitleRow({ label, onRestore, restoreDisabled, restoreAriaLabel, }: {
    label: string;
    onRestore: () => void;
    restoreDisabled?: boolean;
    restoreAriaLabel: string;
}): import("react").JSX.Element;
//# sourceMappingURL=MinimizedDockWindowChrome.d.ts.map