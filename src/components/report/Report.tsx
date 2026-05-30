"use client";

import { DEFAULT_FIELDS } from "../../constants/report.js";
import { ReportProvider } from "../../providers/ReportProvider.js";
import { resolveReportEnabled } from "../../utils/env.js";
import type { ReportAppearance, ReportEvent, ReportFeedback, ReportField, ReportStorageAdapter } from "../../types/report.js";
import { ReportView } from "./ReportView.js";

export type ReportProps = {
    appearance?: ReportAppearance;
    devOnly?: boolean;
    enabled?: boolean;
    fields?: ReportField[];
    onEvent?: (event: ReportEvent) => void | Promise<void>;
    onFeedbackCreate?: (feedback: ReportFeedback) => void | Promise<void>;
    onFeedbackDelete?: (id: string) => void | Promise<void>;
    onFeedbackReply?: (params: { feedbackId: string; message: string }) => void | Promise<void>;
    onFeedbackUpdate?: (feedback: ReportFeedback) => void | Promise<void>;
    pathname?: string;
    showFeedbackList?: boolean;
    storage?: "local" | ReportStorageAdapter;
    visibleShortcutKeys?: boolean;
};

export function Report({
    appearance = "system",
    devOnly = false,
    enabled = true,
    fields = DEFAULT_FIELDS,
    onEvent,
    onFeedbackCreate,
    onFeedbackDelete,
    onFeedbackReply,
    onFeedbackUpdate,
    pathname,
    showFeedbackList = true,
    storage = "local",
    visibleShortcutKeys = false,
}: ReportProps) {
    if (!resolveReportEnabled({ enabled, devOnly })) {
        return null;
    }

    return (
        <ReportProvider
            appearance={appearance}
            fields={fields}
            onEvent={onEvent}
            onFeedbackCreate={onFeedbackCreate}
            onFeedbackDelete={onFeedbackDelete}
            onFeedbackReply={onFeedbackReply}
            onFeedbackUpdate={onFeedbackUpdate}
            pathname={pathname}
            showFeedbackList={showFeedbackList}
            storage={storage}
            visibleShortcutKeys={visibleShortcutKeys}
        >
            <ReportView />
        </ReportProvider>
    );
}
