import type { ReportFeedback } from "../../../types/report.js";
import type { ReportLocale, ReportMessages } from "../../../i18n/types.js";
type FeedbackListItemProps = {
    report: ReportFeedback;
    locale: ReportLocale;
    messages: ReportMessages;
    listScope: "current" | "all";
    disabled?: boolean;
    canCreateGitHubIssue?: boolean;
    creatingGitHubIssueId?: string | null;
    onLocate: (id: string) => void;
    onDelete: (id: string) => Promise<void>;
    onCreateGitHubIssue?: (report: ReportFeedback) => Promise<void>;
};
export declare function FeedbackListItem({ report, locale, messages, listScope, disabled, canCreateGitHubIssue, creatingGitHubIssueId, onLocate, onDelete, onCreateGitHubIssue, }: FeedbackListItemProps): import("react").JSX.Element;
export {};
//# sourceMappingURL=FeedbackListItem.d.ts.map