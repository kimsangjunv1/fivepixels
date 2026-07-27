import { useCallback, useEffect, useRef, useState } from "react";
import {
    DEFAULT_PANEL_AUTO_REFRESH_INTERVAL_MINUTES,
    isPanelAutoRefreshIntervalMinutes,
    PANEL_AUTO_REFRESH_STORAGE_KEY,
    type PanelAutoRefreshIntervalMinutes,
} from "@/constants/panelAutoRefresh.js";
import {
    formatPanelAutoRefreshCountdown,
    isPanelAutoRefreshCycleDue,
    resolvePanelAutoRefreshProgress,
    resolvePanelAutoRefreshRemainingMs,
    resolvePanelAutoRefreshVisibilityAction,
} from "@/utils/panel/panelAutoRefresh.js";

type UsePanelAutoRefreshOptions = {
    refetch: () => Promise<unknown>;
    isFetching: boolean;
};

function readStoredInterval(): PanelAutoRefreshIntervalMinutes {
    if (typeof window === "undefined") {
        return DEFAULT_PANEL_AUTO_REFRESH_INTERVAL_MINUTES;
    }

    try {
        const raw = window.localStorage.getItem(PANEL_AUTO_REFRESH_STORAGE_KEY);
        const parsed = raw == null ? NaN : Number(raw);

        if (isPanelAutoRefreshIntervalMinutes(parsed)) {
            return parsed;
        }
    } catch {
        // Ignore storage failures in restricted environments.
    }

    return DEFAULT_PANEL_AUTO_REFRESH_INTERVAL_MINUTES;
}

function persistInterval(intervalMinutes: PanelAutoRefreshIntervalMinutes) {
    try {
        window.localStorage.setItem(PANEL_AUTO_REFRESH_STORAGE_KEY, String(intervalMinutes));
    } catch {
        // Ignore storage failures in restricted environments.
    }
}

export function usePanelAutoRefresh({ refetch, isFetching }: UsePanelAutoRefreshOptions) {
    const [intervalMinutes, setIntervalMinutesState] = useState<PanelAutoRefreshIntervalMinutes>(readStoredInterval);
    const [cycleStartedAt, setCycleStartedAt] = useState<number | null>(null);
    const [progress, setProgress] = useState(0);
    const [remainingMs, setRemainingMs] = useState(0);

    const refetchRef = useRef(refetch);
    const isFetchingRef = useRef(isFetching);
    const intervalMinutesRef = useRef(intervalMinutes);
    const cycleStartedAtRef = useRef(cycleStartedAt);
    const hiddenAtRef = useRef<number | null>(null);
    const inFlightRef = useRef(false);

    refetchRef.current = refetch;
    isFetchingRef.current = isFetching;
    intervalMinutesRef.current = intervalMinutes;
    cycleStartedAtRef.current = cycleStartedAt;

    const intervalMs = intervalMinutes > 0 ? intervalMinutes * 60_000 : 0;
    const isAutoRefreshEnabled = intervalMinutes > 0;
    const remainingLabel = formatPanelAutoRefreshCountdown(remainingMs);

    const runRefetch = useCallback(async () => {
        if (inFlightRef.current || isFetchingRef.current) {
            return;
        }

        inFlightRef.current = true;

        try {
            await refetchRef.current();
        } finally {
            inFlightRef.current = false;
        }
    }, []);

    const beginCycle = useCallback((at = Date.now()) => {
        cycleStartedAtRef.current = at;
        setCycleStartedAt(at);
        setProgress(0);
        setRemainingMs(intervalMinutesRef.current > 0 ? intervalMinutesRef.current * 60_000 : 0);
    }, []);

    const clearCycle = useCallback(() => {
        cycleStartedAtRef.current = null;
        setCycleStartedAt(null);
        setProgress(0);
        setRemainingMs(0);
    }, []);

    const setIntervalMinutes = useCallback(
        (next: PanelAutoRefreshIntervalMinutes) => {
            setIntervalMinutesState(next);
            persistInterval(next);
            intervalMinutesRef.current = next;

            if (next <= 0) {
                clearCycle();
                return;
            }

            beginCycle();
        },
        [beginCycle, clearCycle],
    );

    const stopAutoRefresh = useCallback(() => {
        setIntervalMinutes(0);
    }, [setIntervalMinutes]);

    const refreshNow = useCallback(() => {
        if (intervalMinutesRef.current > 0) {
            beginCycle();
        }

        void runRefetch();
    }, [beginCycle, runRefetch]);

    useEffect(() => {
        if (!isAutoRefreshEnabled) {
            clearCycle();
            return;
        }

        if (cycleStartedAtRef.current == null) {
            beginCycle();
        }
    }, [beginCycle, clearCycle, isAutoRefreshEnabled]);

    useEffect(() => {
        if (!isAutoRefreshEnabled || cycleStartedAt == null || intervalMs <= 0) {
            return;
        }

        const tick = () => {
            const startedAt = cycleStartedAtRef.current;

            if (startedAt == null) {
                return;
            }

            const now = Date.now();
            setProgress(resolvePanelAutoRefreshProgress(startedAt, intervalMs, now));
            setRemainingMs(resolvePanelAutoRefreshRemainingMs(startedAt, intervalMs, now));

            if (!isPanelAutoRefreshCycleDue(startedAt, intervalMs, now)) {
                return;
            }

            if (typeof document !== "undefined" && document.hidden) {
                setProgress(1);
                setRemainingMs(0);
                return;
            }

            if (inFlightRef.current || isFetchingRef.current) {
                return;
            }

            beginCycle();
            void runRefetch();
        };

        tick();
        const timerId = window.setInterval(tick, 250);

        return () => {
            window.clearInterval(timerId);
        };
    }, [beginCycle, cycleStartedAt, intervalMs, isAutoRefreshEnabled, runRefetch]);

    useEffect(() => {
        if (!isAutoRefreshEnabled || typeof document === "undefined") {
            return;
        }

        const handleVisibilityChange = () => {
            if (document.hidden) {
                hiddenAtRef.current = Date.now();
                return;
            }

            const hiddenAt = hiddenAtRef.current;
            hiddenAtRef.current = null;

            if (hiddenAt == null || intervalMinutesRef.current <= 0) {
                return;
            }

            const now = Date.now();
            const hiddenDurationMs = now - hiddenAt;
            const startedAt = cycleStartedAtRef.current;
            const currentIntervalMs = intervalMinutesRef.current * 60_000;
            const cycleDue = startedAt != null && isPanelAutoRefreshCycleDue(startedAt, currentIntervalMs, now);
            const action = resolvePanelAutoRefreshVisibilityAction(hiddenDurationMs, cycleDue);

            if (action === "continue") {
                if (startedAt != null) {
                    setProgress(resolvePanelAutoRefreshProgress(startedAt, currentIntervalMs, now));
                    setRemainingMs(resolvePanelAutoRefreshRemainingMs(startedAt, currentIntervalMs, now));
                }
                return;
            }

            if (inFlightRef.current || isFetchingRef.current) {
                beginCycle();
                return;
            }

            beginCycle();
            void runRefetch();
        };

        document.addEventListener("visibilitychange", handleVisibilityChange);

        return () => {
            document.removeEventListener("visibilitychange", handleVisibilityChange);
        };
    }, [beginCycle, isAutoRefreshEnabled, runRefetch]);

    return {
        intervalMinutes,
        setIntervalMinutes,
        isAutoRefreshEnabled,
        progress,
        remainingMs,
        remainingLabel,
        stopAutoRefresh,
        refreshNow,
    };
}
