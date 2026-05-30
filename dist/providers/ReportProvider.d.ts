import type { ReactNode } from "react";
import type { ReportAppearance, ReportField, ReportStorageAdapter } from "../types/report.js";
export type ReportProviderProps = {
    appearance?: ReportAppearance;
    devOnly?: boolean;
    enabled?: boolean;
    fields?: ReportField[];
    pathname?: string;
    showFeedbackList?: boolean;
    storage?: "local" | ReportStorageAdapter;
    children: ReactNode;
};
export declare function ReportProvider({ appearance, devOnly, enabled, fields, pathname, showFeedbackList, storage, children, }: ReportProviderProps): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=ReportProvider.d.ts.map