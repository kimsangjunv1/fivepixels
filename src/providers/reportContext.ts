import { createContext, useContext, useMemo, type Context, type DependencyList } from "react";
import type { useReportState } from "@/hooks/useReportState.js";
import {
    pickReportSlice,
    REPORT_DATA_KEYS,
    REPORT_PREFERENCE_KEYS,
    REPORT_SESSION_KEYS,
} from "./reportContextPartitions.js";

export type ReportContextValue = ReturnType<typeof useReportState>;

type PreferenceKey = (typeof REPORT_PREFERENCE_KEYS)[number] & keyof ReportContextValue;
type SessionKey = (typeof REPORT_SESSION_KEYS)[number] & keyof ReportContextValue;
type DataKey = (typeof REPORT_DATA_KEYS)[number] & keyof ReportContextValue;

export type ReportPreferencesValue = Pick<ReportContextValue, PreferenceKey>;
export type ReportSessionValue = Pick<ReportContextValue, SessionKey>;
export type ReportDataValue = Pick<ReportContextValue, DataKey>;

type AssertNoUnknownPreferenceKeys = Exclude<(typeof REPORT_PREFERENCE_KEYS)[number], keyof ReportContextValue>;
type AssertNoUnknownSessionKeys = Exclude<(typeof REPORT_SESSION_KEYS)[number], keyof ReportContextValue>;
type AssertNoUnknownDataKeys = Exclude<(typeof REPORT_DATA_KEYS)[number], keyof ReportContextValue>;

type AssertNever<T extends never> = T;
type _AssertPreferenceKeys = AssertNever<AssertNoUnknownPreferenceKeys>;
type _AssertSessionKeys = AssertNever<AssertNoUnknownSessionKeys>;
type _AssertDataKeys = AssertNever<AssertNoUnknownDataKeys>;

const ReportContext = createContext<ReportContextValue | null>(null);
const ReportPreferencesContext = createContext<ReportPreferencesValue | null>(null);
const ReportSessionContext = createContext<ReportSessionValue | null>(null);
const ReportDataContext = createContext<ReportDataValue | null>(null);

function useRequiredContext<T>(context: Context<T | null>, hookName: string): T {
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

export function useReportContextSlices(state: ReportContextValue) {
    const preferenceDeps = REPORT_PREFERENCE_KEYS.map((key) => state[key as PreferenceKey]) as DependencyList;
    const sessionDeps = REPORT_SESSION_KEYS.map((key) => state[key as SessionKey]) as DependencyList;
    const dataDeps = REPORT_DATA_KEYS.map((key) => state[key as DataKey]) as DependencyList;

    const preferences = useMemo(
        () => pickReportSlice(state, REPORT_PREFERENCE_KEYS as readonly PreferenceKey[]),
        preferenceDeps,
    );
    const session = useMemo(() => pickReportSlice(state, REPORT_SESSION_KEYS as readonly SessionKey[]), sessionDeps);
    const data = useMemo(() => pickReportSlice(state, REPORT_DATA_KEYS as readonly DataKey[]), dataDeps);

    return { preferences, session, data };
}

export { ReportContext, ReportPreferencesContext, ReportSessionContext, ReportDataContext };

void 0 as unknown as _AssertPreferenceKeys;
void 0 as unknown as _AssertSessionKeys;
void 0 as unknown as _AssertDataKeys;
