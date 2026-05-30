import type { ReactNode } from "react";
import { DEFAULT_FIELDS } from "../constants/report.js";
import { useReportState } from "../hooks/useReportState.js";
import type { ReportAppearance, ReportEvent, ReportFeedback, ReportField, ReportStorageAdapter } from "../types/report.js";
import { resolveReportEnabled } from "../utils/env.js";
import { ReportContext } from "./reportContext.js";

export type ReportProviderProps = {
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
    children: ReactNode;
};

type ReportProviderEnabledProps = Omit<ReportProviderProps, "devOnly" | "enabled">;

function ReportProviderEnabled({
    appearance = "system",
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
    children,
}: ReportProviderEnabledProps) {
    const value = useReportState({
        appearance,
        fields,
        onEvent,
        onFeedbackCreate,
        onFeedbackDelete,
        onFeedbackReply,
        onFeedbackUpdate,
        pathname,
        showFeedbackList,
        storage,
        visibleShortcutKeys,
    });

    return <ReportContext.Provider value={value}>{children}</ReportContext.Provider>;
}

export function ReportProvider({
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
    children,
}: ReportProviderProps) {
    if (!resolveReportEnabled({ enabled, devOnly })) {
        return <>{children}</>;
    }

    return (
        <ReportProviderEnabled
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
            {children}
        </ReportProviderEnabled>
    );
}
