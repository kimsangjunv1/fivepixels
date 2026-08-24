import type { ApiFlowEntry } from "../types/networkMonitor.js";
export declare function useNetworkMonitor(enabled?: boolean): {
    apiFlowEntries: readonly ApiFlowEntry[];
    activeApiFailureAlert: ApiFlowEntry | null;
    dismissFailureAlert: (entryId: string) => void;
    getEntryById: (entryId: string) => ApiFlowEntry | undefined;
    networkMonitorEnabled: boolean;
};
//# sourceMappingURL=useNetworkMonitor.d.ts.map