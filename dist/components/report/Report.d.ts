import type { ReportAppearance, ReportEvent, ReportFeedback, ReportField, ReportStorageAdapter } from "../../types/report.js";
export type ReportProps = {
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
};
export declare function Report({ appearance, devOnly, enabled, fields, onEvent, onFeedbackCreate, onFeedbackDelete, onFeedbackReply, onFeedbackUpdate, pathname, showFeedbackList, storage, visibleShortcutKeys, }: ReportProps): import("react/jsx-runtime").JSX.Element | null;
//# sourceMappingURL=Report.d.ts.map