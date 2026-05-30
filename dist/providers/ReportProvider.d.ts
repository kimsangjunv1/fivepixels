import type { ReactNode } from "react";
import type { ReportAppearance, ReportEvent, ReportFeedback, ReportField, ReportIdentify, ReportStorageAdapter } from "../types/report.js";
export type ReportProviderProps = {
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
    children: ReactNode;
};
export declare function ReportProvider({ projectId, environment, appVersion, appearance, devOnly, enabled, storage, storageAdapter, fields, shortcut, identify, onEvent, onFeedbackCreate, onFeedbackDelete, onFeedbackReply, onFeedbackUpdate, pathname, showFeedbackList, visibleShortcutKeys, children, }: ReportProviderProps): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=ReportProvider.d.ts.map