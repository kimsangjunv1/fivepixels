import type { ReportCase } from "../../shared/types/report.js";
import { type FeedbackCategory } from "../../shared/constants/feedbackCategory.js";
type FeedbackToolbarProps = {
    variant?: "feedback";
    cases: ReportCase[];
    activeCaseId: string | null;
    onSelectCase: (caseId: string) => void;
    onAddCase: () => void;
    onRemoveCase: (caseId: string) => void;
    onInsertAtMention?: () => void;
    category: FeedbackCategory | null;
    onCategoryChange: (value: FeedbackCategory) => void;
    categoryNeedsAttention?: boolean;
    onSubmit: () => void;
    isSubmitting?: boolean;
    submitLabel?: string;
    submittingLabel?: string;
    showGitHubIssueOnCreate?: boolean;
    onGitHubIssueSubmit?: () => void;
    isGitHubIssueSubmitting?: boolean;
    isGitHubIssueConfirming?: boolean;
    onGitHubIssueConfirmingChange?: (confirming: boolean) => void;
};
type MemoToolbarProps = {
    variant: "memo";
    onSave: () => void;
    onCancel: () => void;
    onDelete?: () => void;
    canDelete?: boolean;
    canSave?: boolean;
};
export type DraftComposerToolbarProps = FeedbackToolbarProps | MemoToolbarProps;
export declare function DraftComposerToolbar(props: DraftComposerToolbarProps): import("react").JSX.Element;
export {};
//# sourceMappingURL=DraftComposerToolbar.d.ts.map