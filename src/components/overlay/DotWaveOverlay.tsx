import { useEffect, useRef, type CSSProperties } from "react";

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

type Dot = {
    x: number;
    y: number;
    revealAt: number;
    exitAt: number;
    initialOpacity: number;
    maxOpacity: number;
    phase: number;
    speed: number;
};

const DEFAULT_ORIGIN: DotWaveOrigin = { x: 0.5, y: 0.5 };
const TAU = Math.PI * 2;
const DOT_REVEAL_DURATION = 360;
const BLINK_BLEND_DURATION = 720;
const DOT_EXIT_DURATION = 300;

type DotWaveController = {
    setActive: (active: boolean, delay: number) => void;
    setColor: (color: string) => void;
};

function clamp(value: number, min: number, max: number) {
    return Math.min(max, Math.max(min, value));
}

function easeOutCubic(value: number) {
    return 1 - Math.pow(1 - value, 3);
}

export function DotWaveOverlay({
    active = true,
    dotSize = 2,
    gap = 20,
    minOpacity = 0.2,
    maxOpacity = 0.8,
    waveDuration = 1_400,
    fadeOutDuration = 2_200,
    deactivateDelay = 0,
    color = "#94a3b8",
    origin = DEFAULT_ORIGIN,
    className = "",
    style,
}: DotWaveOverlayProps) {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const controllerRef = useRef<DotWaveController | null>(null);
    const activeRef = useRef(active);
    const colorRef = useRef(color);
    activeRef.current = active;
    colorRef.current = color;

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
        const dots: Dot[] = [];
        let width = 0;
        let height = 0;
        let frameId: number | null = null;
        let resizeFrameId: number | null = null;
        let isActive = activeRef.current;
        let currentColor = colorRef.current;
        let startedAt = performance.now();
        let stoppedAt: number | null = null;
        let maxExitEnd = 0;
        let deactivateTimeout: number | null = null;

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

        function draw(now: number) {
            frameId = null;
            drawingContext.clearRect(0, 0, width, height);

            if (reducedMotion && !isActive) {
                return;
            }

            const elapsed = now - startedAt;
            const exitElapsed = stoppedAt === null ? null : now - stoppedAt;

            drawingContext.fillStyle = currentColor;

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

        const controller: DotWaveController = {
            setActive(nextActive, delay) {
                if (deactivateTimeout !== null) {
                    window.clearTimeout(deactivateTimeout);
                    deactivateTimeout = null;
                }

                if (nextActive) {
                    if (isActive) {
                        requestDraw();
                        return;
                    }

                    isActive = true;
                    startedAt = performance.now();
                    stoppedAt = null;
                    buildDots();
                    requestDraw();
                    return;
                }

                if (!isActive) {
                    return;
                }

                const deactivate = () => {
                    deactivateTimeout = null;
                    isActive = false;
                    stoppedAt = performance.now();

                    if (reducedMotion) {
                        drawingContext.clearRect(0, 0, width, height);
                        return;
                    }

                    requestDraw();
                };

                const safeDelay = reducedMotion ? 0 : Math.max(0, delay);
                if (safeDelay > 0) {
                    deactivateTimeout = window.setTimeout(deactivate, safeDelay);
                    requestDraw();
                    return;
                }

                deactivate();
            },
            setColor(nextColor) {
                if (!isActive && stoppedAt !== null) {
                    return;
                }

                currentColor = nextColor;
                if (isActive) {
                    requestDraw();
                }
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
            if (deactivateTimeout !== null) {
                window.clearTimeout(deactivateTimeout);
            }

            resizeObserver?.disconnect();
            window.removeEventListener("resize", scheduleResize);

            if (controllerRef.current === controller) {
                controllerRef.current = null;
            }
        };
    }, [dotSize, fadeOutDuration, gap, maxOpacity, minOpacity, origin.x, origin.y, waveDuration]);

    useEffect(() => {
        const controller = controllerRef.current;
        if (!controller) {
            return;
        }

        if (active) {
            controller.setActive(true, deactivateDelay);
            controller.setColor(color);
            return;
        }

        controller.setColor(color);
        controller.setActive(false, deactivateDelay);
    }, [active, color, deactivateDelay]);

    return (
        <canvas
            ref={canvasRef}
            aria-hidden="true"
            className={`pointer-events-none absolute inset-0 h-full w-full ${className}`}
            style={style}
        />
    );
}
