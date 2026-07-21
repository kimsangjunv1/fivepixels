import type { ButtonHTMLAttributes, ReactNode } from "react";

export const PANEL_GATE_SECTION_CLASS = "flex flex-col gap-[12px] bg-[var(--adaptive-black50)] p-[16px] rounded-[0_0_12px_12px]";
export const PANEL_GATE_TITLE_CLASS = "text-[14px] font-bold text-[var(--adaptive-black900)]";
export const PANEL_GATE_DESCRIPTION_CLASS = "mt-[4px] text-[12px] leading-[1.5] text-[var(--adaptive-black600)]";
export const PANEL_GATE_PRIMARY_BUTTON_CLASS =
    "rounded-[8px] bg-[var(--adaptive-blue100)] px-[12px] py-[6px] text-[12px] font-bold text-[var(--adaptive-blue500)] disabled:opacity-50";
export const PANEL_GATE_SECONDARY_BUTTON_CLASS =
    "rounded-[8px] bg-[var(--adaptive-grey300)] px-[12px] py-[6px] text-[12px] font-semibold text-[var(--adaptive-black700)]";
export const PANEL_GATE_BACK_BUTTON_CLASS =
    "text-[12px] font-semibold text-[var(--adaptive-black500)] hover:text-[var(--adaptive-black700)]";

type PanelGateShellProps = {
    title: string;
    description: string;
    children?: ReactNode;
    footer?: ReactNode;
};

export function PanelGateShell({ title, description, children, footer }: PanelGateShellProps) {
    return (
        <section className={PANEL_GATE_SECTION_CLASS}>
            <div>
                <h6 className={PANEL_GATE_TITLE_CLASS}>{title}</h6>
                <p className={PANEL_GATE_DESCRIPTION_CLASS}>{description}</p>
            </div>
            {children}
            {footer}
        </section>
    );
}

type GateButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: "primary" | "secondary" | "back";
};

export function PanelGateButton({ variant = "primary", className = "", ...props }: GateButtonProps) {
    const variantClass =
        variant === "secondary" ? PANEL_GATE_SECONDARY_BUTTON_CLASS : variant === "back" ? PANEL_GATE_BACK_BUTTON_CLASS : PANEL_GATE_PRIMARY_BUTTON_CLASS;

    return (
        <button
            type="button"
            className={`${variantClass} ${className}`.trim()}
            {...props}
        />
    );
}
