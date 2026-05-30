import type { ReactNode } from "react";
import type { ReportAppearance, ReportEvent, ReportFeedback, ReportField, ReportStorageAdapter } from "../types/report.js";
export type ReportProviderProps = {
    appearance?: ReportAppearance;
    devOnly?: boolean;
    enabled?: boolean;
    fields?: ReportField[];
    onEvent?: (event: ReportEvent) => void | Promise<void>;
    onFeedbackCreate?: (feedback: ReportFeedback) => void | Promise<void>;
    onFeedbackDelete?: (id: string) => void | Promise<void>;
    onFeedbackReply?: (params: {
        feedbackId: string;
        message: string;
    }) => void | Promise<void>;
    onFeedbackUpdate?: (feedback: ReportFeedback) => void | Promise<void>;
    pathname?: string;
    showFeedbackList?: boolean;
    storage?: "local" | ReportStorageAdapter;
    visibleShortcutKeys?: boolean;
    children: ReactNode;
};
export declare function ReportProvider({ appearance, devOnly, enabled, fields, onEvent, onFeedbackCreate, onFeedbackDelete, onFeedbackReply, onFeedbackUpdate, pathname, showFeedbackList, storage, visibleShortcutKeys, children, }: ReportProviderProps): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=ReportProvider.d.ts.map