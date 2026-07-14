import type { Marker } from "../../types/report-ui.js";
import type { ReportFeedback } from "../../types/report.js";
type MarkerFeedbackWindowProps = {
    report: ReportFeedback;
    anchor: Pick<Marker, "left" | "top">;
};
export declare function MarkerFeedbackWindow({ report, anchor }: MarkerFeedbackWindowProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=MarkerFeedbackWindow.d.ts.map