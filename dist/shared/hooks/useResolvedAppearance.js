import { useEffect, useState } from "react";
function resolveAppearance(appearance) {
    if (appearance !== "system" || typeof window === "undefined") {
        return appearance === "dark" ? "dark" : "light";
    }
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}
export function useResolvedAppearance(appearance) {
    const [resolved, setResolved] = useState(() => resolveAppearance(appearance));
    useEffect(() => {
        if (appearance !== "system") {
            setResolved(appearance);
            return;
        }
        const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
        const sync = () => setResolved(mediaQuery.matches ? "dark" : "light");
        sync();
        mediaQuery.addEventListener("change", sync);
        return () => mediaQuery.removeEventListener("change", sync);
    }, [appearance]);
    return resolved;
}
//# sourceMappingURL=useResolvedAppearance.js.map