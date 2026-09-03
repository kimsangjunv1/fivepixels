import type { MouseEvent as ReactMouseEvent, PointerEvent as ReactPointerEvent, ReactNode } from "react";
import { CloseIcon } from "@/components/icons/Icons.js";

export const MINIMIZED_DOCK_SURFACE_CLASS = "bg-[var(--adaptive-fillOpacity700)] backdrop-blur-[20px] shadow-[var(--adaptive-popup-shadow)]";

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

export function MinimizedDockWindowChrome({
    badgeLabel,
    badgeValue,
    restoreAriaLabel,
    restoreTitle,
    onRestore,
    restoreDisabled = false,
    closeAriaLabel,
    closeTitle,
    onClose,
    closeDisabled = false,
    dockCount,
    isDockDragging,
    onPointerDown,
    onClickCapture,
    surfaceClassName = MINIMIZED_DOCK_SURFACE_CLASS,
    children,
}: MinimizedDockWindowChromeProps) {
    return (
        <div
            className={`group/min-dock relative h-full w-full ${dockCount > 1 ? "cursor-grab" : ""} ${isDockDragging ? "cursor-grabbing" : ""}`}
            onPointerDown={onPointerDown}
            onClickCapture={onClickCapture}
        >
            <div className={`flex h-full w-full overflow-hidden rounded-[16px] ${surfaceClassName}`}>
                <div className="flex w-full flex-col justify-center gap-[2px] overflow-hidden px-[12px] py-[6px]">
                    <button
                        type="button"
                        data-fivepixels-interactive=""
                        onClick={onRestore}
                        disabled={restoreDisabled}
                        aria-label={restoreAriaLabel}
                        title={restoreTitle ?? restoreAriaLabel}
                        className="flex min-w-0 items-center gap-[4px] text-left"
                    >
                        <p className="shrink-0 rounded-[4px] bg-[var(--adaptive-tintOpacity300)] px-[2px] py-[2px] text-[10px]">{badgeLabel}</p>
                        {badgeValue ? <p className="min-w-0 truncate text-[10px] font-semibold leading-none text-[var(--adaptive-accent-coral)]">{badgeValue}</p> : null}
                    </button>

                    {children}
                </div>
            </div>

            <button
                type="button"
                data-fivepixels-interactive=""
                aria-label={closeAriaLabel}
                title={closeTitle ?? closeAriaLabel}
                disabled={closeDisabled}
                onPointerDown={(event) => event.stopPropagation()}
                onClick={(event) => {
                    event.stopPropagation();
                    onClose();
                }}
                className={`absolute right-[6px] top-[6px] z-[2] inline-flex h-[22px] w-[22px] items-center justify-center rounded-full bg-[var(--adaptive-black100)] text-[var(--adaptive-black700)] shadow-[var(--adaptive-popup-shadow)] transition-[opacity,transform] duration-150 ease-[cubic-bezier(0.22,1,0.36,1)] hover:bg-[var(--adaptive-black200)] hover:text-[var(--adaptive-black900)] ${
                    closeDisabled
                        ? "pointer-events-none scale-90 opacity-0"
                        : "pointer-events-none scale-90 opacity-0 group-hover/min-dock:pointer-events-auto group-hover/min-dock:scale-100 group-hover/min-dock:opacity-100"
                }`}
            >
                <CloseIcon className="h-[12px] w-[12px]" />
            </button>
        </div>
    );
}

export function MinimizedDockSimpleSubtitleRow({
    label,
    onRestore,
    restoreDisabled = false,
    restoreAriaLabel,
}: {
    label: string;
    onRestore: () => void;
    restoreDisabled?: boolean;
    restoreAriaLabel: string;
}) {
    return (
        <button
            type="button"
            data-fivepixels-interactive=""
            onClick={onRestore}
            disabled={restoreDisabled}
            aria-label={restoreAriaLabel}
            className="flex min-w-0 flex-1 items-center overflow-hidden text-left"
        >
            <p
                className="min-w-0 flex-1 truncate text-[12px] font-semibold leading-[1.3] text-[var(--adaptive-black900)]"
                title={label}
            >
                {label}
            </p>
        </button>
    );
}
