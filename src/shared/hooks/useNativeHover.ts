import { useCallback, useEffect, useRef, useState } from "react";

type NativeHoverHandlers = {
    onEnter: () => void;
    onLeave: () => void;
};

export function useNativeHover<T extends HTMLElement>(handlers: NativeHoverHandlers) {
    const handlersRef = useRef(handlers);
    const [node, setNode] = useState<T | null>(null);

    handlersRef.current = handlers;

    const ref = useCallback((element: T | null) => {
        setNode(element);
    }, []);

    useEffect(() => {
        if (!node) {
            return;
        }

        let inside = false;

        const onEnter = () => {
            inside = true;
            handlersRef.current.onEnter();
        };

        const onLeave = () => {
            if (!inside) {
                return;
            }

            inside = false;
            handlersRef.current.onLeave();
        };

        // Pointer events alone — pairing with mouseenter/leave double-fires and can
        // leave hover state stuck when one leave is swallowed during remounts.
        node.addEventListener("pointerenter", onEnter);
        node.addEventListener("pointerleave", onLeave);

        return () => {
            node.removeEventListener("pointerenter", onEnter);
            node.removeEventListener("pointerleave", onLeave);

            // Unmount / node swap without a leave event must still clear hover.
            if (inside) {
                handlersRef.current.onLeave();
            }
        };
    }, [node]);

    return ref;
}
