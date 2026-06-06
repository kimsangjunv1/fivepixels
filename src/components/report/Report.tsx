"use client";

import { DEFAULT_FIELDS } from "../../constants/report.js";
import { ReportProvider } from "../../providers/ReportProvider.js";
import { resolveReportEnabled } from "../../utils/env.js";
import type {
    ReportAppearance,
    ReportEvent,
    ReportFeedback,
    ReportField,
    ReportAuthor,
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
    authors?: ReportAuthor[];
    shortcut?: string;
    identify?: ReportIdentify;
    onEvent?: (event: ReportEvent) => void | Promise<void>;
    onCreate?: (feedback: ReportFeedback) => void | Promise<void>;
    onDelete?: (id: string) => void | Promise<void>;
    onReply?: (params: { feedbackId: string; message: string }) => void | Promise<void>;
    onUpdate?: (feedback: ReportFeedback) => void | Promise<void>;
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
    authors,
    shortcut,
    identify,
    onEvent,
    onCreate,
    onDelete,
    onReply,
    onUpdate,
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
            authors={authors}
            shortcut={shortcut}
            identify={identify}
            onEvent={onEvent}
            onCreate={onCreate}
            onDelete={onDelete}
            onReply={onReply}
            onUpdate={onUpdate}
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
