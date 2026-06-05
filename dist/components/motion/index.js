import { jsx as _jsx } from "react/jsx-runtime";
import { Children, cloneElement, createContext, forwardRef, isValidElement, useContext, useEffect, useLayoutEffect, useMemo, useRef, useState, } from "react";
const PresenceContext = createContext(null);
const LayoutAnimationContext = createContext({ counterScale: null });
const layoutRegistry = new Map();
const motionComponentCache = new Map();
function cloneRect(rect) {
    return new DOMRect(rect.x, rect.y, rect.width, rect.height);
}
function rectsDiffer(a, b, threshold = 0.5) {
    return (Math.abs(a.left - b.left) >= threshold ||
        Math.abs(a.top - b.top) >= threshold ||
        Math.abs(a.width - b.width) >= threshold ||
        Math.abs(a.height - b.height) >= threshold);
}
function normalizeLayoutMode(layout) {
    if (!layout) {
        return false;
    }
    if (layout === true) {
        return "both";
    }
    return layout;
}
function rectsDifferForLayout(a, b, mode, threshold = 0.5) {
    if (mode === "position") {
        return Math.abs(a.left - b.left) >= threshold || Math.abs(a.top - b.top) >= threshold;
    }
    if (mode === "size") {
        return Math.abs(a.width - b.width) >= threshold || Math.abs(a.height - b.height) >= threshold;
    }
    return rectsDiffer(a, b, threshold);
}
function layoutUsesScale(mode) {
    return mode !== "position";
}
function readLayoutRectFromStyle(style) {
    if (!style) {
        return null;
    }
    const left = Number.parseFloat(String(style.left ?? ""));
    const top = Number.parseFloat(String(style.top ?? ""));
    const width = Number.parseFloat(String(style.width ?? ""));
    const height = Number.parseFloat(String(style.height ?? ""));
    if (![left, top, width, height].every(Number.isFinite)) {
        return null;
    }
    return new DOMRect(left, top, width, height);
}
function readTargetLayoutRect(node) {
    const left = Number.parseFloat(node.style.left);
    const top = Number.parseFloat(node.style.top);
    const width = Number.parseFloat(node.style.width);
    const height = Number.parseFloat(node.style.height);
    if ([left, top, width, height].every(Number.isFinite)) {
        return new DOMRect(left, top, width, height);
    }
    return cloneRect(node.getBoundingClientRect());
}
function applyLayoutRectStyle(node, rect) {
    node.style.left = `${rect.left}px`;
    node.style.top = `${rect.top}px`;
    node.style.width = `${rect.width}px`;
    node.style.height = `${rect.height}px`;
}
function rectToPositionStyle(rect) {
    return {
        left: rect.left,
        top: rect.top,
        width: rect.width,
        height: rect.height,
    };
}
function readVisualLayoutRect(node) {
    return cloneRect(node.getBoundingClientRect());
}
function layoutTransformFromRects(fromRect, toRect, mode) {
    let deltaX = fromRect.left - toRect.left;
    let deltaY = fromRect.top - toRect.top;
    let scaleX = fromRect.width / Math.max(toRect.width, 1);
    let scaleY = fromRect.height / Math.max(toRect.height, 1);
    if (mode === "position") {
        scaleX = 1;
        scaleY = 1;
    }
    else if (mode === "size") {
        deltaX = 0;
        deltaY = 0;
    }
    else if (mode === "preserve-aspect") {
        const fromAspect = fromRect.width / Math.max(fromRect.height, 1);
        const toAspect = toRect.width / Math.max(toRect.height, 1);
        if (Math.abs(fromAspect - toAspect) >= 0.01) {
            scaleX = 1;
            scaleY = 1;
        }
        else {
            const uniformScale = (scaleX + scaleY) / 2;
            scaleX = uniformScale;
            scaleY = uniformScale;
        }
    }
    return { deltaX, deltaY, scaleX, scaleY };
}
function composeLayoutTransform(deltaX, deltaY, scaleX, scaleY) {
    if (scaleX === 1 && scaleY === 1) {
        return `translate(${deltaX}px, ${deltaY}px)`;
    }
    if (deltaX === 0 && deltaY === 0) {
        return `scale(${scaleX}, ${scaleY})`;
    }
    return `translate(${deltaX}px, ${deltaY}px) scale(${scaleX}, ${scaleY})`;
}
function layoutTransformEndState(mode) {
    if (mode === "size") {
        return "scale(1, 1)";
    }
    if (mode === "position") {
        return "translate(0px, 0px)";
    }
    return "translate(0px, 0px) scale(1, 1)";
}
function layoutTransformIsNoOp(deltaX, deltaY, scaleX, scaleY, mode) {
    const positionChanged = Math.abs(deltaX) >= 0.5 || Math.abs(deltaY) >= 0.5;
    const sizeChanged = Math.abs(scaleX - 1) >= 0.01 || Math.abs(scaleY - 1) >= 0.01;
    if (mode === "position") {
        return !positionChanged;
    }
    if (mode === "size") {
        return !sizeChanged;
    }
    return !positionChanged && !sizeChanged;
}
function applyLayoutTransform(node, fromRect, toRect, mode) {
    const { deltaX, deltaY, scaleX, scaleY } = layoutTransformFromRects(fromRect, toRect, mode);
    node.style.transformOrigin = "top left";
    node.style.transform = composeLayoutTransform(deltaX, deltaY, scaleX, scaleY);
}
function clearLayoutTransform(node) {
    node.style.transformOrigin = "";
    if (node.style.transform) {
        node.style.transform = "";
    }
}
function pushLayoutSnapshot(layoutId, rect) {
    const stack = layoutRegistry.get(layoutId) ?? [];
    stack.push(cloneRect(rect));
    layoutRegistry.set(layoutId, stack);
}
function popLayoutSnapshot(layoutId) {
    const stack = layoutRegistry.get(layoutId);
    if (!stack?.length) {
        return undefined;
    }
    const rect = stack.pop();
    if (!stack.length) {
        layoutRegistry.delete(layoutId);
    }
    else {
        layoutRegistry.set(layoutId, stack);
    }
    return rect;
}
function trackedListsEqual(current, next) {
    return current.length === next.length && current.every((child, index) => child === next[index]);
}
function getPresentKeySignature(children) {
    return children.map((child) => String(child.key ?? "")).join("\0");
}
function isBrowser() {
    return typeof window !== "undefined" && typeof document !== "undefined";
}
function toMs(value, fallback) {
    if (value == null) {
        return fallback;
    }
    return value <= 10 ? value * 1000 : value;
}
function parseNumericValue(value) {
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
function parseScaleValue(value) {
    if (value == null) {
        return undefined;
    }
    if (typeof value === "number") {
        return value;
    }
    const parsed = Number(value);
    return Number.isNaN(parsed) ? undefined : parsed;
}
function parseTransformParts(style) {
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
function composeTransform(parts) {
    const transforms = [];
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
function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
}
function resolveMotionStyle(style) {
    if (!style) {
        return {};
    }
    const nextStyle = {};
    for (const [key, value] of Object.entries(style)) {
        if (value == null || key === "x" || key === "y" || key === "scale" || key === "transform") {
            continue;
        }
        nextStyle[key] = value;
    }
    const transform = composeTransform(parseTransformParts(style));
    if (transform) {
        nextStyle.transform = transform;
    }
    return nextStyle;
}
function getSpringMetrics(transition) {
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
function getSpringSettlingDuration(metrics) {
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
function getSpringProgress(time, metrics) {
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
function interpolateParsedValue(from, to, progress) {
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
function interpolateNumber(from, to, progress) {
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
function createTweenKeyframes(from, to) {
    return [resolveMotionStyle(from), resolveMotionStyle(to)];
}
function createSpringKeyframes(from, to, transition) {
    const metrics = getSpringMetrics(transition);
    const fromStyle = resolveMotionStyle(from);
    const toStyle = resolveMotionStyle(to);
    const fromParts = parseTransformParts(from);
    const toParts = parseTransformParts(to);
    const duration = resolveDuration(transition) / 1000;
    const frameCount = clamp(Math.round(duration * 60), 12, 180);
    const keyframes = [];
    for (let index = 0; index < frameCount; index += 1) {
        const offset = frameCount === 1 ? 1 : index / (frameCount - 1);
        const progress = getSpringProgress(duration * offset, metrics);
        const clampedProgress = clamp(progress, 0, 1);
        const keyframe = {
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
function createAnimationFrames(from, to, transition) {
    if (transition?.type !== "spring") {
        return createTweenKeyframes(from, to);
    }
    return createSpringKeyframes(from, to, transition);
}
function resolveTimingFunction(transition) {
    if (transition?.type === "spring") {
        return "linear";
    }
    return transition?.ease ?? "ease";
}
function resolveDuration(transition) {
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
function stringifyStyle(style) {
    return JSON.stringify(resolveMotionStyle(style));
}
function applyResolvedMotionStyle(node, style) {
    const resolvedStyle = resolveMotionStyle(style);
    if ("opacity" in resolvedStyle) {
        node.style.opacity = String(resolvedStyle.opacity);
    }
    if ("transform" in resolvedStyle) {
        node.style.transform = String(resolvedStyle.transform);
    }
}
function captureCurrentMotionStyle(node, fallback) {
    const computedStyle = window.getComputedStyle(node);
    const nextStyle = { ...(fallback ?? {}) };
    const opacity = Number.parseFloat(computedStyle.opacity);
    if (!Number.isNaN(opacity)) {
        nextStyle.opacity = opacity;
    }
    if (computedStyle.transform && computedStyle.transform !== "none") {
        nextStyle.transform = computedStyle.transform;
    }
    else if (fallback?.transform) {
        nextStyle.transform = fallback.transform;
    }
    else {
        delete nextStyle.transform;
    }
    return nextStyle;
}
function useMergedRef(forwardedRef, localRef) {
    return (value) => {
        localRef.current = value;
        if (typeof forwardedRef === "function") {
            forwardedRef(value);
            return;
        }
        if (forwardedRef && "current" in forwardedRef) {
            forwardedRef.current = value;
        }
    };
}
function animateLayout(node, fromRect, transition, layoutAnimationRef, layoutMode, onScaleChange, onComplete) {
    if (typeof node.animate !== "function") {
        return null;
    }
    const toRect = readTargetLayoutRect(node);
    const { deltaX, deltaY, scaleX, scaleY } = layoutTransformFromRects(fromRect, toRect, layoutMode);
    if (layoutTransformIsNoOp(deltaX, deltaY, scaleX, scaleY, layoutMode)) {
        clearLayoutTransform(node);
        onScaleChange?.(null);
        onComplete?.(toRect);
        return null;
    }
    if (layoutAnimationRef.current) {
        layoutAnimationRef.current.cancel();
        layoutAnimationRef.current = null;
    }
    applyLayoutTransform(node, fromRect, toRect, layoutMode);
    const startTransform = node.style.transform;
    const endTransform = layoutTransformEndState(layoutMode);
    const animation = node.animate([
        {
            transformOrigin: "top left",
            transform: startTransform,
        },
        {
            transformOrigin: "top left",
            transform: endTransform,
        },
    ], {
        duration: resolveDuration(transition),
        easing: resolveTimingFunction(transition),
        fill: "both",
    });
    layoutAnimationRef.current = animation;
    let scaleFrameId = 0;
    const shouldTrackScale = layoutUsesScale(layoutMode) && onScaleChange;
    if (shouldTrackScale) {
        onScaleChange({ scaleX, scaleY });
        const trackScale = () => {
            if (layoutAnimationRef.current !== animation) {
                return;
            }
            const playState = animation.playState;
            if (playState === "finished" || playState === "idle") {
                onScaleChange(null);
                return;
            }
            const timing = animation.effect?.getComputedTiming();
            const progress = typeof timing?.progress === "number" ? timing.progress : 0;
            onScaleChange({
                scaleX: scaleX + (1 - scaleX) * progress,
                scaleY: scaleY + (1 - scaleY) * progress,
            });
            scaleFrameId = requestAnimationFrame(trackScale);
        };
        scaleFrameId = requestAnimationFrame(trackScale);
    }
    animation.onfinish = () => {
        if (layoutAnimationRef.current !== animation) {
            return;
        }
        if (scaleFrameId) {
            cancelAnimationFrame(scaleFrameId);
        }
        clearLayoutTransform(node);
        layoutAnimationRef.current = null;
        onScaleChange?.(null);
        onComplete?.(toRect);
    };
    animation.oncancel = () => {
        if (layoutAnimationRef.current === animation) {
            if (scaleFrameId) {
                cancelAnimationFrame(scaleFrameId);
            }
            layoutAnimationRef.current = null;
            onScaleChange?.(null);
        }
    };
    return animation;
}
function PresenceChild({ children, isPresent, onExitComplete }) {
    const value = useMemo(() => ({ isPresent, onExitComplete }), [isPresent, onExitComplete]);
    return _jsx(PresenceContext.Provider, { value: value, children: children });
}
export function AnimatedPresence({ children }) {
    const validChildren = Children.toArray(children).filter(isValidElement);
    const presentKeySignature = getPresentKeySignature(validChildren);
    const [exitingChildren, setExitingChildren] = useState([]);
    const previousPresentRef = useRef(new Map());
    useLayoutEffect(() => {
        const presentKeys = new Set(validChildren.flatMap((child) => (child.key != null ? [child.key] : [])));
        const previousPresent = previousPresentRef.current;
        setExitingChildren((current) => {
            let next = current;
            for (const [key, element] of previousPresent) {
                if (!presentKeys.has(key) && !next.some((child) => child.element.key === key)) {
                    if (next === current) {
                        next = [...current];
                    }
                    next.push({ element, isPresent: false });
                }
            }
            const filtered = next.filter((child) => !(child.isPresent === false && child.element.key != null && presentKeys.has(child.element.key)));
            return trackedListsEqual(filtered, current) ? current : filtered;
        });
        previousPresentRef.current = new Map(validChildren.flatMap((child) => (child.key != null ? [[child.key, child]] : [])));
    }, [presentKeySignature]);
    const presentKeys = new Set(validChildren.flatMap((child) => (child.key != null ? [child.key] : [])));
    const trackedChildren = [
        ...exitingChildren.filter((child) => child.element.key != null && !presentKeys.has(child.element.key)),
        ...validChildren.map((element) => ({ element, isPresent: true })),
    ];
    return trackedChildren.map((child) => (_jsx(PresenceChild, { isPresent: child.isPresent, onExitComplete: () => {
            setExitingChildren((current) => {
                const nextTrackedChildren = current.filter((item) => item.element.key !== child.element.key);
                return nextTrackedChildren.length === current.length ? current : nextTrackedChildren;
            });
        }, children: cloneElement(child.element) }, child.element.key)));
}
function createMotionComponent(tagName) {
    return forwardRef(function MotionComponent({ animate, as, children, exit, initial, layout, layoutId, layoutRoot, layoutTransition, style, transition, ...rest }, forwardedRef) {
        const Component = (as ?? tagName);
        const presence = useContext(PresenceContext);
        const parentLayoutContext = useContext(LayoutAnimationContext);
        const localRef = useRef(null);
        const lastAnimatedStyleRef = useRef(animate ?? {});
        const previousRectRef = useRef(null);
        const committedLayoutRectRef = useRef(null);
        const animationRef = useRef(null);
        const layoutAnimationRef = useRef(null);
        const hasMountedRef = useRef(false);
        const wasPresentForLayoutRef = useRef(true);
        const useExplicitLayoutRef = useRef(false);
        const [isLayoutAnimating, setIsLayoutAnimating] = useState(false);
        const [layoutMeasureGeneration, setLayoutMeasureGeneration] = useState(0);
        const [childCounterScale, setChildCounterScale] = useState(null);
        const mergedRef = useMergedRef(forwardedRef, localRef);
        const animateKey = stringifyStyle(animate);
        const layoutMode = normalizeLayoutMode(layout);
        const effectiveLayoutMode = layoutMode || "both";
        const layoutEnabled = Boolean(layoutMode || layoutId);
        const resolvedLayoutTransition = layoutTransition ?? transition;
        const incomingLayoutRect = readLayoutRectFromStyle(style);
        const layoutStyleKey = incomingLayoutRect
            ? `${incomingLayoutRect.left}|${incomingLayoutRect.top}|${incomingLayoutRect.width}|${incomingLayoutRect.height}`
            : "";
        const parentCounterScale = layoutRoot ? null : parentLayoutContext.counterScale;
        const layoutAnimationContextValue = useMemo(() => ({ counterScale: childCounterScale }), [childCounterScale]);
        const finishLayout = (targetRect) => {
            previousRectRef.current = cloneRect(targetRect);
            committedLayoutRectRef.current = cloneRect(targetRect);
            setIsLayoutAnimating(false);
            setChildCounterScale(null);
        };
        const handleLayoutScaleChange = (scale) => {
            if (!layoutUsesScale(effectiveLayoutMode)) {
                setChildCounterScale(null);
                return;
            }
            setChildCounterScale(scale);
        };
        const startLayoutAnimation = (node, fromRect, targetRect) => {
            useExplicitLayoutRef.current = true;
            applyLayoutRectStyle(node, targetRect);
            committedLayoutRectRef.current = cloneRect(targetRect);
            setIsLayoutAnimating(true);
            const animation = animateLayout(node, fromRect, resolvedLayoutTransition, layoutAnimationRef, effectiveLayoutMode, handleLayoutScaleChange, finishLayout);
            if (!animation) {
                finishLayout(targetRect);
            }
        };
        const startImplicitLayoutAnimation = (node, fromRect, targetRect) => {
            useExplicitLayoutRef.current = false;
            committedLayoutRectRef.current = cloneRect(targetRect);
            setIsLayoutAnimating(true);
            const animation = animateLayout(node, fromRect, resolvedLayoutTransition, layoutAnimationRef, effectiveLayoutMode, handleLayoutScaleChange, finishLayout);
            if (!animation) {
                finishLayout(targetRect);
            }
        };
        useLayoutEffect(() => {
            return () => {
                if (layoutId && localRef.current) {
                    pushLayoutSnapshot(layoutId, localRef.current.getBoundingClientRect());
                }
            };
        }, [layoutId]);
        useEffect(() => () => {
            if (animationRef.current) {
                animationRef.current.cancel();
                animationRef.current = null;
            }
            if (layoutAnimationRef.current) {
                layoutAnimationRef.current.cancel();
                layoutAnimationRef.current = null;
            }
        }, []);
        useEffect(() => {
            if (!layoutMode || !isBrowser()) {
                return;
            }
            const node = localRef.current;
            if (!node || typeof ResizeObserver === "undefined") {
                return;
            }
            const observer = new ResizeObserver(() => {
                if (layoutAnimationRef.current) {
                    return;
                }
                setLayoutMeasureGeneration((current) => current + 1);
            });
            observer.observe(node);
            return () => {
                observer.disconnect();
            };
        }, [layoutId, layoutMode]);
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
        useLayoutEffect(() => {
            void layoutMeasureGeneration;
            if (!layoutEnabled) {
                return;
            }
            const node = localRef.current;
            if (!node) {
                return;
            }
            const isExiting = presence?.isPresent === false;
            if (layoutId && isExiting && wasPresentForLayoutRef.current) {
                pushLayoutSnapshot(layoutId, node.getBoundingClientRect());
                wasPresentForLayoutRef.current = false;
            }
            if (!isExiting) {
                wasPresentForLayoutRef.current = true;
            }
            if (isExiting) {
                return;
            }
            if (!incomingLayoutRect) {
                if (!layoutMode) {
                    return;
                }
                const targetRect = readVisualLayoutRect(node);
                let fromRect = null;
                if (layoutId) {
                    fromRect = popLayoutSnapshot(layoutId) ?? null;
                }
                if (!committedLayoutRectRef.current) {
                    if (fromRect) {
                        startImplicitLayoutAnimation(node, fromRect, targetRect);
                        return;
                    }
                    finishLayout(targetRect);
                    return;
                }
                if (layoutAnimationRef.current && committedLayoutRectRef.current && !rectsDifferForLayout(committedLayoutRectRef.current, targetRect, effectiveLayoutMode)) {
                    return;
                }
                if (layoutAnimationRef.current) {
                    const visualRect = readVisualLayoutRect(node);
                    layoutAnimationRef.current.cancel();
                    layoutAnimationRef.current = null;
                    if (!rectsDifferForLayout(visualRect, targetRect, effectiveLayoutMode)) {
                        clearLayoutTransform(node);
                        finishLayout(targetRect);
                        return;
                    }
                    startImplicitLayoutAnimation(node, visualRect, targetRect);
                    return;
                }
                if (previousRectRef.current && !rectsDifferForLayout(previousRectRef.current, targetRect, effectiveLayoutMode)) {
                    finishLayout(targetRect);
                    return;
                }
                if (previousRectRef.current && rectsDifferForLayout(previousRectRef.current, targetRect, effectiveLayoutMode)) {
                    startImplicitLayoutAnimation(node, previousRectRef.current, targetRect);
                    return;
                }
                finishLayout(targetRect);
                return;
            }
            const targetRect = incomingLayoutRect;
            let fromRect = null;
            if (layoutId) {
                fromRect = popLayoutSnapshot(layoutId) ?? null;
            }
            if (!committedLayoutRectRef.current) {
                if (fromRect) {
                    startLayoutAnimation(node, fromRect, targetRect);
                    return;
                }
                applyLayoutRectStyle(node, targetRect);
                finishLayout(targetRect);
                return;
            }
            if (layoutAnimationRef.current && committedLayoutRectRef.current && !rectsDifferForLayout(committedLayoutRectRef.current, targetRect, effectiveLayoutMode)) {
                return;
            }
            if (layoutAnimationRef.current) {
                const visualRect = readVisualLayoutRect(node);
                layoutAnimationRef.current.cancel();
                layoutAnimationRef.current = null;
                if (!rectsDifferForLayout(visualRect, targetRect, effectiveLayoutMode)) {
                    applyLayoutRectStyle(node, targetRect);
                    clearLayoutTransform(node);
                    finishLayout(targetRect);
                    return;
                }
                startLayoutAnimation(node, visualRect, targetRect);
                return;
            }
            if (previousRectRef.current && !rectsDifferForLayout(previousRectRef.current, targetRect, effectiveLayoutMode)) {
                applyLayoutRectStyle(node, targetRect);
                finishLayout(targetRect);
                return;
            }
            if (!fromRect && layoutMode && previousRectRef.current && rectsDifferForLayout(previousRectRef.current, targetRect, effectiveLayoutMode)) {
                fromRect = previousRectRef.current;
            }
            if (!fromRect) {
                applyLayoutRectStyle(node, targetRect);
                finishLayout(targetRect);
                return;
            }
            startLayoutAnimation(node, fromRect, targetRect);
        }, [effectiveLayoutMode, layoutEnabled, layoutId, layoutMeasureGeneration, layoutMode, layoutStyleKey, presence?.isPresent, resolvedLayoutTransition, style]);
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
        const { transform: animatedTransform, ...restAnimatedStyle } = resolvedAnimatedStyle;
        const layoutPositionStyle = isLayoutAnimating && useExplicitLayoutRef.current && committedLayoutRectRef.current
            ? rectToPositionStyle(committedLayoutRectRef.current)
            : null;
        const mergedTransforms = [];
        if (layoutMode && parentCounterScale) {
            mergedTransforms.push(`scale(${1 / parentCounterScale.scaleX}, ${1 / parentCounterScale.scaleY})`);
        }
        if (animatedTransform) {
            mergedTransforms.push(String(animatedTransform));
        }
        const mergedStyle = {
            ...style,
            ...restAnimatedStyle,
            ...(layoutPositionStyle ?? {}),
            ...(mergedTransforms.length ? { transform: mergedTransforms.join(" ") } : {}),
        };
        const element = (_jsx(Component, { ref: mergedRef, style: mergedStyle, ...rest, children: children }));
        if (layoutRoot || childCounterScale) {
            return _jsx(LayoutAnimationContext.Provider, { value: layoutAnimationContextValue, children: element });
        }
        return element;
    });
}
export const motion = new Proxy({}, {
    get(_, property) {
        const cached = motionComponentCache.get(property);
        if (cached) {
            return cached;
        }
        const component = createMotionComponent(property);
        motionComponentCache.set(property, component);
        return component;
    },
});
//# sourceMappingURL=index.js.map