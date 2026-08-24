import { useCallback, useEffect, useSyncExternalStore } from "react";
import type { ApiFlowEntry } from "@/types/networkMonitor.js";
import {
    dismissNetworkFailureAlert,
    getApiFlowEntryById,
    getNetworkMonitorSnapshot,
    getServerNetworkMonitorSnapshot,
    installNetworkMonitor,
    subscribeNetworkMonitor,
    uninstallNetworkMonitor,
} from "@/utils/network/networkMonitor.js";

export function useNetworkMonitor(enabled = true) {
    useEffect(() => {
        if (!enabled || typeof window === "undefined") {
            return;
        }

        installNetworkMonitor();

        return () => {
            uninstallNetworkMonitor();
        };
    }, [enabled]);

    const snapshot = useSyncExternalStore(subscribeNetworkMonitor, getNetworkMonitorSnapshot, getServerNetworkMonitorSnapshot);

    const dismissFailureAlert = useCallback((entryId: string) => {
        dismissNetworkFailureAlert(entryId);
    }, []);

    const getEntryById = useCallback((entryId: string): ApiFlowEntry | undefined => getApiFlowEntryById(entryId), []);

    return {
        apiFlowEntries: snapshot.entries,
        activeApiFailureAlert: snapshot.activeFailureAlert,
        dismissFailureAlert,
        getEntryById,
        networkMonitorEnabled: enabled,
    };
}
