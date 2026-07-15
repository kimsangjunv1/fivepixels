import { type ReactNode } from "react";
type HoverTooltipProps = {
    label?: string;
    content?: ReactNode;
    multiline?: boolean;
    disabled?: boolean;
    children: ReactNode;
    className?: string;
};
export declare function HoverTooltip({ label, content, multiline, disabled, children, className }: HoverTooltipProps): import("react").JSX.Element;
export {};
//# sourceMappingURL=HoverTooltip.d.ts.map