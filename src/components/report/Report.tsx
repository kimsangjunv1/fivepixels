"use client";

import { DEFAULT_FIELDS } from "../../constants/report.js";
import { ReportProvider } from "../../providers/ReportProvider.js";
import type { ReportAppearance, ReportField, ReportStorageAdapter } from "../../types/report.js";
import { ReportView } from "./ReportView.js";

export type ReportProps = {
    appearance?: ReportAppearance;
    fields?: ReportField[];
    pathname?: string;
    showFeedbackList?: boolean;
    storage?: "local" | ReportStorageAdapter;
};

export function Report({
    appearance = "system",
    fields = DEFAULT_FIELDS,
    pathname,
    showFeedbackList = true,
    storage = "local",
}: ReportProps) {
    return (
        <ReportProvider
            appearance={appearance}
            fields={fields}
            pathname={pathname}
            showFeedbackList={showFeedbackList}
            storage={storage}
        >
            <ReportView />
        </ReportProvider>
    );
}
