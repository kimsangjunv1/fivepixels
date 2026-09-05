"use client";

import { createContext, useContext, type ReactNode } from "react";

const ReportOverlayRootContext = createContext<HTMLElement | null>(null);

/** Optional portal root for pointer-follow tooltips (demo shadow / custom hosts). */
export function ReportOverlayRootProvider({ root, children }: { root: HTMLElement | null; children: ReactNode }) {
    return <ReportOverlayRootContext.Provider value={root}>{children}</ReportOverlayRootContext.Provider>;
}

export function useReportOverlayRoot(): HTMLElement | null {
    return useContext(ReportOverlayRootContext);
}
