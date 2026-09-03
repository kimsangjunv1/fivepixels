import type { Marker } from "../../shared/types/report-ui.js";
import type { ReportFeedback } from "../../shared/types/report.js";
type FeedbackWindowProps = {
    report: ReportFeedback;
    anchor: Pick<Marker, "left" | "top">;
    isFocused: boolean;
};
export declare function FeedbackWindow({ report, anchor, isFocused }: FeedbackWindowProps): import("react").JSX.Element;
export {};
//# sourceMappingURL=FeedbackWindow.d.ts.map