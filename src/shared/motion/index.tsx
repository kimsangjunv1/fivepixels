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

type TransformParts = {
    x?: ParsedValue;
    y?: ParsedValue;
    scale?: number;
    rest: string[];
};

const PresenceContext = createContext<PresenceContextValue | null>(null);
const styleElementId = "stitchable-motion-runtime";
const layoutRegistry = new Map<string, DOMRect>();
const motionComponentCache = new Map<string, ReturnType<typeof createMotionComponent>>();
let animationSequence = 0;

function isBrowser() {
    return typeof window !== "undefined" && typeof document !== "undefined";
}

function toMs(value: number | undefined, fallback: number) {
    if (value == null) {
        return fallback;
    }

    return value <= 10 ? value * 1000 : value;
}

function ensureMotionStyleSheet() {
    if (!isBrowser()) {
        return null;
    }

    let style = document.getElementById(styleElementId) as HTMLStyleElement | null;

    if (!style) {
        style = document.createElement("style");
        style.id = styleElementId;
        document.head.appendChild(style);
    }

    return style.sheet as CSSStyleSheet;
}

function camelToKebab(value: string) {
    return value.replace(/[A-Z]/g, (match) => `-${match.toLowerCase()}`);
}

function serializeStyle(style: CSSProperties) {
    return Object.entries(style)
        .filter(([, value]) => value != null && value !== "")
        .map(([key, value]) => `${camelToKebab(key)}: ${String(value)};`)
        .join(" ");
}

function registerKeyframes(frames: CSSProperties[]) {
    const sheet = ensureMotionStyleSheet();

    if (!sheet) {
        return "";
    }

    const name = `stitchable-motion-${animationSequence++}`;
    const rule = `@keyframes ${name} {${frames
        .map((frame, index) => {
            const percent = frames.length === 1 ? 100 : (index / (frames.length - 1)) * 100;
            return `${percent}% { ${serializeStyle(frame)} }`;
        })
        .join(" ")}}`;

    sheet.insertRule(rule, sheet.cssRules.length);
    return name;
}

function parseNumericValue(value: MotionPrimitive | undefined) {
    if (value == null) {
        return undefined;
    }

    if (typeof value === "number") {
        return { value, unit: "px" };
    }

    const match = String(value).trim().match(/^(-?\d+(?:\.\d+)?)(px|%|rem|em|vw|vh)?$/);

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

function stringifyStyle(style?: MotionStyle) {
    return JSON.stringify(style ?? {});
}

function interpolateValue(from: ParsedValue | undefined, to: ParsedValue | undefined, progress: number) {
    if (!from && !to) {
        return undefined;
    }

    if (!from || !to || from.unit !== to.unit) {
        return progress >= 1 ? to : from;
    }

    return {
        value: from.value + (to.value - from.value) * progress,
        unit: to.unit,
    };
}

function createSpringFrame(from: MotionStyle, to: MotionStyle, translateFactor: number, scaleFactor: number) {
    const fromParts = parseTransformParts(from);
    const toParts = parseTransformParts(to);
    const frame: MotionStyle = {};

    for (const [key, value] of Object.entries(to)) {
        if (value != null && !["x", "y", "scale", "transform"].includes(key)) {
            frame[key as keyof MotionStyle] = value as never;
        }
    }

    const xDiff = (toParts.x?.value ?? 0) - (fromParts.x?.value ?? 0);
    const yDiff = (toParts.y?.value ?? 0) - (fromParts.y?.value ?? 0);
    const scaleDiff = (toParts.scale ?? 1) - (fromParts.scale ?? 1);

    const overshootX =
        toParts.x && fromParts.x && fromParts.x.unit === toParts.x.unit ? { value: toParts.x.value + xDiff * translateFactor, unit: toParts.x.unit } : toParts.x;
    const overshootY =
        toParts.y && fromParts.y && fromParts.y.unit === toParts.y.unit ? { value: toParts.y.value + yDiff * translateFactor, unit: toParts.y.unit } : toParts.y;
    const overshootScale = toParts.scale != null && fromParts.scale != null ? toParts.scale + scaleDiff * scaleFactor : toParts.scale;

    const nextParts: TransformParts = {
        x: overshootX,
        y: overshootY,
        scale: overshootScale,
        rest: toParts.rest,
    };
    const transform = composeTransform(nextParts);

    if (transform) {
        frame.transform = transform;
    }

    return frame;
}

function createAnimationFrames(from: MotionStyle, to: MotionStyle, transition?: MotionTransition) {
    const resolvedFrom = resolveMotionStyle(from);
    const resolvedTo = resolveMotionStyle(to);

    if (transition?.type !== "spring") {
        return [resolvedFrom, resolvedTo];
    }

    return [
        resolvedFrom,
        createSpringFrame(from, to, -0.08, -0.06),
        createSpringFrame(from, to, 0.02, 0.02),
        resolvedTo,
    ];
}

function resolveTimingFunction(transition?: MotionTransition) {
    if (transition?.type === "spring") {
        return "cubic-bezier(0.22, 1, 0.36, 1)";
    }

    return transition?.ease ?? "ease";
}

function resolveDuration(transition?: MotionTransition) {
    if (transition?.duration != null) {
        return toMs(transition.duration, 320);
    }

    if (transition?.type === "spring") {
        const stiffness = transition.stiffness ?? 100;
        const damping = transition.damping ?? 10;
        const mass = transition.mass ?? 1;
        const estimated = (mass * 1000) / Math.max(10, stiffness) + (damping / Math.max(10, stiffness)) * 600;
        return Math.min(900, Math.max(320, estimated));
    }

    return 320;
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
        }
    );
}

function PresenceChild({ children, isPresent, onExitComplete }: PresenceContextValue & { children: ReactElement }) {
    const value = useMemo(() => ({ isPresent, onExitComplete }), [isPresent, onExitComplete]);

    return <PresenceContext.Provider value={value}>{children}</PresenceContext.Provider>;
}

export function AnimatedPresence({ children }: { children: ReactNode }) {
    const validChildren = Children.toArray(children).filter(isValidElement) as ReactElement[];
    const [trackedChildren, setTrackedChildren] = useState<PresenceTrackedChild[]>(() =>
        validChildren.map((element) => ({ element, isPresent: true }))
    );

    useEffect(() => {
        setTrackedChildren((current) => {
            const nextKeys = new Set(validChildren.map((child) => child.key));
            const nextChildren = validChildren.map((element) => ({ element, isPresent: true }));
            const exitingChildren = current
                .filter((child) => child.element.key != null && !nextKeys.has(child.element.key))
                .map((child) => ({ ...child, isPresent: false }));

            return [...nextChildren, ...exitingChildren];
        });
    }, [validChildren]);

    return trackedChildren.map((child) => (
        <PresenceChild
            key={child.element.key}
            isPresent={child.isPresent}
            onExitComplete={() => {
                setTrackedChildren((current) => current.filter((item) => item.element.key !== child.element.key));
            }}
        >
            {cloneElement(child.element)}
        </PresenceChild>
    ));
}

function createMotionComponent(tagName: string) {
    return forwardRef<HTMLElement, MotionProps<ElementType>>(function MotionComponent(
        { animate, as, children, exit, initial, layout, layoutId, style, transition, ...rest },
        forwardedRef
    ) {
        const Component = (as ?? tagName) as ElementType;
        const presence = useContext(PresenceContext);
        const localRef = useRef<HTMLElement | null>(null);
        const lastAnimatedStyleRef = useRef<MotionStyle>(animate ?? {});
        const previousRectRef = useRef<DOMRect | null>(null);
        const timeoutRef = useRef<number | null>(null);
        const hasMountedRef = useRef(false);
        const [animationStyle, setAnimationStyle] = useState<CSSProperties>({});
        const mergedRef = useMergedRef(forwardedRef, localRef);
        const animateKey = stringifyStyle(animate);
        const initialKey = initial === false ? "false" : stringifyStyle(initial);
        const exitKey = stringifyStyle(exit);

        useEffect(
            () => () => {
                if (timeoutRef.current != null) {
                    window.clearTimeout(timeoutRef.current);
                }

                if (layoutId && localRef.current) {
                    layoutRegistry.set(layoutId, localRef.current.getBoundingClientRect());
                }
            },
            [layoutId]
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

            const fromStyle = hasMountedRef.current ? lastAnimatedStyleRef.current : initial === false ? animate : initial ?? animate;
            const shouldAnimate = hasMountedRef.current ? animateKey !== stringifyStyle(lastAnimatedStyleRef.current) : initial !== false;

            hasMountedRef.current = true;
            lastAnimatedStyleRef.current = animate;

            if (!shouldAnimate) {
                return;
            }

            const frames = createAnimationFrames(fromStyle, animate, transition);
            const animationName = registerKeyframes(frames);
            const duration = resolveDuration(transition);
            const delay = toMs(transition?.delay, 0);

            setAnimationStyle({
                animationName,
                animationDuration: `${duration}ms`,
                animationDelay: `${delay}ms`,
                animationTimingFunction: resolveTimingFunction(transition),
                animationFillMode: "both",
            });

            if (timeoutRef.current != null) {
                window.clearTimeout(timeoutRef.current);
            }

            timeoutRef.current = window.setTimeout(() => {
                setAnimationStyle({});
            }, duration + delay + 34);
        }, [animate, animateKey, initial, initialKey, presence?.isPresent, transition]);

        useEffect(() => {
            if (presence?.isPresent !== false) {
                return;
            }

            if (!exit) {
                presence.onExitComplete?.();
                return;
            }

            const frames = createAnimationFrames(lastAnimatedStyleRef.current, exit, transition);
            const animationName = registerKeyframes(frames);
            const duration = resolveDuration(transition);
            const delay = toMs(transition?.delay, 0);

            setAnimationStyle({
                animationName,
                animationDuration: `${duration}ms`,
                animationDelay: `${delay}ms`,
                animationTimingFunction: resolveTimingFunction(transition),
                animationFillMode: "both",
            });

            if (timeoutRef.current != null) {
                window.clearTimeout(timeoutRef.current);
            }

            timeoutRef.current = window.setTimeout(() => {
                setAnimationStyle({});
                presence.onExitComplete?.();
            }, duration + delay + 34);
        }, [exit, exitKey, presence, transition]);

        const resolvedAnimatedStyle = animate ? resolveMotionStyle(animate) : {};
        const mergedStyle = {
            ...style,
            ...resolvedAnimatedStyle,
            ...animationStyle,
            willChange: animationStyle.animationName ? "transform, opacity" : style?.willChange,
        } satisfies CSSProperties;

        return (
            <Component ref={mergedRef} style={mergedStyle} {...rest}>
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
    }
) as MotionFactory;

export type { MotionConfig, MotionProps, MotionStyle, MotionTransition };
