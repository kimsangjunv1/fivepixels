import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";

const MENU_GAP = 6;
const VIEWPORT_PADDING = 8;

type PanelDropdownMenuProps = {
    open: boolean;
    onClose: () => void;
    trigger: ReactNode;
    children: ReactNode;
    menuClassName?: string;
    align?: "left" | "right";
};

type MenuPlacement = {
    top: number;
    left: number;
};

function computeDropdownPlacement(triggerRect: DOMRect, menuWidth: number, menuHeight: number, preferredAlign: "left" | "right"): MenuPlacement {
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    const spaceAbove = triggerRect.top - VIEWPORT_PADDING;
    const spaceBelow = viewportHeight - triggerRect.bottom - VIEWPORT_PADDING;
    const fitsAbove = menuHeight + MENU_GAP <= spaceAbove;
    const fitsBelow = menuHeight + MENU_GAP <= spaceBelow;

    let vertical: "top" | "bottom";

    if (fitsAbove && !fitsBelow) {
        vertical = "top";
    } else if (!fitsAbove && fitsBelow) {
        vertical = "bottom";
    } else if (fitsAbove && fitsBelow) {
        vertical = "top";
    } else {
        vertical = spaceAbove >= spaceBelow ? "top" : "bottom";
    }

    const viewportTop = vertical === "top" ? triggerRect.top - menuHeight - MENU_GAP : triggerRect.bottom + MENU_GAP;

    const alignRightLeft = triggerRect.right - menuWidth;
    const alignLeftLeft = triggerRect.left;
    const alignRightOverflow = alignRightLeft < VIEWPORT_PADDING || alignRightLeft + menuWidth > viewportWidth - VIEWPORT_PADDING;
    const alignLeftOverflow = alignLeftLeft < VIEWPORT_PADDING || alignLeftLeft + menuWidth > viewportWidth - VIEWPORT_PADDING;

    let viewportLeft: number;

    if (preferredAlign === "right") {
        if (!alignRightOverflow) {
            viewportLeft = alignRightLeft;
        } else if (!alignLeftOverflow) {
            viewportLeft = alignLeftLeft;
        } else {
            viewportLeft = alignRightLeft;
        }
    } else if (!alignLeftOverflow) {
        viewportLeft = alignLeftLeft;
    } else if (!alignRightOverflow) {
        viewportLeft = alignRightLeft;
    } else {
        viewportLeft = alignLeftLeft;
    }

    const maxLeft = Math.max(VIEWPORT_PADDING, viewportWidth - menuWidth - VIEWPORT_PADDING);
    const maxTop = Math.max(VIEWPORT_PADDING, viewportHeight - menuHeight - VIEWPORT_PADDING);

    return {
        top: Math.min(Math.max(viewportTop, VIEWPORT_PADDING), maxTop),
        left: Math.min(Math.max(viewportLeft, VIEWPORT_PADDING), maxLeft),
    };
}

function toRelativePlacement(viewportPlacement: MenuPlacement, rootRect: DOMRect): MenuPlacement {
    return {
        top: viewportPlacement.top - rootRect.top,
        left: viewportPlacement.left - rootRect.left,
    };
}

export function PanelDropdownMenu({ open, onClose, trigger, children, menuClassName, align = "right" }: PanelDropdownMenuProps) {
    const rootRef = useRef<HTMLDivElement | null>(null);
    const menuRef = useRef<HTMLDivElement | null>(null);
    const [menuPlacement, setMenuPlacement] = useState<MenuPlacement | null>(null);

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

    const menuStyle: CSSProperties | undefined = menuPlacement
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

    return (
        <div
            ref={rootRef}
            className="relative shrink-0"
        >
            {trigger}

            {open ? (
                <div
                    ref={menuRef}
                    role="menu"
                    style={menuStyle}
                    className={`absolute z-[20] min-w-[120px] overflow-hidden rounded-[12px] border border-[var(--adaptive-black200)] bg-white shadow-[0_8px_24px_rgba(15,23,42,0.12)] ${menuClassName ?? ""}`}
                >
                    {children}
                </div>
            ) : null}
        </div>
    );
}

type PanelDropdownMenuItemProps = {
    onClick: () => void;
    active?: boolean;
    disabled?: boolean;
    children: ReactNode;
};

export function PanelDropdownMenuItem({ onClick, active = false, disabled = false, children }: PanelDropdownMenuItemProps) {
    return (
        <button
            type="button"
            role="menuitem"
            disabled={disabled}
            onClick={onClick}
            aria-pressed={active}
            className={`flex w-full px-[12px] py-[8px] text-left text-[12px] font-semibold disabled:cursor-not-allowed disabled:opacity-50 ${active ? "bg-[var(--adaptive-black100)] text-[var(--adaptive-black900)]" : "text-[var(--adaptive-black800)] hover:bg-[var(--adaptive-black100)]"}`}
        >
            {children}
        </button>
    );
}
