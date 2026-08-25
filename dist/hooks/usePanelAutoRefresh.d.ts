import { type PanelAutoRefreshIntervalMinutes } from "../constants/panelAutoRefresh.js";
type UsePanelAutoRefreshOptions = {
    refetch: () => Promise<unknown>;
    isFetching: boolean;
};
export declare function usePanelAutoRefresh({ refetch, isFetching }: UsePanelAutoRefreshOptions): {
    intervalMinutes: 0 | 3 | 5 | 1 | 10;
    setIntervalMinutes: (next: PanelAutoRefreshIntervalMinutes) => void;
    isAutoRefreshEnabled: boolean;
    progress: number;
    remainingMs: number;
    remainingLabel: string;
    stopAutoRefresh: () => void;
    refreshNow: () => void;
};
export {};
//# sourceMappingURL=usePanelAutoRefresh.d.ts.map