import type { ReportCase } from "../../../types/report.js";
import { type FeedbackCategory } from "../../../constants/feedbackCategory.js";
type DraftComposerToolbarProps = {
    cases: ReportCase[];
    activeCaseId: string | null;
    onSelectCase: (caseId: string) => void;
    onAddCase: () => void;
    onRemoveCase: (caseId: string) => void;
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
export declare function DraftComposerToolbar({ cases, activeCaseId, onSelectCase, onAddCase, onRemoveCase, category, onCategoryChange, categoryNeedsAttention, onSubmit, isSubmitting, submitLabel, submittingLabel, showGitHubIssueOnCreate, onGitHubIssueSubmit, isGitHubIssueSubmitting, isGitHubIssueConfirming, onGitHubIssueConfirmingChange, }: DraftComposerToolbarProps): import("react").JSX.Element;
export {};
//# sourceMappingURL=DraftComposerToolbar.d.ts.map