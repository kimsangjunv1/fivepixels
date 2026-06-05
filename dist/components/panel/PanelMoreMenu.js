import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useRef } from "react";
import { ChevronDownIcon } from "../icons/ChevronDownIcon.js";
export function PanelMoreMenu({ open, disabled = false, onToggle, onClose, onExport, onImport }) {
    const rootRef = useRef(null);
    useEffect(() => {
        if (!open) {
            return;
        }
        const handlePointerDown = (event) => {
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
    return (_jsxs("div", { ref: rootRef, className: "relative shrink-0", children: [_jsxs("button", { type: "button", disabled: disabled, onClick: onToggle, className: `flex h-full items-center justify-center gap-[4px] px-[12px] py-[4px] disabled:cursor-not-allowed disabled:opacity-50  disabled:cursor-not-allowed disabled:opacity-50 ${open ? "text-[var(--adaptive-black800)]" : "text-[var(--adaptive-black700)]"}`, "aria-expanded": open, "aria-haspopup": "menu", children: [_jsx("p", { className: "text-[var(--adaptive-black500)] font-[500]", children: "more" }), _jsx(ChevronDownIcon, { className: `h-4 w-4 transition-transform ${open ? "rotate-180" : ""}` })] }), open ? (_jsxs("div", { role: "menu", className: "absolute bottom-[calc(100%+6px)] right-0 z-[20] min-w-[120px] overflow-hidden rounded-[10px] border border-[var(--adaptive-black200)] bg-white py-[4px] shadow-[0_8px_24px_rgba(15,23,42,0.12)]", children: [_jsx("button", { type: "button", role: "menuitem", onClick: onImport, className: "flex w-full px-[12px] py-[8px] text-left font-semibold text-[var(--adaptive-black800)] hover:bg-[var(--adaptive-black100)]", children: "import" }), _jsx("button", { type: "button", role: "menuitem", onClick: onExport, className: "flex w-full px-[12px] py-[8px] text-left font-semibold text-[var(--adaptive-black800)] hover:bg-[var(--adaptive-black100)]", children: "export" })] })) : null] }));
}
//# sourceMappingURL=PanelMoreMenu.js.map