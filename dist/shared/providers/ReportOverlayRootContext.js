"use client";
import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext } from "react";
const ReportOverlayRootContext = createContext(null);
/** Optional portal root for pointer-follow tooltips (demo shadow / custom hosts). */
export function ReportOverlayRootProvider({ root, children }) {
    return _jsx(ReportOverlayRootContext.Provider, { value: root, children: children });
}
export function useReportOverlayRoot() {
    return useContext(ReportOverlayRootContext);
}
//# sourceMappingURL=ReportOverlayRootContext.js.map