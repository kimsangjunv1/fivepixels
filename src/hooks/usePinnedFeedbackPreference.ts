import { useCallback, useEffect, useState } from "react";
import type { PinnedFeedbackItem, PinnedFeedbackPreference } from "@/types/pinnedFeedback.js";
import type { ReportFeedback } from "@/types/report.js";
import {
    getPinnedFeedbackStorageKey,
    removePinnedFeedbackItem,
    sanitizePinnedFeedbackPreference,
    togglePinnedFeedbackItem,
} from "@/utils/pinned/pinnedFeedback.js";

function readStoredPreference(storageKey: string): PinnedFeedbackPreference {
    if (typeof window === "undefined") {
        return sanitizePinnedFeedbackPreference(null);
    }

    try {
        const raw = window.localStorage.getItem(storageKey);

        if (!raw) {
            return sanitizePinnedFeedbackPreference(null);
        }

        return sanitizePinnedFeedbackPreference(JSON.parse(raw));
    } catch {
        return sanitizePinnedFeedbackPreference(null);
    }
}

function persistPreference(storageKey: string, preference: PinnedFeedbackPreference) {
    try {
        window.localStorage.setItem(storageKey, JSON.stringify(preference));
    } catch {
        // Ignore storage failures in restricted environments.
    }
}

export function usePinnedFeedbackPreference(projectId: string, environment?: string) {
    const storageKey = getPinnedFeedbackStorageKey(projectId, environment);
    const [preference, setPreferenceState] = useState<PinnedFeedbackPreference>(() => readStoredPreference(storageKey));

    useEffect(() => {
        setPreferenceState(readStoredPreference(storageKey));
    }, [storageKey]);

    const setPreference = useCallback(
        (next: PinnedFeedbackPreference | ((current: PinnedFeedbackPreference) => PinnedFeedbackPreference)) => {
            setPreferenceState((current) => {
                const resolved = typeof next === "function" ? next(current) : next;
                const sanitized = sanitizePinnedFeedbackPreference(resolved);
                persistPreference(storageKey, sanitized);
                return sanitized;
            });
        },
        [storageKey],
    );

    const togglePinnedFeedback = useCallback(
        (item: PinnedFeedbackItem) => {
            setPreference((current) => ({
                ...current,
                items: togglePinnedFeedbackItem(current.items, item),
                railCollapsed: current.items.length === 0 ? false : current.railCollapsed,
            }));
        },
        [setPreference],
    );

    const unpinFeedback = useCallback(
        (reportId: string) => {
            setPreference((current) => ({
                ...current,
                items: removePinnedFeedbackItem(current.items, reportId),
            }));
        },
        [setPreference],
    );

    const setPinRailCollapsed = useCallback(
        (railCollapsed: boolean) => {
            setPreference((current) => ({
                ...current,
                railCollapsed,
            }));
        },
        [setPreference],
    );

    const syncPinnedFeedbackReports = useCallback(
        (reports: ReportFeedback[]) => {
            if (reports.length === 0) {
                return;
            }

            const reportById = new Map(reports.map((report) => [report.id, report]));

            setPreferenceState((current) => {
                let changed = false;
                const items = current.items.map((item) => {
                    const report = reportById.get(item.reportId);

                    if (!report) {
                        return item;
                    }

                    const cases = report.cases.map((caseItem) => ({
                        id: caseItem.id,
                        status: caseItem.status,
                    }));
                    const nextFcNumber = report.fc_number ?? null;
                    const casesChanged =
                        cases.length !== (item.cases?.length ?? 0) ||
                        cases.some((caseItem, index) => {
                            const currentCase = item.cases?.[index];
                            return currentCase?.id !== caseItem.id || currentCase?.status !== caseItem.status;
                        });

                    if (item.pathname === report.pathname && item.fcNumber === nextFcNumber && !casesChanged) {
                        return item;
                    }

                    changed = true;
                    return {
                        ...item,
                        pathname: report.pathname,
                        fcNumber: nextFcNumber,
                        cases,
                    };
                });

                if (!changed) {
                    return current;
                }

                const next = { ...current, items };
                persistPreference(storageKey, next);
                return next;
            });
        },
        [storageKey],
    );

    return {
        pinnedFeedbackItems: preference.items,
        pinRailCollapsed: preference.railCollapsed,
        togglePinnedFeedback,
        unpinFeedback,
        setPinRailCollapsed,
        syncPinnedFeedbackReports,
    };
}
