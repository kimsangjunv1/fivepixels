import type { ReportAppearance, ReportField, ReportStorageAdapter } from "../../types/report.js";
export type ReportProps = {
    appearance?: ReportAppearance;
    fields?: ReportField[];
    pathname?: string;
    showFeedbackList?: boolean;
    storage?: "local" | ReportStorageAdapter;
};
export declare function Report({ appearance, fields, pathname, showFeedbackList, storage, }: ReportProps): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=Report.d.ts.map