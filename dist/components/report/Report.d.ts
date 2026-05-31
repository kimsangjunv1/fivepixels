import type { ReportAppearance, ReportEvent, ReportFeedback, ReportField, ReportIdentify, ReportStorageAdapter } from "../../types/report.js";
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
    onFeedbackReply?: (params: {
        feedbackId: string;
        message: string;
    }) => void | Promise<void>;
    onFeedbackUpdate?: (feedback: ReportFeedback) => void | Promise<void>;
    devOnly?: boolean;
    enabled?: boolean;
    pathname?: string;
    showFeedbackList?: boolean;
    visibleShortcutKeys?: boolean;
};
export declare function Report({ projectId, environment, appVersion, appearance, storage, storageAdapter, fields, shortcut, identify, onEvent, onFeedbackCreate, onFeedbackDelete, onFeedbackReply, onFeedbackUpdate, devOnly, enabled, pathname, showFeedbackList, visibleShortcutKeys, }: ReportProps): import("react/jsx-runtime").JSX.Element | null;
//# sourceMappingURL=Report.d.ts.map