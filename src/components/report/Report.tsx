"use client";

import { DEFAULT_FIELDS } from "../../constants/report.js";
import { ReportProvider } from "../../providers/ReportProvider.js";
import { resolveReportEnabled } from "../../utils/env.js";
import type {
    ReportAppearance,
    ReportEvent,
    ReportFeedback,
    ReportField,
    ReportIdentify,
    ReportStorageAdapter,
} from "../../types/report.js";
import { ReportView } from "./ReportView.js";

export type ReportProps = {
    projectId?: string;
    environment?: string;
    appVersion?: string;
    appearance?: ReportAppearance;
    storage?: "local" | ReportStorageAdapter;
    storageAdapter?: ReportStorageAdapter;
    fields?: ReportField[];
    shortcut?: string;
    identify?: ReportIdentify;
    onEvent?: (event: ReportEvent) => void | Promise<void>;
    onFeedbackCreate?: (feedback: ReportFeedback) => void | Promise<void>;
    onFeedbackDelete?: (id: string) => void | Promise<void>;
    onFeedbackReply?: (params: { feedbackId: string; message: string }) => void | Promise<void>;
    onFeedbackUpdate?: (feedback: ReportFeedback) => void | Promise<void>;
    devOnly?: boolean;
    enabled?: boolean;
    pathname?: string;
    showFeedbackList?: boolean;
    visibleShortcutKeys?: boolean;
};

export function Report({
    projectId,
    environment,
    appVersion,
    appearance = "system",
    storage = "local",
    storageAdapter,
    fields = DEFAULT_FIELDS,
    shortcut,
    identify,
    onEvent,
    onFeedbackCreate,
    onFeedbackDelete,
    onFeedbackReply,
    onFeedbackUpdate,
    devOnly = false,
    enabled = true,
    pathname,
    showFeedbackList = true,
    visibleShortcutKeys = false,
}: ReportProps) {
    if (!resolveReportEnabled({ enabled, devOnly })) {
        return null;
    }

    return (
        <ReportProvider
            projectId={projectId}
            environment={environment}
            appVersion={appVersion}
            appearance={appearance}
            fields={fields}
            shortcut={shortcut}
            identify={identify}
            onEvent={onEvent}
            onFeedbackCreate={onFeedbackCreate}
            onFeedbackDelete={onFeedbackDelete}
            onFeedbackReply={onFeedbackReply}
            onFeedbackUpdate={onFeedbackUpdate}
            pathname={pathname}
            showFeedbackList={showFeedbackList}
            storage={storage}
            storageAdapter={storageAdapter}
            visibleShortcutKeys={visibleShortcutKeys}
        >
            <ReportView />
        </ReportProvider>
    );
}
