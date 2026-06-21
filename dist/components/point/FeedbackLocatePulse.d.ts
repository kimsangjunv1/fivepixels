import { type MotionTransition } from "../../components/motion/index.js";
export declare const LOCATE_PULSE_TRANSITION: MotionTransition;
export declare const LOCATE_PULSE_RIPPLE_TRANSITION: MotionTransition;
export declare function useLocatePulseTick(active: boolean): number;
type MarkerLocatePulseProps = {
    left: number;
    top: number;
    tick: number;
    accentColor: string;
};
export declare function MarkerLocatePulse({ left, top, tick, accentColor }: MarkerLocatePulseProps): import("react/jsx-runtime").JSX.Element;
type TargetLocatePulseProps = {
    rect: DOMRect;
    tick: number;
    outlineColor: string;
    surfaceColor: string;
};
export declare function TargetLocatePulse({ rect, tick, outlineColor, surfaceColor }: TargetLocatePulseProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=FeedbackLocatePulse.d.ts.map