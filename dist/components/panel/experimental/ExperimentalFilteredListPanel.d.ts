import type { ReportFeedback } from "../../../types/report.js";
type ExperimentalFilteredListPanelProps = {
    title: string;
    filter: (reports: ReportFeedback[], actorName: string | null) => ReportFeedback[];
};
export declare function ExperimentalFilteredListPanel({ title, filter }: ExperimentalFilteredListPanelProps): import("react").JSX.Element;
export {};
//# sourceMappingURL=ExperimentalFilteredListPanel.d.ts.map