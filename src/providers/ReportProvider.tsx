import type { ReactNode } from "react";
import { DEFAULT_FIELDS } from "../constants/report.js";
import { useReportController, type ReportControllerConfig } from "../hooks/useReportController.js";
import type { ReportAppearance, ReportField, ReportStorageAdapter } from "../types/report.js";
import { ReportContext } from "./reportContext.js";

export type ReportProviderProps = {
    appearance?: ReportAppearance;
    fields?: ReportField[];
    pathname?: string;
    showFeedbackList?: boolean;
    storage?: "local" | ReportStorageAdapter;
    children: ReactNode;
};

export function ReportProvider({
    appearance = "system",
    fields = DEFAULT_FIELDS,
    pathname,
    showFeedbackList = true,
    storage = "local",
    children,
}: ReportProviderProps) {
    const config: ReportControllerConfig = {
        appearance,
        fields,
        pathname,
        showFeedbackList,
        storage,
    };
    const value = useReportController(config);

    return <ReportContext.Provider value={value}>{children}</ReportContext.Provider>;
}
