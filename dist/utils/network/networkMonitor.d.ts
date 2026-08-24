import type { ApiFlowEntry, NetworkMonitorSnapshot } from "../../types/networkMonitor.js";
export declare function installNetworkMonitor(): void;
export declare function uninstallNetworkMonitor(): void;
export declare function subscribeNetworkMonitor(listener: () => void): () => boolean;
export declare function getNetworkMonitorSnapshot(): NetworkMonitorSnapshot;
export declare function getServerNetworkMonitorSnapshot(): NetworkMonitorSnapshot;
export declare function dismissNetworkFailureAlert(entryId: string): void;
export declare function clearNetworkMonitorEntries(): void;
export declare function getApiFlowEntryById(entryId: string): ApiFlowEntry | undefined;
/** Test helper */
export declare function resetNetworkMonitorForTests(): void;
//# sourceMappingURL=networkMonitor.d.ts.map