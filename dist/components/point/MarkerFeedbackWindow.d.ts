import type { Marker } from "../../types/report-ui.js";
import type { ReportFeedback } from "../../types/report.js";
type MarkerFeedbackWindowProps = {
    report: ReportFeedback;
    anchor: Pick<Marker, "left" | "top">;
    isFocused: boolean;
};
export declare function MarkerFeedbackWindow({ report, anchor, isFocused }: MarkerFeedbackWindowProps): import("react").JSX.Element;
export {};
//# sourceMappingURL=MarkerFeedbackWindow.d.ts.map