import { useEffect, useState } from "react";
export function useResolvedAppearance(appearance) {
    const [resolved, setResolved] = useState("light");
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