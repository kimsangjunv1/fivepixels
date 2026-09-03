export type WindowMode = "normal" | "minimized" | "maximized";
/** How minimize behaves when the window supports it. */
export type WindowMinimizePolicy = "none" | "inplace" | "dock";
export type WindowChromeControls = {
    onClose?: () => void;
    closeAriaLabel?: string;
    minimizeAriaLabel?: string;
    maximizeAriaLabel?: string;
    restoreAriaLabel?: string;
    moreAriaLabel?: string;
    closeDisabled?: boolean;
    minimizeDisabled?: boolean;
    maximizeDisabled?: boolean;
};
//# sourceMappingURL=windowChrome.d.ts.map