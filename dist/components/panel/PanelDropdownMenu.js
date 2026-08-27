import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { MenuTooltipItem, MenuTooltipSurface } from "../../components/ui/MenuTooltip.js";
const MENU_GAP = 0;
// const MENU_GAP = 6;
const VIEWPORT_PADDING = 8;
function computeDropdownPlacement(triggerRect, menuWidth, menuHeight, preferredAlign) {
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const spaceAbove = triggerRect.top - VIEWPORT_PADDING;
    const spaceBelow = viewportHeight - triggerRect.bottom - VIEWPORT_PADDING;
    const fitsAbove = menuHeight + MENU_GAP <= spaceAbove;
    const fitsBelow = menuHeight + MENU_GAP <= spaceBelow;
    let vertical;
    if (fitsBelow && !fitsAbove) {
        vertical = "bottom";
    }
    else if (!fitsBelow && fitsAbove) {
        vertical = "top";
    }
    else if (fitsAbove && fitsBelow) {
        vertical = "bottom";
    }
    else {
        vertical = spaceBelow >= spaceAbove ? "bottom" : "top";
    }
    const viewportTop = vertical === "top" ? triggerRect.top - menuHeight - MENU_GAP : triggerRect.bottom + MENU_GAP;
    const alignRightLeft = triggerRect.right - menuWidth;
    const alignLeftLeft = triggerRect.left;
    const alignRightOverflow = alignRightLeft < VIEWPORT_PADDING ||
        alignRightLeft + menuWidth > viewportWidth - VIEWPORT_PADDING;
    const alignLeftOverflow = alignLeftLeft < VIEWPORT_PADDING ||
        alignLeftLeft + menuWidth > viewportWidth - VIEWPORT_PADDING;
    let viewportLeft;
    if (preferredAlign === "right") {
        if (!alignRightOverflow) {
            viewportLeft = alignRightLeft;
        }
        else if (!alignLeftOverflow) {
            viewportLeft = alignLeftLeft;
        }
        else {
            viewportLeft = alignRightLeft;
        }
    }
    else if (!alignLeftOverflow) {
        viewportLeft = alignLeftLeft;
    }
    else if (!alignRightOverflow) {
        viewportLeft = alignRightLeft;
    }
    else {
        viewportLeft = alignLeftLeft;
    }
    const maxLeft = Math.max(VIEWPORT_PADDING, viewportWidth - menuWidth - VIEWPORT_PADDING);
    const maxTop = Math.max(VIEWPORT_PADDING, viewportHeight - menuHeight - VIEWPORT_PADDING);
    return {
        top: Math.min(Math.max(viewportTop, VIEWPORT_PADDING), maxTop),
        left: Math.min(Math.max(viewportLeft, VIEWPORT_PADDING), maxLeft),
    };
}
function toRelativePlacement(viewportPlacement, rootRect) {
    return {
        top: viewportPlacement.top - rootRect.top,
        left: viewportPlacement.left - rootRect.left,
    };
}
function isSamePlacement(current, next) {
    if (current === next) {
        return true;
    }
    if (!current || !next) {
        return false;
    }
    return current.top === next.top && current.left === next.left;
}
/**
 * Shared dropdown shell for panel chrome controls (role, presentation, author, etc.).
 * Menu surface matches the pick-target right-click menu-tooltip look.
 */
export function PanelDropdownMenu({ open, onClose, trigger, children, menuClassName, align = "right", }) {
    const rootRef = useRef(null);
    const menuRef = useRef(null);
    const [menuPlacement, setMenuPlacement] = useState(null);
    const updateMenuPlacement = useCallback(() => {
        const root = rootRef.current;
        const menu = menuRef.current;
        if (!root || !menu) {
            return;
        }
        const rootRect = root.getBoundingClientRect();
        const triggerRect = rootRect;
        const menuRect = menu.getBoundingClientRect();
        const viewportPlacement = computeDropdownPlacement(triggerRect, menuRect.width, menuRect.height, align);
        const nextPlacement = toRelativePlacement(viewportPlacement, rootRect);
        setMenuPlacement((current) => isSamePlacement(current, nextPlacement) ? current : nextPlacement);
    }, [align]);
    useLayoutEffect(() => {
        if (!open) {
            setMenuPlacement((current) => (current === null ? current : null));
            return;
        }
        updateMenuPlacement();
        window.addEventListener("resize", updateMenuPlacement);
        window.addEventListener("scroll", updateMenuPlacement, true);
        const resizeObserver = typeof ResizeObserver !== "undefined" ? new ResizeObserver(updateMenuPlacement) : null;
        if (resizeObserver && rootRef.current) {
            resizeObserver.observe(rootRef.current);
        }
        if (resizeObserver && menuRef.current) {
            resizeObserver.observe(menuRef.current);
        }
        return () => {
            window.removeEventListener("resize", updateMenuPlacement);
            window.removeEventListener("scroll", updateMenuPlacement, true);
            resizeObserver?.disconnect();
        };
    }, [open, updateMenuPlacement]);
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
    const menuStyle = menuPlacement
        ? {
            top: menuPlacement.top,
            left: menuPlacement.left,
            visibility: "visible",
        }
        : {
            top: 0,
            left: 0,
            visibility: "hidden",
        };
    return (_jsxs("div", { ref: rootRef, className: "relative shrink-0 h-[inherit]", children: [trigger, open ? (_jsx(MenuTooltipSurface, { ref: menuRef, role: "menu", positioning: "absolute", style: menuStyle, onPointerDown: (event) => event.stopPropagation(), className: menuClassName ?? "", children: children })) : null] }));
}
export function PanelDropdownMenuItem({ onClick, active = false, disabled = false, danger = false, icon, children, className = "", }) {
    return (_jsx(MenuTooltipItem, { active: active, disabled: disabled, danger: danger, icon: icon, className: className, onPointerDown: (event) => event.stopPropagation(), onClick: onClick, children: children }));
}
//# sourceMappingURL=PanelDropdownMenu.js.map