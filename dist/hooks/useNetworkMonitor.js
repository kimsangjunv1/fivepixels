import { useCallback, useEffect, useSyncExternalStore } from "react";
import { dismissNetworkFailureAlert, getApiFlowEntryById, getNetworkMonitorSnapshot, getServerNetworkMonitorSnapshot, installNetworkMonitor, subscribeNetworkMonitor, uninstallNetworkMonitor, } from "../utils/network/networkMonitor.js";
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
    const dismissFailureAlert = useCallback((entryId) => {
        dismissNetworkFailureAlert(entryId);
    }, []);
    const getEntryById = useCallback((entryId) => getApiFlowEntryById(entryId), []);
    return {
        apiFlowEntries: snapshot.entries,
        activeApiFailureAlert: snapshot.activeFailureAlert,
        dismissFailureAlert,
        getEntryById,
        networkMonitorEnabled: enabled,
    };
}
//# sourceMappingURL=useNetworkMonitor.js.map