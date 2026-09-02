export declare const WINDOW_HEADER_BUTTON_CLASS = "flex h-[24px] w-[24px] shrink-0 items-center justify-center rounded-[6px] text-[var(--adaptive-black600)] transition-colors hover:bg-[var(--adaptive-tintOpacity200)] hover:text-[var(--adaptive-black900)]";
export declare const WINDOW_CONTROL_BUTTON_SIZE = 24;
export declare const WINDOW_CONTROL_BUTTON_GAP = 2;
export declare const WINDOW_CONTROL_BUTTON_COUNT = 3;
export declare const WINDOW_EXPANDED_CONTROLS_WIDTH: number;
export declare const WINDOW_HEADER_GAP = 10;
export type WindowModeControlsProps = {
    closeAriaLabel: string;
    minimizeAriaLabel: string;
    maximizeAriaLabel: string;
    closeDisabled?: boolean;
    minimizeDisabled?: boolean;
    maximizeDisabled?: boolean;
    showMinimize?: boolean;
    showMaximize?: boolean;
    isMaximized: boolean;
    onClose?: () => void;
    onMinimize?: () => void;
    onMaximize?: () => void;
};
export declare function WindowModeControls({ closeAriaLabel, minimizeAriaLabel, maximizeAriaLabel, closeDisabled, minimizeDisabled, maximizeDisabled, showMinimize, showMaximize, isMaximized, onClose, onMinimize, onMaximize, }: WindowModeControlsProps): import("react").JSX.Element;
//# sourceMappingURL=WindowModeControls.d.ts.map