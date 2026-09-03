import type { ReactNode } from "react";
type StyleInspectTooltipRowProps = {
    label: string;
    value: string;
    valueClassName?: string;
};
/** Label/value row used by feedback pick-target style tooltips. */
export declare function StyleInspectTooltipRow({ label, value, valueClassName }: StyleInspectTooltipRowProps): import("react").JSX.Element;
type StyleInspectTooltipProps = {
    open: boolean;
    pointer: {
        clientX: number;
        clientY: number;
    } | null;
    children: ReactNode;
    className?: string;
};
/** Feedback pick-target style tooltip shell (surface, padding, row gap). */
export declare function StyleInspectTooltip({ open, pointer, children, className }: StyleInspectTooltipProps): import("react").JSX.Element;
export {};
//# sourceMappingURL=StyleInspectTooltip.d.ts.map