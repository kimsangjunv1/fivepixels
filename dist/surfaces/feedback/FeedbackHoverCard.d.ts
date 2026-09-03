import type { ReportFeedback } from "../../shared/types/report.js";
import type { MarkerDetachedKind } from "../../shared/types/report-ui.js";
type FeedbackHoverCardProps = {
    report: ReportFeedback;
    detached?: boolean;
    detachedKind?: MarkerDetachedKind;
    detachedHint?: string;
    detachedModalHint?: string;
};
export declare function FeedbackHoverCard({ report, detached, detachedKind, detachedHint, detachedModalHint }: FeedbackHoverCardProps): import("react").JSX.Element;
export {};
//# sourceMappingURL=FeedbackHoverCard.d.ts.map