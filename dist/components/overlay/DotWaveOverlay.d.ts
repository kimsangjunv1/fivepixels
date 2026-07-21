import { type CSSProperties } from "react";
export type DotWaveOrigin = {
    x: number;
    y: number;
};
export type DotWaveOverlayProps = {
    active?: boolean;
    dotSize?: number;
    gap?: number;
    minOpacity?: number;
    maxOpacity?: number;
    waveDuration?: number;
    fadeOutDuration?: number;
    deactivateDelay?: number;
    color?: string;
    origin?: DotWaveOrigin;
    className?: string;
    style?: CSSProperties;
};
export declare function DotWaveOverlay({ active, dotSize, gap, minOpacity, maxOpacity, waveDuration, fadeOutDuration, deactivateDelay, color, origin, className, style, }: DotWaveOverlayProps): import("react").JSX.Element;
//# sourceMappingURL=DotWaveOverlay.d.ts.map