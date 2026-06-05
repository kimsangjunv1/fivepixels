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

        const onEnter = () => handlersRef.current.onEnter();
        const onLeave = () => handlersRef.current.onLeave();

        node.addEventListener("mouseenter", onEnter);
        node.addEventListener("mouseleave", onLeave);
        node.addEventListener("pointerenter", onEnter);
        node.addEventListener("pointerleave", onLeave);

        return () => {
            node.removeEventListener("mouseenter", onEnter);
            node.removeEventListener("mouseleave", onLeave);
            node.removeEventListener("pointerenter", onEnter);
            node.removeEventListener("pointerleave", onLeave);
        };
    }, [node]);

    return ref;
}
