import { type ButtonHTMLAttributes, type CSSProperties, type HTMLAttributes, type ReactNode } from "react";
/** Shared icon size for menu-tooltip rows (matches pick-target context menu). */
export declare const MENU_TOOLTIP_ICON_CLASS = "h-[16px] w-[16px] shrink-0";
/**
 * Shared menu-tooltip shell used by the pick-target right-click menu and panel dropdowns.
 */
export declare const MenuTooltipSurface: import("react").ForwardRefExoticComponent<{
    children: ReactNode;
    className?: string;
    style?: CSSProperties;
    /** Fixed overlay (context menu) vs absolute (dropdown under trigger). */
    positioning?: "fixed" | "absolute";
} & Omit<HTMLAttributes<HTMLDivElement>, "style" | "children" | "className"> & import("react").RefAttributes<HTMLDivElement>>;
type MenuTooltipItemProps = {
    children: ReactNode;
    onClick: () => void;
    active?: boolean;
    disabled?: boolean;
    danger?: boolean;
    icon?: ReactNode;
    className?: string;
} & Pick<ButtonHTMLAttributes<HTMLButtonElement>, "onPointerDown" | "aria-pressed">;
export declare function MenuTooltipItem({ children, onClick, active, disabled, danger, icon, className, onPointerDown, "aria-pressed": ariaPressed, }: MenuTooltipItemProps): import("react").JSX.Element;
export declare function MenuTooltipDivider(): import("react").JSX.Element;
export {};
//# sourceMappingURL=MenuTooltip.d.ts.map