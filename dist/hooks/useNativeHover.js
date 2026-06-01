import { useCallback, useEffect, useRef, useState } from "react";
export function useNativeHover(handlers) {
    const handlersRef = useRef(handlers);
    const [node, setNode] = useState(null);
    handlersRef.current = handlers;
    const ref = useCallback((element) => {
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
//# sourceMappingURL=useNativeHover.js.map