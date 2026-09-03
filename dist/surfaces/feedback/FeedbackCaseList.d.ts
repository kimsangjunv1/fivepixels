import type { ReportCase, ReportFeedback } from "../../shared/types/report.js";
import type { ElementMention } from "../../shared/types/mention.js";
type FeedbackCaseListProps = {
    report: Pick<ReportFeedback, "id" | "cases" | "replies" | "author_name">;
    cases: ReportCase[];
    isEditing?: boolean;
    canEdit?: boolean;
    isSaving?: boolean;
    errorMessage?: string;
    focusedCaseId?: string | null;
    onSelectCase?: (caseId: string) => void;
    onAllTabActiveChange?: (active: boolean) => void;
    onBeginEdit?: () => void;
    onCancelEdit?: () => void;
    onSaveEdit?: () => void;
    onCaseChange?: (caseId: string, text: string, mentions?: ElementMention[]) => void;
    onAddCase?: () => void;
    onRemoveCase?: (caseId: string) => void;
    enableElementMentions?: boolean;
};
export declare function FeedbackCaseList({ report, cases, isEditing, canEdit, isSaving, errorMessage, focusedCaseId, onSelectCase, onAllTabActiveChange, onBeginEdit, onCancelEdit, onSaveEdit, onCaseChange, onAddCase, onRemoveCase, enableElementMentions, }: FeedbackCaseListProps): import("react").JSX.Element;
export {};
//# sourceMappingURL=FeedbackCaseList.d.ts.map