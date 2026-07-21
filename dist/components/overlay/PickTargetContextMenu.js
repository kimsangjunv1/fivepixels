import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect } from "react";
import { DeleteIcon, EditIcon, RevertIcon } from "../../components/icons/Icons.js";
import { useReportPreferences, useReportSession } from "../../providers/reportContext.js";
const MENU_SURFACE_CLASS = "pointer-events-auto fixed z-[1000004] min-w-[140px] overflow-hidden rounded-[10px] border border-[var(--adaptive-border-subtle)] bg-[var(--adaptive-surface-overlay)] py-[4px] shadow-[var(--adaptive-popup-shadow)] backdrop-blur-[20px]";
const MENU_ITEM_CLASS = "flex w-full items-center gap-[8px] px-[12px] py-[8px] text-left text-[14px] font-medium hover:bg-[var(--adaptive-black100)]";
const MENU_DIVIDER_CLASS = "my-[4px] h-px bg-[var(--adaptive-border-subtle)]";
export function PickTargetContextMenu({ clientX, clientY, showRevert }) {
    const { messages } = useReportPreferences();
    const { closePickTargetContextMenu, handlePickTargetEdit, handlePickTargetDelete, handlePickTargetRevert, } = useReportSession();
    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === "Escape") {
                closePickTargetContextMenu();
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [closePickTargetContextMenu]);
    const viewportWidth = typeof window !== "undefined" ? window.innerWidth : 0;
    const viewportHeight = typeof window !== "undefined" ? window.innerHeight : 0;
    const left = Math.min(clientX, Math.max(8, viewportWidth - 160));
    const top = Math.min(clientY, Math.max(8, viewportHeight - (showRevert ? 140 : 108)));
    return (_jsxs("div", { "data-fivepixels-interactive": "", className: MENU_SURFACE_CLASS, style: { left, top }, onClick: (event) => event.stopPropagation(), onContextMenu: (event) => {
            event.preventDefault();
            event.stopPropagation();
        }, children: [_jsxs("button", { type: "button", "data-fivepixels-interactive": "", onClick: () => handlePickTargetEdit(), className: `${MENU_ITEM_CLASS} text-[#1f1f1f]`, children: [_jsx(EditIcon, { className: "h-[18px] w-[18px] shrink-0", fill: "#1f1f1f" }), messages.pickTarget.contextEdit] }), showRevert ? (_jsxs("button", { type: "button", "data-fivepixels-interactive": "", onClick: () => handlePickTargetRevert(), className: `${MENU_ITEM_CLASS} text-[#1f1f1f]`, children: [_jsx(RevertIcon, { className: "h-[18px] w-[18px] shrink-0", fill: "#1f1f1f" }), messages.pickTarget.contextRevert] })) : null, _jsx("div", { role: "separator", "aria-hidden": "true", className: MENU_DIVIDER_CLASS }), _jsxs("button", { type: "button", "data-fivepixels-interactive": "", onClick: () => handlePickTargetDelete(), className: `${MENU_ITEM_CLASS} text-[#ff1861] hover:bg-[#ff18611a]`, children: [_jsx(DeleteIcon, { className: "h-[18px] w-[18px] shrink-0", fill: "#ff1861" }), messages.pickTarget.contextDelete] })] }));
}
//# sourceMappingURL=PickTargetContextMenu.js.map