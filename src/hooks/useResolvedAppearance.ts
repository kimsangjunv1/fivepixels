import { useEffect, useState } from "react";
import type { ReportAppearance } from "@/types/report.js";
import type { ResolvedAppearance } from "@/types/report-ui.js";

export function useResolvedAppearance(appearance: ReportAppearance) {
    const [resolved, setResolved] = useState<ResolvedAppearance>("light");

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
