import { useEffect, type CSSProperties, type PointerEvent as ReactPointerEvent, type ReactNode } from "react";

export type OverlayShellModalProps = {
    open: boolean;
    onClose: () => void;
    ariaLabel: string;
    dataChrome?: string;
    role?: "dialog" | "alertdialog";
    zIndex?: number;
    backdropClassName?: string;
    backdropStyle?: CSSProperties;
    panelClassName?: string;
    closeOnBackdrop?: boolean;
    closeOnEscape?: boolean;
    children: ReactNode;
};

export function OverlayShellModal({
    open,
    onClose,
    ariaLabel,
    dataChrome,
    role = "dialog",
    zIndex,
    backdropClassName = "pointer-events-auto fixed inset-0",
    backdropStyle,
    panelClassName = "",
    closeOnBackdrop = true,
    closeOnEscape = true,
    children,
}: OverlayShellModalProps) {
    useEffect(() => {
        if (!open || !closeOnEscape) {
            return;
        }

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                event.preventDefault();
                event.stopPropagation();
                onClose();
            }
        };

        window.addEventListener("keydown", handleKeyDown, true);

        return () => {
            window.removeEventListener("keydown", handleKeyDown, true);
        };
    }, [closeOnEscape, onClose, open]);

    if (!open) {
        return null;
    }

    const handleBackdropPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
        if (!closeOnBackdrop) {
            return;
        }

        if (event.target === event.currentTarget) {
            onClose();
        }
    };

    return (
        <div
            data-fp-chrome={dataChrome}
            role={role}
            aria-modal="true"
            aria-label={ariaLabel}
            data-fivepixels-interactive=""
            className={backdropClassName}
            style={{ zIndex, ...backdropStyle }}
            onPointerDown={handleBackdropPointerDown}
        >
            <div
                className={panelClassName}
                onPointerDown={(event) => event.stopPropagation()}
            >
                {children}
            </div>
        </div>
    );
}
