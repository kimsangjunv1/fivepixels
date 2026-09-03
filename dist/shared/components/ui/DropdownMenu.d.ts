import { type ReactNode } from "react";
type DropdownMenuProps = {
    open: boolean;
    onClose: () => void;
    trigger: ReactNode;
    children: ReactNode;
    menuClassName?: string;
    align?: "left" | "right";
};
/**
 * Shared dropdown shell for panel chrome controls (role, presentation, author, etc.).
 * Menu surface matches the pick-target right-click menu-tooltip look.
 */
export declare function DropdownMenu({ open, onClose, trigger, children, menuClassName, align, }: DropdownMenuProps): import("react").JSX.Element;
type DropdownMenuItemProps = {
    onClick: () => void;
    active?: boolean;
    disabled?: boolean;
    danger?: boolean;
    icon?: ReactNode;
    children: ReactNode;
    className?: string;
};
export declare function DropdownMenuItem({ onClick, active, disabled, danger, icon, children, className, }: DropdownMenuItemProps): import("react").JSX.Element;
export {};
//# sourceMappingURL=DropdownMenu.d.ts.map