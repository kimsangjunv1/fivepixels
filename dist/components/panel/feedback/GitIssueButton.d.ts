import type { ReportFeedback } from "@/types/report.js";
import type { ReportMessages } from "@/i18n/types.js";
type GitIssueButtonProps = {
    report: ReportFeedback;
    messages: ReportMessages;
    disabled?: boolean;
    isSubmitting?: boolean;
    onCreateIssue: (report: ReportFeedback) => Promise<void>;
};
export declare function GitIssueButton({ report, messages, disabled, isSubmitting, onCreateIssue }: GitIssueButtonProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=GitIssueButton.d.ts.map