import { useEffect, useRef } from "react";
import { ChevronDownIcon } from "../icons/ChevronDownIcon.js";

type PanelMoreMenuProps = {
    open: boolean;
    disabled?: boolean;
    onToggle: () => void;
    onClose: () => void;
    onExport: () => void;
    onImport: () => void;
};

export function PanelMoreMenu({ open, disabled = false, onToggle, onClose, onExport, onImport }: PanelMoreMenuProps) {
    const rootRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (!open) {
            return;
        }

        const handlePointerDown = (event: PointerEvent) => {
            const path = event.composedPath();

            if (!rootRef.current || !path.includes(rootRef.current)) {
                onClose();
            }
        };

        window.addEventListener("pointerdown", handlePointerDown);

        return () => {
            window.removeEventListener("pointerdown", handlePointerDown);
        };
    }, [onClose, open]);

    return (
        <div
            ref={rootRef}
            className="relative shrink-0"
        >
            <button
                type="button"
                disabled={disabled}
                onClick={onToggle}
                className={`flex h-full items-center justify-center gap-[4px] px-[12px] py-[4px] disabled:cursor-not-allowed disabled:opacity-50  disabled:cursor-not-allowed disabled:opacity-50 ${open ? "text-[var(--adaptive-black800)]" : "text-[var(--adaptive-black700)]"}`}
                aria-expanded={open}
                aria-haspopup="menu"
            >
                <p className="text-[var(--adaptive-black500)] font-[500]">more</p>
                <ChevronDownIcon className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`} />
            </button>

            {open ? (
                <div
                    role="menu"
                    className="absolute bottom-[calc(100%+6px)] right-0 z-[20] min-w-[120px] overflow-hidden rounded-[10px] border border-[var(--adaptive-black200)] bg-white py-[4px] shadow-[0_8px_24px_rgba(15,23,42,0.12)]"
                >
                    <button
                        type="button"
                        role="menuitem"
                        onClick={onImport}
                        className="flex w-full px-[12px] py-[8px] text-left font-semibold text-[var(--adaptive-black800)] hover:bg-[var(--adaptive-black100)]"
                    >
                        import
                    </button>
                    <button
                        type="button"
                        role="menuitem"
                        onClick={onExport}
                        className="flex w-full px-[12px] py-[8px] text-left font-semibold text-[var(--adaptive-black800)] hover:bg-[var(--adaptive-black100)]"
                    >
                        export
                    </button>
                </div>
            ) : null}
        </div>
    );
}
