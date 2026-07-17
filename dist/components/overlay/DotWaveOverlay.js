import { jsx as _jsx } from "react/jsx-runtime";
import { useEffect, useRef } from "react";
const DEFAULT_ORIGIN = { x: 0.5, y: 0.5 };
const TAU = Math.PI * 2;
const DOT_REVEAL_DURATION = 360;
const BLINK_BLEND_DURATION = 720;
const DOT_EXIT_DURATION = 300;
function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
}
function easeOutCubic(value) {
    return 1 - Math.pow(1 - value, 3);
}
export function DotWaveOverlay({ active = true, dotSize = 2, gap = 18, minOpacity = 0.2, maxOpacity = 0.5, waveDuration = 1400, fadeOutDuration = 1200, color = "#94a3b8", origin = DEFAULT_ORIGIN, className = "", style, }) {
    const canvasRef = useRef(null);
    const controllerRef = useRef(null);
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) {
            return;
        }
        const context = canvas.getContext("2d");
        if (!context) {
            return;
        }
        const drawingContext = context;
        const safeDotSize = Math.max(0.5, dotSize);
        const safeGap = Math.max(safeDotSize + 1, gap);
        const safeMinOpacity = clamp(minOpacity, 0, 1);
        const safeMaxOpacity = clamp(Math.max(safeMinOpacity, maxOpacity), 0, 1);
        const safeWaveDuration = Math.max(0, waveDuration);
        const safeFadeOutDuration = Math.max(0, fadeOutDuration);
        const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        const dots = [];
        let width = 0;
        let height = 0;
        let frameId = null;
        let resizeFrameId = null;
        let isActive = active;
        let startedAt = performance.now();
        let stoppedAt = null;
        let maxExitEnd = 0;
        const buildDots = () => {
            dots.length = 0;
            maxExitEnd = 0;
            const originX = width * clamp(origin.x, 0, 1);
            const originY = height * clamp(origin.y, 0, 1);
            const maxDistance = Math.max(Math.hypot(originX, originY), Math.hypot(width - originX, originY), Math.hypot(originX, height - originY), Math.hypot(width - originX, height - originY), 1);
            const startX = (width % safeGap) / 2;
            const startY = (height % safeGap) / 2;
            for (let y = startY; y < height; y += safeGap) {
                for (let x = startX; x < width; x += safeGap) {
                    const distanceProgress = Math.hypot(x - originX, y - originY) / maxDistance;
                    const jitter = (Math.random() - 0.5) * safeWaveDuration * 0.12;
                    const exitAt = distanceProgress * Math.max(0, safeFadeOutDuration - DOT_EXIT_DURATION);
                    dots.push({
                        x,
                        y,
                        revealAt: Math.max(0, distanceProgress * safeWaveDuration + jitter),
                        exitAt,
                        initialOpacity: safeMinOpacity + Math.random() * (safeMaxOpacity - safeMinOpacity),
                        maxOpacity: safeMinOpacity + Math.random() * (safeMaxOpacity - safeMinOpacity),
                        phase: Math.random() * TAU,
                        speed: 0.0007 + Math.random() * 0.0011,
                    });
                    maxExitEnd = Math.max(maxExitEnd, exitAt + DOT_EXIT_DURATION);
                }
            }
        };
        const resize = () => {
            const rect = canvas.getBoundingClientRect();
            width = Math.max(0, rect.width);
            height = Math.max(0, rect.height);
            const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
            canvas.width = Math.round(width * pixelRatio);
            canvas.height = Math.round(height * pixelRatio);
            drawingContext.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
            buildDots();
        };
        function requestDraw() {
            if (frameId === null) {
                frameId = window.requestAnimationFrame(draw);
            }
        }
        function draw(now) {
            frameId = null;
            drawingContext.clearRect(0, 0, width, height);
            if (reducedMotion && !isActive) {
                return;
            }
            const elapsed = now - startedAt;
            const exitElapsed = stoppedAt === null ? null : now - stoppedAt;
            drawingContext.fillStyle = color;
            for (const dot of dots) {
                const timeSinceReveal = elapsed - dot.revealAt;
                if (!reducedMotion && timeSinceReveal < 0) {
                    continue;
                }
                const revealProgress = reducedMotion ? 1 : easeOutCubic(clamp(timeSinceReveal / DOT_REVEAL_DURATION, 0, 1));
                const blinkOpacity = ((Math.sin(elapsed * dot.speed + dot.phase) + 1) / 2) * dot.maxOpacity;
                const blinkBlend = reducedMotion ? 0 : clamp((timeSinceReveal - DOT_REVEAL_DURATION) / BLINK_BLEND_DURATION, 0, 1);
                const exitProgress = exitElapsed === null ? 0 : easeOutCubic(clamp((exitElapsed - dot.exitAt) / DOT_EXIT_DURATION, 0, 1));
                const opacity = (dot.initialOpacity * (1 - blinkBlend) + blinkOpacity * blinkBlend) * revealProgress * (1 - exitProgress);
                if (opacity <= 0.001) {
                    continue;
                }
                drawingContext.globalAlpha = opacity;
                drawingContext.fillRect(dot.x - safeDotSize / 2, dot.y - safeDotSize / 2, safeDotSize, safeDotSize);
            }
            drawingContext.globalAlpha = 1;
            if (reducedMotion) {
                return;
            }
            if (isActive || (exitElapsed !== null && exitElapsed < maxExitEnd)) {
                requestDraw();
            }
        }
        const scheduleResize = () => {
            if (resizeFrameId !== null) {
                window.cancelAnimationFrame(resizeFrameId);
            }
            resizeFrameId = window.requestAnimationFrame(() => {
                resize();
                resizeFrameId = null;
                const exiting = stoppedAt !== null && performance.now() - stoppedAt < maxExitEnd;
                if (isActive || exiting) {
                    requestDraw();
                }
            });
        };
        resize();
        if (isActive) {
            requestDraw();
        }
        const controller = {
            setActive(nextActive) {
                if (nextActive === isActive) {
                    return;
                }
                isActive = nextActive;
                if (nextActive) {
                    startedAt = performance.now();
                    stoppedAt = null;
                    buildDots();
                    requestDraw();
                    return;
                }
                stoppedAt = performance.now();
                if (reducedMotion) {
                    drawingContext.clearRect(0, 0, width, height);
                    return;
                }
                requestDraw();
            },
        };
        controllerRef.current = controller;
        const resizeObserver = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(scheduleResize);
        resizeObserver?.observe(canvas);
        window.addEventListener("resize", scheduleResize);
        return () => {
            if (frameId !== null) {
                window.cancelAnimationFrame(frameId);
            }
            if (resizeFrameId !== null) {
                window.cancelAnimationFrame(resizeFrameId);
            }
            resizeObserver?.disconnect();
            window.removeEventListener("resize", scheduleResize);
            if (controllerRef.current === controller) {
                controllerRef.current = null;
            }
        };
    }, [color, dotSize, fadeOutDuration, gap, maxOpacity, minOpacity, origin.x, origin.y, waveDuration]);
    useEffect(() => {
        controllerRef.current?.setActive(active);
    }, [active]);
    return (_jsx("canvas", { ref: canvasRef, "aria-hidden": "true", className: `pointer-events-none absolute inset-0 h-full w-full ${className}`, style: style }));
}
//# sourceMappingURL=DotWaveOverlay.js.map