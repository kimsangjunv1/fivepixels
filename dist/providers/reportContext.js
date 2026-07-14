import { createContext, useContext, useMemo } from "react";
import { pickReportSlice, REPORT_DATA_KEYS, REPORT_PREFERENCE_KEYS, REPORT_SESSION_KEYS, } from "./reportContextPartitions.js";
const ReportContext = createContext(null);
const ReportPreferencesContext = createContext(null);
const ReportSessionContext = createContext(null);
const ReportDataContext = createContext(null);
function useRequiredContext(context, hookName) {
    const value = useContext(context);
    if (!value) {
        throw new Error(`${hookName} must be used within ReportProvider`);
    }
    return value;
}
/** Full report state. Prefer domain hooks when you only need a slice. */
export function useReport() {
    return useRequiredContext(ReportContext, "useReport");
}
/** Appearance, locale, tabs, personal key, role — changes less often than markers/lists. */
export function useReportPreferences() {
    return useRequiredContext(ReportPreferencesContext, "useReportPreferences");
}
/** Mode, markers, draft, pickProbe, overlay, reply composers. */
export function useReportSession() {
    return useRequiredContext(ReportSessionContext, "useReportSession");
}
/** Reports lists, filters, CRUD handlers, stats, reply history loading. */
export function useReportData() {
    return useRequiredContext(ReportDataContext, "useReportData");
}
export function useReportContextSlices(state) {
    const preferenceDeps = REPORT_PREFERENCE_KEYS.map((key) => state[key]);
    const sessionDeps = REPORT_SESSION_KEYS.map((key) => state[key]);
    const dataDeps = REPORT_DATA_KEYS.map((key) => state[key]);
    const preferences = useMemo(() => pickReportSlice(state, REPORT_PREFERENCE_KEYS), preferenceDeps);
    const session = useMemo(() => pickReportSlice(state, REPORT_SESSION_KEYS), sessionDeps);
    const data = useMemo(() => pickReportSlice(state, REPORT_DATA_KEYS), dataDeps);
    return { preferences, session, data };
}
export { ReportContext, ReportPreferencesContext, ReportSessionContext, ReportDataContext };
void 0;
void 0;
void 0;
//# sourceMappingURL=reportContext.js.map