import type { ReportAppearance, ReportField, ReportStorageAdapter } from "../../types/report.js";
export type ReportProps = {
    appearance?: ReportAppearance;
    devOnly?: boolean;
    enabled?: boolean;
    fields?: ReportField[];
    pathname?: string;
    showFeedbackList?: boolean;
    storage?: "local" | ReportStorageAdapter;
    visibleShortcutKeys?: boolean;
};
export declare function Report({ appearance, devOnly, enabled, fields, pathname, showFeedbackList, storage, visibleShortcutKeys, }: ReportProps): import("react/jsx-runtime").JSX.Element | null;
//# sourceMappingURL=Report.d.ts.map