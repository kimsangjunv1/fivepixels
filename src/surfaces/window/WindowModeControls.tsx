import type { ReactNode } from "react";
import { CloseIcon, MaximizeIcon, MinimizeIcon, RestoreIcon } from "@/shared/components/icons/Icons.js";

export const WINDOW_HEADER_BUTTON_CLASS =
    "flex h-[24px] w-[24px] shrink-0 items-center justify-center rounded-[6px] text-[var(--adaptive-black600)] transition-colors hover:bg-[var(--adaptive-tintOpacity200)] hover:text-[var(--adaptive-black900)]";

export const WINDOW_CONTROL_BUTTON_SIZE = 24;
export const WINDOW_CONTROL_BUTTON_GAP = 2;
export const WINDOW_CONTROL_BUTTON_COUNT = 3;
export const WINDOW_EXPANDED_CONTROLS_WIDTH =
    WINDOW_CONTROL_BUTTON_SIZE * WINDOW_CONTROL_BUTTON_COUNT + WINDOW_CONTROL_BUTTON_GAP * (WINDOW_CONTROL_BUTTON_COUNT - 1);
export const WINDOW_HEADER_GAP = 10;

type WindowIconButtonProps = {
    ariaLabel: string;
    disabled?: boolean;
    onClick?: () => void;
    children: ReactNode;
};

function WindowIconButton({ ariaLabel, disabled, onClick, children }: WindowIconButtonProps) {
    return (
        <button
            type="button"
            data-fivepixels-interactive=""
            disabled={disabled || !onClick}
            onPointerDown={(event) => event.stopPropagation()}
            onClick={onClick}
            aria-label={ariaLabel}
            className={`${WINDOW_HEADER_BUTTON_CLASS} ${disabled || !onClick ? "opacity-40" : "cursor-pointer"}`}
        >
            {children}
        </button>
    );
}

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

export function WindowModeControls({
    closeAriaLabel,
    minimizeAriaLabel,
    maximizeAriaLabel,
    closeDisabled,
    minimizeDisabled,
    maximizeDisabled,
    showMinimize = true,
    showMaximize = true,
    isMaximized,
    onClose,
    onMinimize,
    onMaximize,
}: WindowModeControlsProps) {
    return (
        <>
            <WindowIconButton
                ariaLabel={closeAriaLabel}
                disabled={closeDisabled}
                onClick={onClose}
            >
                <CloseIcon className="h-[15px] w-[15px]" />
            </WindowIconButton>
            {showMinimize ? (
                <WindowIconButton
                    ariaLabel={minimizeAriaLabel}
                    disabled={minimizeDisabled}
                    onClick={onMinimize}
                >
                    <MinimizeIcon className="h-[15px] w-[15px]" />
                </WindowIconButton>
            ) : null}
            {showMaximize ? (
                <WindowIconButton
                    ariaLabel={maximizeAriaLabel}
                    disabled={maximizeDisabled}
                    onClick={onMaximize}
                >
                    {isMaximized ? <RestoreIcon className="h-[15px] w-[15px]" /> : <MaximizeIcon className="h-[15px] w-[15px]" />}
                </WindowIconButton>
            ) : null}
        </>
    );
}
