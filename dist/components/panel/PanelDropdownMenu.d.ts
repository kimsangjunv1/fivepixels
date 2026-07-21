import { type ReactNode } from "react";
type PanelDropdownMenuProps = {
    open: boolean;
    onClose: () => void;
    trigger: ReactNode;
    children: ReactNode;
    menuClassName?: string;
    align?: "left" | "right";
};
export declare function PanelDropdownMenu({ open, onClose, trigger, children, menuClassName, align }: PanelDropdownMenuProps): import("react").JSX.Element;
type PanelDropdownMenuItemProps = {
    onClick: () => void;
    active?: boolean;
    disabled?: boolean;
    children: ReactNode;
};
export declare function PanelDropdownMenuItem({ onClick, active, disabled, children }: PanelDropdownMenuItemProps): import("react").JSX.Element;
export {};
//# sourceMappingURL=PanelDropdownMenu.d.ts.map