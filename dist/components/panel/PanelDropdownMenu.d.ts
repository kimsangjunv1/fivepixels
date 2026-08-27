import { type ReactNode } from "react";
type PanelDropdownMenuProps = {
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
export declare function PanelDropdownMenu({ open, onClose, trigger, children, menuClassName, align, }: PanelDropdownMenuProps): import("react").JSX.Element;
type PanelDropdownMenuItemProps = {
    onClick: () => void;
    active?: boolean;
    disabled?: boolean;
    danger?: boolean;
    icon?: ReactNode;
    children: ReactNode;
    className?: string;
};
export declare function PanelDropdownMenuItem({ onClick, active, disabled, danger, icon, children, className, }: PanelDropdownMenuItemProps): import("react").JSX.Element;
export {};
//# sourceMappingURL=PanelDropdownMenu.d.ts.map