import type { ReportFeedback } from "../../../types/report.js";
type FeedbackHoverCardProps = {
    report: ReportFeedback;
    fieldTags: {
        key: string;
        label: string;
    }[];
    detached?: boolean;
    detachedHint?: string;
};
export declare function FeedbackHoverCard({ report, fieldTags, detached, detachedHint }: FeedbackHoverCardProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=FeedbackHoverCard.d.ts.map