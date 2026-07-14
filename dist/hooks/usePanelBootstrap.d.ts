import type { ReportField, ReportFeedback, ReportPanelBootstrapParams, ReportPanelBootstrapResult } from "../types/report.js";
type UsePanelBootstrapOptions = {
    enabled: boolean;
    params: ReportPanelBootstrapParams;
    fields: ReportField[];
    reports: ReportFeedback[];
    pathname: string;
    onPanelBootstrap?: (params: ReportPanelBootstrapParams) => Promise<ReportPanelBootstrapResult>;
};
export declare function usePanelBootstrap({ enabled, params, fields, reports, pathname, onPanelBootstrap }: UsePanelBootstrapOptions): {
    bootstrap: ReportPanelBootstrapResult | null;
    isFetching: boolean;
    usesRemoteBootstrap: boolean;
};
export {};
//# sourceMappingURL=usePanelBootstrap.d.ts.map