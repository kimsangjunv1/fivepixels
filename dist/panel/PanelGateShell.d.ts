import type { ButtonHTMLAttributes, ReactNode } from "react";
export declare const PANEL_GATE_SECTION_CLASS = "flex flex-col gap-[12px] bg-[var(--adaptive-black50)] p-[16px] rounded-[0_0_12px_12px]";
export declare const PANEL_GATE_TITLE_CLASS = "text-[14px] font-bold text-[var(--adaptive-black900)]";
export declare const PANEL_GATE_DESCRIPTION_CLASS = "mt-[4px] text-[12px] leading-[1.5] text-[var(--adaptive-black600)]";
export declare const PANEL_GATE_PRIMARY_BUTTON_CLASS = "rounded-[8px] bg-[var(--adaptive-blue100)] px-[12px] py-[6px] text-[12px] font-bold text-[var(--adaptive-blue500)] disabled:opacity-50";
export declare const PANEL_GATE_SECONDARY_BUTTON_CLASS = "rounded-[8px] bg-[var(--adaptive-grey300)] px-[12px] py-[6px] text-[12px] font-semibold text-[var(--adaptive-black700)]";
export declare const PANEL_GATE_BACK_BUTTON_CLASS = "text-[12px] font-semibold text-[var(--adaptive-black500)] hover:text-[var(--adaptive-black700)]";
export declare const PANEL_GATE_INPUT_CLASS = "w-full rounded-[8px] border border-[var(--adaptive-border-subtle)] bg-[var(--adaptive-surface)] px-[10px] py-[8px] text-[12px] text-[var(--adaptive-text-primary)] outline-none";
export declare const PANEL_GATE_LABEL_CLASS = "mb-[4px] text-[11px] font-medium text-[var(--adaptive-black600)]";
type PanelGateShellProps = {
    title: string;
    description: string;
    children?: ReactNode;
    footer?: ReactNode;
};
export declare function PanelGateShell({ title, description, children, footer }: PanelGateShellProps): import("react").JSX.Element;
type GateButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: "primary" | "secondary" | "back";
};
export declare function PanelGateButton({ variant, className, ...props }: GateButtonProps): import("react").JSX.Element;
export {};
//# sourceMappingURL=PanelGateShell.d.ts.map