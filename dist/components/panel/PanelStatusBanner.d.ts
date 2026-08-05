import type { ReactNode } from "react";
export type PanelStatusBannerAction = {
    id: string;
    label: string;
    onClick: () => void;
    disabled?: boolean;
    /** Highlight the currently active option (e.g. 표기 vs 숨기기). */
    active?: boolean;
    ariaLabel?: string;
    title?: string;
    children?: ReactNode;
};
type PanelStatusBannerProps = {
    message: string;
    actions: PanelStatusBannerAction[];
    leading?: ReactNode;
    trailing?: ReactNode;
    /** First banner in a stack keeps the panel's top radius. */
    roundedTop?: boolean;
};
/**
 * Shared panel notice bar: message on the left, action controls on the right.
 */
export declare function PanelStatusBanner({ message, actions, leading, trailing, roundedTop }: PanelStatusBannerProps): import("react").JSX.Element;
export {};
//# sourceMappingURL=PanelStatusBanner.d.ts.map