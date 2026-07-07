import { type CSSProperties, type ElementType } from "react";
export type TextShimmerProps = {
    children: string;
    as?: ElementType;
    className?: string;
    duration?: number;
    style?: CSSProperties;
    color?: {
        start: string;
        end: string;
    };
};
export declare function Shimmer({ children, as: Component, className, style, color, duration, }: TextShimmerProps): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=Shimmer.d.ts.map