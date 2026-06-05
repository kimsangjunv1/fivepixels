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
    return (_jsxs("div", { ref: rootRef, className: "relative shrink-0", children: [_jsxs("button", { type: "button", disabled: disabled, onClick: onToggle, className: open
                    ? "flex h-full min-w-[72px] items-center justify-center gap-[4px] rounded-[10px] bg-[var(--adaptive-grey300)] px-[12px] py-[8px] text-[13px] font-bold text-[var(--adaptive-grey800)] disabled:cursor-not-allowed disabled:opacity-50"
                    : "flex h-full min-w-[72px] items-center justify-center gap-[4px] rounded-[10px] bg-[var(--adaptive-grey200)] px-[12px] py-[8px] text-[13px] font-bold text-[var(--adaptive-grey700)] disabled:cursor-not-allowed disabled:opacity-50", "aria-expanded": open, "aria-haspopup": "menu", children: [_jsx("span", { children: "more" }), _jsx(ChevronDownIcon, { className: `h-4 w-4 transition-transform ${open ? "rotate-180" : ""}` })] }), open ? (_jsxs("div", { role: "menu", className: "absolute bottom-[calc(100%+6px)] right-0 z-[20] min-w-[120px] overflow-hidden rounded-[10px] border border-[var(--adaptive-grey200)] bg-white py-[4px] shadow-[0_8px_24px_rgba(15,23,42,0.12)]", children: [_jsx("button", { type: "button", role: "menuitem", onClick: onImport, className: "flex w-full px-[12px] py-[8px] text-left text-[13px] font-semibold text-[var(--adaptive-grey800)] hover:bg-[var(--adaptive-grey100)]", children: "import" }), _jsx("button", { type: "button", role: "menuitem", onClick: onExport, className: "flex w-full px-[12px] py-[8px] text-left text-[13px] font-semibold text-[var(--adaptive-grey800)] hover:bg-[var(--adaptive-grey100)]", children: "export" })] })) : null] }));
}
//# sourceMappingURL=PanelMoreMenu.js.map