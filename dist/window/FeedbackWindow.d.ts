import type { Marker } from "../types/report-ui.js";
import type { ReportFeedback } from "../types/report.js";
type FeedbackWindowProps = {
    report: ReportFeedback;
    anchor: Pick<Marker, "left" | "top">;
    isFocused: boolean;
};
export declare function FeedbackWindow({ report, anchor, isFocused }: FeedbackWindowProps): import("react").JSX.Element;
export {};
//# sourceMappingURL=FeedbackWindow.d.ts.map