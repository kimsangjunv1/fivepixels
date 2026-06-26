import type { ReportFeedback } from "@/types/report.js";
import type { MarkerDetachedKind } from "@/types/report-ui.js";
type FeedbackHoverCardProps = {
    report: ReportFeedback;
    fieldTags: {
        key: string;
        label: string;
    }[];
    detached?: boolean;
    detachedKind?: MarkerDetachedKind;
    detachedHint?: string;
    detachedModalHint?: string;
};
export declare function FeedbackHoverCard({ report, fieldTags, detached, detachedKind, detachedHint, detachedModalHint }: FeedbackHoverCardProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=FeedbackHoverCard.d.ts.map