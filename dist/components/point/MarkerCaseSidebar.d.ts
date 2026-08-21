import type { ReportFeedback } from "../../types/report.js";
type MarkerCaseSidebarProps = {
    report: ReportFeedback;
    focusedCaseId: string | null;
    isComposingNewCase?: boolean;
    composingCaseTitle?: string;
    onSelectCase: (caseId: string) => void;
    onSelectComposingCase?: () => void;
};
export declare function MarkerCaseSidebar({ report, focusedCaseId, isComposingNewCase, composingCaseTitle, onSelectCase, onSelectComposingCase, }: MarkerCaseSidebarProps): import("react").JSX.Element;
export {};
//# sourceMappingURL=MarkerCaseSidebar.d.ts.map