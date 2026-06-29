import { useCallback, useEffect, useLayoutEffect, useRef, useState, type PointerEvent as ReactPointerEvent, type RefObject } from "react";

export type ResizeCorner = "top-left" | "top-right" | "bottom-left" | "bottom-right";

export type BoxSize = {
    width: number;
    height: number;
};

type ResizeSession = {
    pointerId: number;
    startX: number;
    startY: number;
    startWidth: number;
    startHeight: number;
    visualLeft: number;
    visualTop: number;
    handleCorner: ResizeCorner;
};

const RESIZE_LISTENER_OPTIONS = { capture: true } as const;

function applyGhostRect(node: HTMLDivElement, rect: BoxSize & { left: number; top: number }) {
    node.style.left = `${rect.left}px`;
    node.style.top = `${rect.top}px`;
    node.style.width = `${rect.width}px`;
    node.style.height = `${rect.height}px`;
}

export function resolveGhostCornerRect(
    session: Pick<ResizeSession, "handleCorner" | "visualLeft" | "visualTop" | "startWidth" | "startHeight" | "startX" | "startY">,
    clientX: number,
    clientY: number,
    clampSize: (width: number, height: number) => BoxSize,
) {
    const deltaX = clientX - session.startX;
    const deltaY = clientY - session.startY;
    let width = session.startWidth;
    let height = session.startHeight;

    switch (session.handleCorner) {
        case "bottom-right":
            width = session.startWidth + deltaX;
            height = session.startHeight + deltaY;
            break;
        case "bottom-left":
            width = session.startWidth - deltaX;
            height = session.startHeight + deltaY;
            break;
        case "top-right":
            width = session.startWidth + deltaX;
            height = session.startHeight - deltaY;
            break;
        case "top-left":
            width = session.startWidth - deltaX;
            height = session.startHeight - deltaY;
            break;
    }

    const clamped = clampSize(width, height);
    const visualRight = session.visualLeft + session.startWidth;
    const visualBottom = session.visualTop + session.startHeight;
    let left = session.visualLeft;
    let top = session.visualTop;

    switch (session.handleCorner) {
        case "bottom-right":
            break;
        case "bottom-left":
            left = visualRight - clamped.width;
            break;
        case "top-right":
            top = visualBottom - clamped.height;
            break;
        case "top-left":
            left = visualRight - clamped.width;
            top = visualBottom - clamped.height;
            break;
    }

    return {
        left,
        top,
        width: clamped.width,
        height: clamped.height,
    };
}

export function useGhostCornerResize({
    enabled,
    targetRef,
    handleCorner,
    clampSize,
    onResizeComplete,
    resolveStartSize,
}: {
    enabled: boolean;
    targetRef: RefObject<HTMLElement | null>;
    handleCorner: ResizeCorner;
    clampSize: (width: number, height: number) => BoxSize;
    onResizeComplete: (size: BoxSize) => void;
    resolveStartSize?: () => BoxSize;
}) {
    const [isResizing, setIsResizing] = useState(false);
    const ghostRef = useRef<HTMLDivElement | null>(null);
    const sessionRef = useRef<ResizeSession | null>(null);
    const pendingSizeRef = useRef<BoxSize | null>(null);
    const listenersRef = useRef<{ move: (event: PointerEvent) => void; up: (event: PointerEvent) => void } | null>(null);

    const detachResizeListeners = useCallback(() => {
        const listeners = listenersRef.current;

        if (!listeners) {
            return;
        }

        window.removeEventListener("pointermove", listeners.move, RESIZE_LISTENER_OPTIONS);
        window.removeEventListener("pointerup", listeners.up, RESIZE_LISTENER_OPTIONS);
        window.removeEventListener("pointercancel", listeners.up, RESIZE_LISTENER_OPTIONS);
        listenersRef.current = null;
    }, []);

    useEffect(() => {
        if (enabled) {
            return;
        }

        detachResizeListeners();
        sessionRef.current = null;
        pendingSizeRef.current = null;
        setIsResizing(false);
    }, [detachResizeListeners, enabled]);

    useEffect(() => () => detachResizeListeners(), [detachResizeListeners]);

    const finishResize = useCallback(() => {
        detachResizeListeners();

        if (pendingSizeRef.current) {
            onResizeComplete(pendingSizeRef.current);
        }

        sessionRef.current = null;
        pendingSizeRef.current = null;
        setIsResizing(false);
    }, [detachResizeListeners, onResizeComplete]);

    useLayoutEffect(() => {
        const session = sessionRef.current;
        const ghost = ghostRef.current;

        if (!isResizing || !session || !ghost) {
            return;
        }

        applyGhostRect(ghost, {
            left: session.visualLeft,
            top: session.visualTop,
            width: session.startWidth,
            height: session.startHeight,
        });
    }, [isResizing]);

    const handleResizePointerDown = useCallback(
        (event: ReactPointerEvent<HTMLElement>) => {
            if (!enabled || event.button !== 0) {
                return;
            }

            const targetNode = targetRef.current;

            if (!targetNode) {
                return;
            }

            event.preventDefault();
            event.stopPropagation();

            detachResizeListeners();
            event.currentTarget.setPointerCapture(event.pointerId);

            const rect = targetNode.getBoundingClientRect();
            const startSize = resolveStartSize?.() ?? { width: rect.width, height: rect.height };

            sessionRef.current = {
                pointerId: event.pointerId,
                startX: event.clientX,
                startY: event.clientY,
                startWidth: startSize.width,
                startHeight: startSize.height,
                visualLeft: rect.left,
                visualTop: rect.top,
                handleCorner,
            };
            setIsResizing(true);

            const handlePointerMove = (moveEvent: PointerEvent) => {
                const session = sessionRef.current;

                if (!session || session.pointerId !== moveEvent.pointerId) {
                    return;
                }

                const ghostRect = resolveGhostCornerRect(session, moveEvent.clientX, moveEvent.clientY, clampSize);
                pendingSizeRef.current = { width: ghostRect.width, height: ghostRect.height };

                const ghost = ghostRef.current;

                if (ghost) {
                    applyGhostRect(ghost, ghostRect);
                }
            };

            const handlePointerUp = (upEvent: PointerEvent) => {
                const session = sessionRef.current;

                if (!session || session.pointerId !== upEvent.pointerId) {
                    return;
                }

                finishResize();
            };

            listenersRef.current = { move: handlePointerMove, up: handlePointerUp };
            window.addEventListener("pointermove", handlePointerMove, RESIZE_LISTENER_OPTIONS);
            window.addEventListener("pointerup", handlePointerUp, RESIZE_LISTENER_OPTIONS);
            window.addEventListener("pointercancel", handlePointerUp, RESIZE_LISTENER_OPTIONS);
        },
        [clampSize, detachResizeListeners, enabled, finishResize, handleCorner, resolveStartSize, targetRef],
    );

    return {
        isResizing,
        ghostRef,
        handleResizePointerDown,
    };
}
