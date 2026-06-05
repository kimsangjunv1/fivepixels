import type { ReactNode } from "react";
import { DEFAULT_FIELDS } from "../constants/report.js";
import { useReportState } from "../hooks/useReportState.js";
import type {
    ReportAppearance,
    ReportEvent,
    ReportFeedback,
    ReportField,
    ReportAuthor,
    ReportIdentify,
    ReportStorageAdapter,
} from "../types/report.js";
import { resolveReportEnabled } from "../utils/env.js";
import { resolveProjectId } from "../utils/projectId.js";
import { ReportContext } from "./reportContext.js";

export type ReportProviderProps = {
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
    onFeedbackCreate?: (feedback: ReportFeedback) => void | Promise<void>;
    onFeedbackDelete?: (id: string) => void | Promise<void>;
    onFeedbackReply?: (params: { feedbackId: string; message: string }) => void | Promise<void>;
    onFeedbackUpdate?: (feedback: ReportFeedback) => void | Promise<void>;
    devOnly?: boolean;
    enabled?: boolean;
    pathname?: string;
    showFeedbackList?: boolean;
    visibleShortcutKeys?: boolean;
    children: ReactNode;
};

type ReportProviderEnabledProps = Omit<ReportProviderProps, "devOnly" | "enabled" | "projectId"> & {
    projectId: string;
};

function ReportProviderEnabled({
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
    onFeedbackCreate,
    onFeedbackDelete,
    onFeedbackReply,
    onFeedbackUpdate,
    pathname,
    showFeedbackList = true,
    visibleShortcutKeys = false,
    children,
}: ReportProviderEnabledProps) {
    const value = useReportState({
        projectId,
        environment,
        appVersion,
        appearance,
        fields,
        authors,
        shortcut,
        identify,
        onEvent,
        onFeedbackCreate,
        onFeedbackDelete,
        onFeedbackReply,
        onFeedbackUpdate,
        pathname,
        showFeedbackList,
        storage,
        storageAdapter,
        visibleShortcutKeys,
    });

    return <ReportContext.Provider value={value}>{children}</ReportContext.Provider>;
}

export function ReportProvider({
    projectId,
    environment,
    appVersion,
    appearance = "system",
    devOnly = false,
    enabled = true,
    storage = "local",
    storageAdapter,
    fields = DEFAULT_FIELDS,
    authors,
    shortcut,
    identify,
    onEvent,
    onFeedbackCreate,
    onFeedbackDelete,
    onFeedbackReply,
    onFeedbackUpdate,
    pathname,
    showFeedbackList = true,
    visibleShortcutKeys = false,
    children,
}: ReportProviderProps) {
    const resolvedProjectId = resolveProjectId(projectId);

    if (!resolveReportEnabled({ enabled, devOnly })) {
        return <>{children}</>;
    }

    return (
        <ReportProviderEnabled
            projectId={resolvedProjectId}
            environment={environment}
            appVersion={appVersion}
            appearance={appearance}
            fields={fields}
            authors={authors}
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
            {children}
        </ReportProviderEnabled>
    );
}
