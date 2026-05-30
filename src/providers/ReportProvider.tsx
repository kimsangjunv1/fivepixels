import type { ReactNode } from "react";
import { DEFAULT_FIELDS } from "../constants/report.js";
import { useReportState } from "../hooks/useReportState.js";
import type { ReportAppearance, ReportField, ReportStorageAdapter } from "../types/report.js";
import { resolveReportEnabled } from "../utils/env.js";
import { ReportContext } from "./reportContext.js";

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

type ReportProviderEnabledProps = Omit<ReportProviderProps, "devOnly" | "enabled">;

function ReportProviderEnabled({
    appearance = "system",
    fields = DEFAULT_FIELDS,
    pathname,
    showFeedbackList = true,
    storage = "local",
    children,
}: ReportProviderEnabledProps) {
    const value = useReportState({
        appearance,
        fields,
        pathname,
        showFeedbackList,
        storage,
    });

    return <ReportContext.Provider value={value}>{children}</ReportContext.Provider>;
}

export function ReportProvider({
    appearance = "system",
    devOnly = false,
    enabled = true,
    fields = DEFAULT_FIELDS,
    pathname,
    showFeedbackList = true,
    storage = "local",
    children,
}: ReportProviderProps) {
    if (!resolveReportEnabled({ enabled, devOnly })) {
        return <>{children}</>;
    }

    return (
        <ReportProviderEnabled
            appearance={appearance}
            fields={fields}
            pathname={pathname}
            showFeedbackList={showFeedbackList}
            storage={storage}
        >
            {children}
        </ReportProviderEnabled>
    );
}
