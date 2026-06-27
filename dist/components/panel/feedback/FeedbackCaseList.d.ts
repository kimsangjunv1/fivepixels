import type { ReportCase, ReportFeedback } from "../../../types/report.js";
type FeedbackCaseListProps = {
    report: Pick<ReportFeedback, "cases" | "replies" | "author_name">;
    cases: ReportCase[];
    isEditing?: boolean;
    canEdit?: boolean;
    isSaving?: boolean;
    errorMessage?: string;
    selectable?: boolean;
    focusedCaseId?: string | null;
    onSelectCase?: (caseId: string) => void;
    onBeginEdit?: () => void;
    onCancelEdit?: () => void;
    onSaveEdit?: () => void;
    onCaseChange?: (caseId: string, text: string) => void;
    onAddCase?: () => void;
    onRemoveCase?: (caseId: string) => void;
};
export declare function FeedbackCaseList({ report, cases, isEditing, canEdit, isSaving, errorMessage, selectable, focusedCaseId, onSelectCase, onBeginEdit, onCancelEdit, onSaveEdit, onCaseChange, onAddCase, onRemoveCase, }: FeedbackCaseListProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=FeedbackCaseList.d.ts.map