import type { ReportFeedback } from "../../types/report.js";
type MarkerCaseSidebarProps = {
    report: ReportFeedback;
    focusedCaseId: string | null;
    onSelectCase: (caseId: string) => void;
};
export declare function MarkerCaseSidebar({ report, focusedCaseId, onSelectCase }: MarkerCaseSidebarProps): import("react").JSX.Element;
export {};
//# sourceMappingURL=MarkerCaseSidebar.d.ts.map