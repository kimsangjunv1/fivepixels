import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
const MENU_GAP = 6;
const VIEWPORT_PADDING = 8;
function computeDropdownPlacement(triggerRect, menuWidth, menuHeight, preferredAlign) {
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const spaceAbove = triggerRect.top - VIEWPORT_PADDING;
    const spaceBelow = viewportHeight - triggerRect.bottom - VIEWPORT_PADDING;
    const fitsAbove = menuHeight + MENU_GAP <= spaceAbove;
    const fitsBelow = menuHeight + MENU_GAP <= spaceBelow;
    let vertical;
    if (fitsAbove && !fitsBelow) {
        vertical = "top";
    }
    else if (!fitsAbove && fitsBelow) {
        vertical = "bottom";
    }
    else if (fitsAbove && fitsBelow) {
        vertical = "top";
    }
    else {
        vertical = spaceAbove >= spaceBelow ? "top" : "bottom";
    }
    const viewportTop = vertical === "top" ? triggerRect.top - menuHeight - MENU_GAP : triggerRect.bottom + MENU_GAP;
    const alignRightLeft = triggerRect.right - menuWidth;
    const alignLeftLeft = triggerRect.left;
    const alignRightOverflow = alignRightLeft < VIEWPORT_PADDING || alignRightLeft + menuWidth > viewportWidth - VIEWPORT_PADDING;
    const alignLeftOverflow = alignLeftLeft < VIEWPORT_PADDING || alignLeftLeft + menuWidth > viewportWidth - VIEWPORT_PADDING;
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
export function PanelDropdownMenu({ open, onClose, trigger, children, menuClassName, align = "right" }) {
    const rootRef = useRef(null);
    const menuRef = useRef(null);
    const [menuPlacement, setMenuPlacement] = useState(null);
    const updateMenuPlacement = () => {
        const root = rootRef.current;
        const menu = menuRef.current;
        if (!root || !menu) {
            return;
        }
        const rootRect = root.getBoundingClientRect();
        const triggerRect = rootRect;
        const menuRect = menu.getBoundingClientRect();
        const viewportPlacement = computeDropdownPlacement(triggerRect, menuRect.width, menuRect.height, align);
        setMenuPlacement(toRelativePlacement(viewportPlacement, rootRect));
    };
    useLayoutEffect(() => {
        if (!open) {
            setMenuPlacement(null);
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
    }, [align, open, children]);
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
    return (_jsxs("div", { ref: rootRef, className: "relative shrink-0", children: [trigger, open ? (_jsx("div", { ref: menuRef, role: "menu", style: menuStyle, className: `absolute z-[20] min-w-[120px] overflow-hidden rounded-[12px] border border-[var(--adaptive-black200)] bg-[var(--adaptive-black50)] shadow-[0_0_100px_rgba(0,0,0,0.2)] ${menuClassName ?? ""}`, children: children })) : null] }));
}
export function PanelDropdownMenuItem({ onClick, active = false, disabled = false, children }) {
    return (_jsx("button", { type: "button", role: "menuitem", disabled: disabled, onClick: onClick, "aria-pressed": active, className: `flex w-full px-[12px] py-[8px] text-left text-[12px] font-semibold disabled:cursor-not-allowed disabled:opacity-50 ${active ? "bg-[var(--adaptive-black100)] text-[var(--adaptive-black900)]" : "text-[var(--adaptive-black800)] hover:bg-[var(--adaptive-black100)]"}`, children: children }));
}
//# sourceMappingURL=PanelDropdownMenu.js.map