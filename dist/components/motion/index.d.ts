import { type CSSProperties, type ElementType, type HTMLAttributes, type ReactNode } from "react";
type MotionPrimitive = string | number;
type MotionStyle = Omit<CSSProperties, "transition"> & {
    opacity?: number;
    scale?: MotionPrimitive;
    x?: MotionPrimitive;
    y?: MotionPrimitive;
    transform?: string;
};
type MotionTransition = {
    delay?: number;
    duration?: number;
    ease?: string;
    type?: "spring" | "tween";
    mass?: number;
    stiffness?: number;
    damping?: number;
};
type MotionConfig = {
    initial?: MotionStyle | false;
    animate?: MotionStyle;
    exit?: MotionStyle;
    transition?: MotionTransition;
    layoutTransition?: MotionTransition;
    layout?: boolean;
    layoutId?: string;
};
type MotionProps<T extends ElementType> = MotionConfig & Omit<HTMLAttributes<HTMLElement>, keyof MotionConfig> & {
    as?: T;
    style?: CSSProperties;
    children?: ReactNode;
};
export declare function AnimatedPresence({ children }: {
    children: ReactNode;
}): import("react/jsx-runtime").JSX.Element[];
declare function createMotionComponent(tagName: string): import("react").ForwardRefExoticComponent<MotionConfig & Omit<HTMLAttributes<HTMLElement>, keyof MotionConfig> & {
    as?: ElementType | undefined;
    style?: CSSProperties;
    children?: ReactNode;
} & import("react").RefAttributes<HTMLElement>>;
type MotionFactory = {
    [K in keyof JSX.IntrinsicElements]: ReturnType<typeof createMotionComponent>;
};
export declare const motion: MotionFactory;
export type { MotionConfig, MotionProps, MotionStyle, MotionTransition };
//# sourceMappingURL=index.d.ts.map