import {
    Children,
    cloneElement,
    createContext,
    forwardRef,
    isValidElement,
    type CSSProperties,
    type ElementType,
    type HTMLAttributes,
    type MutableRefObject,
    type Ref,
    type ReactElement,
    type ReactNode,
    useContext,
    useEffect,
    useLayoutEffect,
    useMemo,
    useRef,
    useState,
} from "react";

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
    layout?: boolean;
    layoutId?: string;
};

type MotionProps<T extends ElementType> = MotionConfig &
    Omit<HTMLAttributes<HTMLElement>, keyof MotionConfig> & {
        as?: T;
        style?: CSSProperties;
        children?: ReactNode;
    };

type PresenceContextValue = {
    isPresent: boolean;
    onExitComplete?: () => void;
};

type PresenceTrackedChild = {
    element: ReactElement;
    isPresent: boolean;
};

type ParsedValue = {
    value: number;
    unit: string;
};

type SpringMetrics = {
    damping: number;
    dampingRatio: number;
    mass: number;
    naturalFrequency: number;
    stiffness: number;
};

type TransformParts = {
    x?: ParsedValue;
    y?: ParsedValue;
    scale?: number;
    rest: string[];
};

const PresenceContext = createContext<PresenceContextValue | null>(null);
const layoutRegistry = new Map<string, DOMRect>();
const motionComponentCache = new Map<string, ReturnType<typeof createMotionComponent>>();

function hasSameTrackedChildren(current: PresenceTrackedChild[], next: PresenceTrackedChild[]) {
    if (current.length !== next.length) {
        return false;
    }

    return current.every((child, index) => child.element.key === next[index]?.element.key && child.isPresent === next[index]?.isPresent);
}

function isBrowser() {
    return typeof window !== "undefined" && typeof document !== "undefined";
}

function toMs(value: number | undefined, fallback: number) {
    if (value == null) {
        return fallback;
    }

    return value <= 10 ? value * 1000 : value;
}

function parseNumericValue(value: MotionPrimitive | undefined) {
    if (value == null) {
        return undefined;
    }

    if (typeof value === "number") {
        return { value, unit: "px" };
    }

    const match = String(value)
        .trim()
        .match(/^(-?\d+(?:\.\d+)?)(px|%|rem|em|vw|vh)?$/);

    if (!match) {
        return undefined;
    }

    return { value: Number(match[1]), unit: match[2] ?? "px" };
}

function parseScaleValue(value: MotionPrimitive | undefined) {
    if (value == null) {
        return undefined;
    }

    if (typeof value === "number") {
        return value;
    }

    const parsed = Number(value);
    return Number.isNaN(parsed) ? undefined : parsed;
}

function parseTransformParts(style?: MotionStyle): TransformParts {
    const rawTransform = style?.transform?.trim() ?? "";
    const matrixMatch = rawTransform.match(/^matrix\(([^)]+)\)$/);
    const matrix3dMatch = rawTransform.match(/^matrix3d\(([^)]+)\)$/);

    if (matrixMatch) {
        const values = matrixMatch[1].split(",").map((value) => Number.parseFloat(value.trim()));

        return {
            x: Number.isFinite(values[4]) ? { value: values[4], unit: "px" } : undefined,
            y: Number.isFinite(values[5]) ? { value: values[5], unit: "px" } : undefined,
            scale: Number.isFinite(values[0]) ? values[0] : undefined,
            rest: [],
        };
    }

    if (matrix3dMatch) {
        const values = matrix3dMatch[1].split(",").map((value) => Number.parseFloat(value.trim()));

        return {
            x: Number.isFinite(values[12]) ? { value: values[12], unit: "px" } : undefined,
            y: Number.isFinite(values[13]) ? { value: values[13], unit: "px" } : undefined,
            scale: Number.isFinite(values[0]) ? values[0] : undefined,
            rest: [],
        };
    }

    const rest = rawTransform
        .replace(/translate3d\(([^,]+),([^,]+),([^)]+)\)/g, "")
        .replace(/translateX\(([^)]+)\)/g, "")
        .replace(/translateY\(([^)]+)\)/g, "")
        .replace(/scale\(([^)]+)\)/g, "")
        .trim();
    const translate3d = rawTransform.match(/translate3d\(([^,]+),([^,]+),([^)]+)\)/);
    const translateX = rawTransform.match(/translateX\(([^)]+)\)/);
    const translateY = rawTransform.match(/translateY\(([^)]+)\)/);
    const scale = rawTransform.match(/scale\(([^)]+)\)/);

    return {
        x: parseNumericValue(style?.x ?? translate3d?.[1]?.trim() ?? translateX?.[1]?.trim()),
        y: parseNumericValue(style?.y ?? translate3d?.[2]?.trim() ?? translateY?.[1]?.trim()),
        scale: parseScaleValue(style?.scale ?? scale?.[1]?.trim()),
        rest: rest ? [rest] : [],
    };
}

function composeTransform(parts: TransformParts) {
    const transforms: string[] = [];

    if (parts.x || parts.y) {
        const x = parts.x ? `${parts.x.value}${parts.x.unit}` : "0px";
        const y = parts.y ? `${parts.y.value}${parts.y.unit}` : "0px";
        transforms.push(`translate3d(${x}, ${y}, 0px)`);
    }

    transforms.push(...parts.rest.filter(Boolean));

    if (parts.scale != null) {
        transforms.push(`scale(${parts.scale})`);
    }

    return transforms.join(" ").trim();
}

function clamp(value: number, min: number, max: number) {
    return Math.min(max, Math.max(min, value));
}

function resolveMotionStyle(style?: MotionStyle) {
    if (!style) {
        return {};
    }

    const nextStyle: CSSProperties = {};

    for (const [key, value] of Object.entries(style)) {
        if (value == null || key === "x" || key === "y" || key === "scale" || key === "transform") {
            continue;
        }

        nextStyle[key as keyof CSSProperties] = value as never;
    }

    const transform = composeTransform(parseTransformParts(style));

    if (transform) {
        nextStyle.transform = transform;
    }

    return nextStyle;
}

function getSpringMetrics(transition?: MotionTransition): SpringMetrics {
    const mass = Math.max(0.001, transition?.mass ?? 1);
    const stiffness = Math.max(0.001, transition?.stiffness ?? 100);
    const damping = Math.max(0.001, transition?.damping ?? 10);
    const naturalFrequency = Math.sqrt(stiffness / mass);
    const dampingRatio = damping / (2 * Math.sqrt(stiffness * mass));

    return {
        damping,
        dampingRatio,
        mass,
        naturalFrequency,
        stiffness,
    };
}

function getSpringSettlingDuration(metrics: SpringMetrics) {
    const epsilon = 0.001;

    if (metrics.dampingRatio < 1) {
        return Math.log(1 / epsilon) / (metrics.dampingRatio * metrics.naturalFrequency);
    }

    if (Math.abs(metrics.dampingRatio - 1) < 0.0001) {
        return Math.log(1 / epsilon) / metrics.naturalFrequency;
    }

    const slowPole = metrics.naturalFrequency * (metrics.dampingRatio - Math.sqrt(metrics.dampingRatio * metrics.dampingRatio - 1));
    return Math.log(1 / epsilon) / Math.max(slowPole, 0.001);
}

function getSpringProgress(time: number, metrics: SpringMetrics) {
    if (metrics.dampingRatio < 1) {
        const dampedFrequency = metrics.naturalFrequency * Math.sqrt(1 - metrics.dampingRatio * metrics.dampingRatio);
        const coefficient = metrics.dampingRatio / Math.sqrt(1 - metrics.dampingRatio * metrics.dampingRatio);

        return 1 - Math.exp(-metrics.dampingRatio * metrics.naturalFrequency * time) * (Math.cos(dampedFrequency * time) + coefficient * Math.sin(dampedFrequency * time));
    }

    if (Math.abs(metrics.dampingRatio - 1) < 0.0001) {
        const envelope = Math.exp(-metrics.naturalFrequency * time);
        return 1 - envelope * (1 + metrics.naturalFrequency * time);
    }

    const sqrtTerm = Math.sqrt(metrics.dampingRatio * metrics.dampingRatio - 1);
    const slowPole = -metrics.naturalFrequency * (metrics.dampingRatio - sqrtTerm);
    const fastPole = -metrics.naturalFrequency * (metrics.dampingRatio + sqrtTerm);

    return 1 - (fastPole * Math.exp(slowPole * time) - slowPole * Math.exp(fastPole * time)) / (fastPole - slowPole);
}

function interpolateParsedValue(from: ParsedValue | undefined, to: ParsedValue | undefined, progress: number) {
    if (!from && !to) {
        return undefined;
    }

    if (!from) {
        return to;
    }

    if (!to) {
        return from;
    }

    if (from.unit !== to.unit) {
        return progress >= 1 ? to : from;
    }

    return {
        value: from.value + (to.value - from.value) * progress,
        unit: to.unit,
    };
}

function interpolateNumber(from: number | undefined, to: number | undefined, progress: number) {
    if (from == null && to == null) {
        return undefined;
    }

    if (from == null) {
        return to;
    }

    if (to == null) {
        return from;
    }

    return from + (to - from) * progress;
}

function createTweenKeyframes(from: MotionStyle, to: MotionStyle): Keyframe[] {
    return [resolveMotionStyle(from) as Keyframe, resolveMotionStyle(to) as Keyframe];
}

function createSpringKeyframes(from: MotionStyle, to: MotionStyle, transition?: MotionTransition): Keyframe[] {
    const metrics = getSpringMetrics(transition);
    const fromStyle = resolveMotionStyle(from);
    const toStyle = resolveMotionStyle(to);
    const fromParts = parseTransformParts(from);
    const toParts = parseTransformParts(to);
    const duration = resolveDuration(transition) / 1000;
    const frameCount = clamp(Math.round(duration * 60), 12, 180);
    const keyframes: Keyframe[] = [];

    for (let index = 0; index < frameCount; index += 1) {
        const offset = frameCount === 1 ? 1 : index / (frameCount - 1);
        const progress = getSpringProgress(duration * offset, metrics);
        const clampedProgress = clamp(progress, 0, 1);
        const keyframe: Keyframe = {
            offset,
        };

        const opacity = interpolateNumber(typeof fromStyle.opacity === "number" ? fromStyle.opacity : undefined, typeof toStyle.opacity === "number" ? toStyle.opacity : undefined, clampedProgress);

        if (opacity != null) {
            keyframe.opacity = opacity;
        }

        const transform = composeTransform({
            x: interpolateParsedValue(fromParts.x, toParts.x, progress),
            y: interpolateParsedValue(fromParts.y, toParts.y, progress),
            scale: interpolateNumber(fromParts.scale, toParts.scale, progress),
            rest: toParts.rest.length ? toParts.rest : fromParts.rest,
        });

        if (transform) {
            keyframe.transform = transform;
        }

        keyframes.push(keyframe);
    }

    const lastKeyframe = keyframes[keyframes.length - 1];

    if (typeof toStyle.opacity === "number") {
        lastKeyframe.opacity = toStyle.opacity;
    }

    if (typeof toStyle.transform === "string") {
        lastKeyframe.transform = toStyle.transform;
    }

    return keyframes;
}

function createAnimationFrames(from: MotionStyle, to: MotionStyle, transition?: MotionTransition) {
    if (transition?.type !== "spring") {
        return createTweenKeyframes(from, to);
    }

    return createSpringKeyframes(from, to, transition);
}

function resolveTimingFunction(transition?: MotionTransition) {
    if (transition?.type === "spring") {
        return "linear";
    }

    return transition?.ease ?? "ease";
}

function resolveDuration(transition?: MotionTransition) {
    if (transition?.duration != null) {
        return toMs(transition.duration, 320);
    }

    if (transition?.type === "spring") {
        // console.log("transition", transition);
        // console.log("??", getSpringSettlingDuration(getSpringMetrics(transition)) * (transition.delay ? 1000 : 1));
        const duration = getSpringSettlingDuration(getSpringMetrics(transition)) * (transition.delay ? 1000 : 1);
        return clamp(duration, 120, 6000);
    }

    return 320;
}

function stringifyStyle(style?: MotionStyle) {
    return JSON.stringify(resolveMotionStyle(style));
}

function applyResolvedMotionStyle(node: HTMLElement, style?: MotionStyle) {
    const resolvedStyle = resolveMotionStyle(style);

    if ("opacity" in resolvedStyle) {
        node.style.opacity = String(resolvedStyle.opacity);
    }

    if ("transform" in resolvedStyle) {
        node.style.transform = String(resolvedStyle.transform);
    }
}

function captureCurrentMotionStyle(node: HTMLElement, fallback?: MotionStyle) {
    const computedStyle = window.getComputedStyle(node);
    const nextStyle: MotionStyle = { ...(fallback ?? {}) };
    const opacity = Number.parseFloat(computedStyle.opacity);

    if (!Number.isNaN(opacity)) {
        nextStyle.opacity = opacity;
    }

    if (computedStyle.transform && computedStyle.transform !== "none") {
        nextStyle.transform = computedStyle.transform;
    } else if (fallback?.transform) {
        nextStyle.transform = fallback.transform;
    } else {
        delete nextStyle.transform;
    }

    return nextStyle;
}

function useMergedRef<T>(forwardedRef: Ref<T>, localRef: { current: T | null }) {
    return (value: T | null) => {
        localRef.current = value;

        if (typeof forwardedRef === "function") {
            forwardedRef(value);
            return;
        }

        if (forwardedRef && "current" in forwardedRef) {
            (forwardedRef as MutableRefObject<T | null>).current = value;
        }
    };
}

function animateLayout(node: HTMLElement, fromRect: DOMRect, transition?: MotionTransition) {
    if (typeof node.animate !== "function") {
        return;
    }

    const toRect = node.getBoundingClientRect();
    const deltaX = fromRect.left - toRect.left;
    const deltaY = fromRect.top - toRect.top;
    const scaleX = fromRect.width / Math.max(toRect.width, 1);
    const scaleY = fromRect.height / Math.max(toRect.height, 1);

    if (Math.abs(deltaX) < 0.5 && Math.abs(deltaY) < 0.5 && Math.abs(scaleX - 1) < 0.01 && Math.abs(scaleY - 1) < 0.01) {
        return;
    }

    node.animate(
        [
            {
                transformOrigin: "top left",
                transform: `translate(${deltaX}px, ${deltaY}px) scale(${scaleX}, ${scaleY})`,
            },
            {
                transformOrigin: "top left",
                transform: "translate(0px, 0px) scale(1, 1)",
            },
        ],
        {
            duration: resolveDuration(transition),
            easing: resolveTimingFunction(transition),
            fill: "both",
        },
    );
}

function PresenceChild({ children, isPresent, onExitComplete }: PresenceContextValue & { children: ReactElement }) {
    const value = useMemo(() => ({ isPresent, onExitComplete }), [isPresent, onExitComplete]);

    return <PresenceContext.Provider value={value}>{children}</PresenceContext.Provider>;
}

export function AnimatedPresence({ children }: { children: ReactNode }) {
    const validChildren = Children.toArray(children).filter(isValidElement) as ReactElement[];
    const [trackedChildren, setTrackedChildren] = useState<PresenceTrackedChild[]>(() => validChildren.map((element) => ({ element, isPresent: true })));

    useEffect(() => {
        setTrackedChildren((current) => {
            const nextKeys = new Set(validChildren.map((child) => child.key));
            const nextChildren = validChildren.map((element) => ({ element, isPresent: true }));
            const exitingChildren = current.filter((child) => child.element.key != null && !nextKeys.has(child.element.key)).map((child) => ({ ...child, isPresent: false }));

            const nextTrackedChildren = [...nextChildren, ...exitingChildren];

            return hasSameTrackedChildren(current, nextTrackedChildren) ? current : nextTrackedChildren;
        });
    }, [validChildren]);

    return trackedChildren.map((child) => (
        <PresenceChild
            key={child.element.key}
            isPresent={child.isPresent}
            onExitComplete={() => {
                setTrackedChildren((current) => {
                    const nextTrackedChildren = current.filter((item) => item.element.key !== child.element.key);

                    return nextTrackedChildren.length === current.length ? current : nextTrackedChildren;
                });
            }}
        >
            {cloneElement(child.element)}
        </PresenceChild>
    ));
}

function createMotionComponent(tagName: string) {
    return forwardRef<HTMLElement, MotionProps<ElementType>>(function MotionComponent({ animate, as, children, exit, initial, layout, layoutId, style, transition, ...rest }, forwardedRef) {
        const Component = (as ?? tagName) as ElementType;
        const presence = useContext(PresenceContext);
        const localRef = useRef<HTMLElement | null>(null);
        const lastAnimatedStyleRef = useRef<MotionStyle>(animate ?? {});
        const previousRectRef = useRef<DOMRect | null>(null);
        const animationRef = useRef<Animation | null>(null);
        const hasMountedRef = useRef(false);
        const mergedRef = useMergedRef(forwardedRef, localRef);
        const animateKey = stringifyStyle(animate);

        useEffect(
            () => () => {
                if (animationRef.current) {
                    animationRef.current.cancel();
                    animationRef.current = null;
                }

                if (layoutId && localRef.current) {
                    layoutRegistry.set(layoutId, localRef.current.getBoundingClientRect());
                }
            },
            [layoutId],
        );

        useLayoutEffect(() => {
            const node = localRef.current;

            if (!node) {
                return;
            }

            if (layoutId) {
                const previousSharedRect = layoutRegistry.get(layoutId);

                if (previousSharedRect) {
                    animateLayout(node, previousSharedRect, transition);
                    layoutRegistry.delete(layoutId);
                }
            } else if (layout && previousRectRef.current) {
                animateLayout(node, previousRectRef.current, transition);
            }

            previousRectRef.current = node.getBoundingClientRect();
        }, [layout, layoutId, animateKey, transition]);

        useLayoutEffect(() => {
            if (presence?.isPresent === false || !animate) {
                return;
            }

            const node = localRef.current;

            if (!node) {
                return;
            }

            const fromStyle = hasMountedRef.current ? captureCurrentMotionStyle(node, lastAnimatedStyleRef.current) : initial === false ? animate : (initial ?? animate);
            const shouldAnimate = hasMountedRef.current ? animateKey !== stringifyStyle(lastAnimatedStyleRef.current) : initial !== false;

            if (!shouldAnimate) {
                hasMountedRef.current = true;
                lastAnimatedStyleRef.current = animate;
                applyResolvedMotionStyle(node, animate);
                return;
            }

            const currentAnimation = animationRef.current;
            const wasInterrupted = Boolean(currentAnimation);

            if (currentAnimation) {
                currentAnimation.cancel();
                animationRef.current = null;
            }

            const duration = resolveDuration(transition);
            const delay = wasInterrupted ? 0 : toMs(transition?.delay, 0);
            const animation = node.animate(createAnimationFrames(fromStyle, animate, transition), {
                duration,
                delay,
                easing: resolveTimingFunction(transition),
                fill: "both",
            });

            animationRef.current = animation;
            node.style.willChange = "transform, opacity";
            hasMountedRef.current = true;
            lastAnimatedStyleRef.current = animate;

            animation.onfinish = () => {
                if (animationRef.current !== animation) {
                    return;
                }

                applyResolvedMotionStyle(node, animate);
                node.style.willChange = "";
                animationRef.current = null;
            };

            animation.oncancel = () => {
                if (animationRef.current === animation) {
                    animationRef.current = null;
                    node.style.willChange = "";
                }
            };
        }, [animate, animateKey, initial, presence?.isPresent, transition]);

        useEffect(() => {
            if (presence?.isPresent !== false) {
                return;
            }

            if (!exit) {
                presence.onExitComplete?.();
                return;
            }

            const node = localRef.current;

            if (!node) {
                presence.onExitComplete?.();
                return;
            }

            const fromStyle = captureCurrentMotionStyle(node, lastAnimatedStyleRef.current);
            const currentAnimation = animationRef.current;
            const wasInterrupted = Boolean(currentAnimation);

            if (currentAnimation) {
                currentAnimation.cancel();
                animationRef.current = null;
            }

            const duration = resolveDuration(transition);
            const delay = wasInterrupted ? 0 : toMs(transition?.delay, 0);
            const animation = node.animate(createAnimationFrames(fromStyle, exit, transition), {
                duration,
                delay,
                easing: resolveTimingFunction(transition),
                fill: "both",
            });
            animationRef.current = animation;
            node.style.willChange = "transform, opacity";

            animation.onfinish = () => {
                if (animationRef.current !== animation) {
                    return;
                }

                applyResolvedMotionStyle(node, exit);
                node.style.willChange = "";
                animationRef.current = null;
                presence.onExitComplete?.();
            };

            animation.oncancel = () => {
                if (animationRef.current === animation) {
                    animationRef.current = null;
                    node.style.willChange = "";
                }
            };
        }, [exit, presence, transition]);

        const resolvedAnimatedStyle = animate ? resolveMotionStyle(animate) : {};
        const mergedStyle = {
            ...style,
            ...resolvedAnimatedStyle,
        } satisfies CSSProperties;

        return (
            <Component
                ref={mergedRef}
                style={mergedStyle}
                {...rest}
            >
                {children}
            </Component>
        );
    });
}

type MotionFactory = {
    [K in keyof JSX.IntrinsicElements]: ReturnType<typeof createMotionComponent>;
};

export const motion = new Proxy(
    {},
    {
        get(_, property: string) {
            const cached = motionComponentCache.get(property);

            if (cached) {
                return cached;
            }

            const component = createMotionComponent(property);
            motionComponentCache.set(property, component);
            return component;
        },
    },
) as MotionFactory;

export type { MotionConfig, MotionProps, MotionStyle, MotionTransition };
