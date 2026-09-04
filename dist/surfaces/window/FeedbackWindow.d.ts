import type { Marker } from "../../shared/types/report-ui.js";
import type { ReportFeedback } from "../../shared/types/report.js";
type FeedbackWindowProps = {
    report: ReportFeedback;
    anchor: Pick<Marker, "left" | "top">;
    isFocused: boolean;
    /** Render the production window inside a bounded preview instead of at viewport coordinates. */
    embedded?: boolean;
};
export declare function FeedbackWindow({ report, anchor, isFocused, embedded }: FeedbackWindowProps): import("react").JSX.Element;
export {};
//# sourceMappingURL=FeedbackWindow.d.ts.map