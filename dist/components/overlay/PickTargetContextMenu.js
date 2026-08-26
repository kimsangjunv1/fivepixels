import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect } from "react";
import { DeleteIcon, EditIcon, MemoIcon, RevertIcon } from "../../components/icons/Icons.js";
import { MENU_TOOLTIP_ICON_CLASS, MenuTooltipDivider, MenuTooltipItem, MenuTooltipSurface, } from "../../components/ui/MenuTooltip.js";
import { useReportPreferences, useReportSession } from "../../providers/reportContext.js";
export function PickTargetContextMenu({ clientX, clientY, showRevert }) {
    const { messages } = useReportPreferences();
    const { closePickTargetContextMenu, handlePickTargetEdit, handlePickTargetDelete, handlePickTargetRevert, handlePickTargetMemo, } = useReportSession();
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
    const left = Math.min(clientX, Math.max(8, viewportWidth - 180));
    const top = Math.min(clientY, Math.max(8, viewportHeight - (showRevert ? 176 : 144)));
    return (_jsxs(MenuTooltipSurface, { positioning: "fixed", style: { left, top }, onClick: (event) => event.stopPropagation(), onContextMenu: (event) => {
            event.preventDefault();
            event.stopPropagation();
        }, children: [_jsx(MenuTooltipItem, { icon: _jsx(EditIcon, { className: MENU_TOOLTIP_ICON_CLASS, fill: "currentColor" }), onClick: () => handlePickTargetEdit(), children: messages.pickTarget.contextEdit }), _jsx(MenuTooltipItem, { icon: _jsx(MemoIcon, { className: MENU_TOOLTIP_ICON_CLASS, fill: "currentColor" }), onClick: () => handlePickTargetMemo(), children: messages.pickTarget.contextAddMemo }), showRevert ? (_jsx(MenuTooltipItem, { icon: _jsx(RevertIcon, { className: MENU_TOOLTIP_ICON_CLASS, fill: "currentColor" }), onClick: () => handlePickTargetRevert(), children: messages.pickTarget.contextRevert })) : null, _jsx(MenuTooltipDivider, {}), _jsx(MenuTooltipItem, { danger: true, icon: _jsx(DeleteIcon, { className: MENU_TOOLTIP_ICON_CLASS, fill: "currentColor" }), onClick: () => handlePickTargetDelete(), children: messages.pickTarget.contextDelete })] }));
}
//# sourceMappingURL=PickTargetContextMenu.js.map