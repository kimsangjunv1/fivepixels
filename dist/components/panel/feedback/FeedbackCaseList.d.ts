import type { ReportCase } from "../../../types/report.js";
type FeedbackCaseListProps = {
    cases: ReportCase[];
    isEditing?: boolean;
    canEdit?: boolean;
    isSaving?: boolean;
    errorMessage?: string;
    selectable?: boolean;
    selectedCaseIds?: string[];
    onToggleCaseSelection?: (caseId: string) => void;
    onBeginEdit?: () => void;
    onCancelEdit?: () => void;
    onSaveEdit?: () => void;
    onCaseChange?: (caseId: string, text: string) => void;
    onAddCase?: () => void;
    onRemoveCase?: (caseId: string) => void;
};
export declare function FeedbackCaseList({ cases, isEditing, canEdit, isSaving, errorMessage, selectable, selectedCaseIds, onToggleCaseSelection, onBeginEdit, onCancelEdit, onSaveEdit, onCaseChange, onAddCase, onRemoveCase, }: FeedbackCaseListProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=FeedbackCaseList.d.ts.map