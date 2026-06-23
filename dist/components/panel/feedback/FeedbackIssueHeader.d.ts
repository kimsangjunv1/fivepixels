import type { ReportFeedback } from "../../../types/report.js";
type FeedbackIssueHeaderProps = {
    report: ReportFeedback;
    fieldTags: {
        key: string;
        label: string;
    }[];
    expanded?: boolean;
};
export declare function FeedbackIssueHeader({ report, fieldTags, expanded }: FeedbackIssueHeaderProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=FeedbackIssueHeader.d.ts.map