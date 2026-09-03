export type ApiFlowFailureKind = "http" | "network";
export type ApiFlowEntry = {
    id: string;
    timestamp: number;
    method: string;
    url: string;
    pathname: string;
    queryParams: Record<string, string>;
    status: number | null;
    ok: boolean;
    durationMs: number;
    requestBody: string | null;
    responseBody: string | null;
    errorMessage: string | null;
    failureKind: ApiFlowFailureKind | null;
};
export type NetworkMonitorSnapshot = {
    entries: readonly ApiFlowEntry[];
    activeFailureAlert: ApiFlowEntry | null;
};
//# sourceMappingURL=networkMonitor.d.ts.map