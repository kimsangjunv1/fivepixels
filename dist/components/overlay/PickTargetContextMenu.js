import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect } from "react";
import { useReport } from "../../providers/reportContext.js";
const MENU_SURFACE_CLASS = "pointer-events-auto fixed z-[1000004] min-w-[140px] overflow-hidden rounded-[10px] border border-[var(--adaptive-border-subtle)] bg-[var(--adaptive-surface-overlay)] py-[4px] shadow-[var(--adaptive-popup-shadow)] backdrop-blur-[20px]";
export function PickTargetContextMenu({ clientX, clientY, showRevert }) {
    const { messages, closePickTargetContextMenu, handlePickTargetEdit, handlePickTargetDelete, handlePickTargetRevert, } = useReport();
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
    const top = Math.min(clientY, Math.max(8, viewportHeight - (showRevert ? 128 : 96)));
    return (_jsxs("div", { "data-fivepixels-interactive": "", className: MENU_SURFACE_CLASS, style: { left, top }, onClick: (event) => event.stopPropagation(), onContextMenu: (event) => {
            event.preventDefault();
            event.stopPropagation();
        }, children: [_jsx("button", { type: "button", "data-fivepixels-interactive": "", onClick: () => handlePickTargetEdit(), className: "block w-full px-[12px] py-[8px] text-left text-[12px] font-medium text-[var(--adaptive-black900)] hover:bg-[var(--adaptive-black100)]", children: messages.pickTarget.contextEdit }), showRevert ? (_jsx("button", { type: "button", "data-fivepixels-interactive": "", onClick: () => handlePickTargetRevert(), className: "block w-full px-[12px] py-[8px] text-left text-[12px] font-medium text-[var(--adaptive-black900)] hover:bg-[var(--adaptive-black100)]", children: messages.pickTarget.contextRevert })) : null, _jsx("button", { type: "button", "data-fivepixels-interactive": "", onClick: () => handlePickTargetDelete(), className: "block w-full px-[12px] py-[8px] text-left text-[12px] font-medium text-[#dc2626] hover:bg-[#ef44441a]", children: messages.pickTarget.contextDelete })] }));
}
//# sourceMappingURL=PickTargetContextMenu.js.map