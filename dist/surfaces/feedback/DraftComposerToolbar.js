import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { SELECTABLE_FEEDBACK_CATEGORIES } from "../../shared/constants/feedbackCategory.js";
import { ChevronDownIcon, SendIcon } from "../../shared/components/icons/Icons.js";
import { HoverTooltip } from "../../surfaces/tooltip/HoverTooltip.js";
import { DropdownMenu, DropdownMenuItem } from "../../shared/components/ui/DropdownMenu.js";
import { useReportPreferences } from "../../shared/providers/reportContext.js";
import { mentionMessageToPlainText } from "../../shared/utils/mention/elementMentions.js";
const TOOLBAR_TRIGGER_CLASS = "inline-flex max-w-[140px] items-center gap-[4px] rounded-[8px] py-[2px] px-[4px] text-[12px] font-semibold text-[var(--adaptive-black600)] transition-colors hover:bg-[var(--adaptive-tintOpacity100)] hover:text-[var(--adaptive-black900)]";
function truncateLabel(text, fallback) {
    const trimmed = text.trim();
    if (!trimmed) {
        return fallback;
    }
    return trimmed.length > 18 ? `${trimmed.slice(0, 18)}…` : trimmed;
}
function MemoComposerToolbar({ onSave, onCancel, onDelete, canDelete = false, canSave = false }) {
    const { messages } = useReportPreferences();
    return (_jsxs("div", { className: "flex shrink-0 items-center gap-[6px] px-[8px] py-[6px]", children: [canDelete && onDelete ? (_jsx("button", { type: "button", "data-fivepixels-interactive": "", onClick: onDelete, className: "rounded-[8px] px-[8px] py-[4px] text-[12px] font-semibold text-[var(--adaptive-accent-red)] transition-colors hover:bg-[color-mix(in_srgb,var(--adaptive-accent-red)_10%,transparent)]", children: messages.pickTarget.memoComposerDelete })) : null, _jsx("div", { className: "min-w-[8px] flex-1" }), _jsx("button", { type: "button", "data-fivepixels-interactive": "", onClick: onCancel, className: "rounded-[8px] px-[8px] py-[4px] text-[12px] font-semibold text-[var(--adaptive-black600)] transition-colors hover:bg-[var(--adaptive-tintOpacity100)] hover:text-[var(--adaptive-black900)]", children: messages.common.cancel }), _jsx("button", { type: "button", "data-fivepixels-interactive": "", onClick: onSave, disabled: !canSave, className: "inline-flex h-[32px] shrink-0 items-center justify-center rounded-full bg-[var(--adaptive-black900)] px-[12px] text-[12px] font-semibold text-[var(--adaptive-black50)] hover:bg-[var(--adaptive-blue400)] disabled:opacity-50", children: messages.pickTarget.memoComposerSave })] }));
}
function FeedbackComposerToolbar({ cases, activeCaseId, onSelectCase, onAddCase, onRemoveCase, category, onCategoryChange, categoryNeedsAttention = false, onSubmit, isSubmitting = false, submitLabel, submittingLabel, showGitHubIssueOnCreate = false, onGitHubIssueSubmit, isGitHubIssueSubmitting = false, isGitHubIssueConfirming = false, onGitHubIssueConfirmingChange, }) {
    const { messages } = useReportPreferences();
    const [casesOpen, setCasesOpen] = useState(false);
    const [categoryOpen, setCategoryOpen] = useState(false);
    const isActionDisabled = isSubmitting || isGitHubIssueSubmitting;
    const resolvedSubmitLabel = submitLabel ?? messages.composer.draftComplete;
    const resolvedSubmittingLabel = submittingLabel ?? messages.composer.draftCompleting;
    const activeCaseIndex = Math.max(0, cases.findIndex((item) => item.id === activeCaseId));
    const activeCase = cases[activeCaseIndex] ?? cases[0] ?? null;
    const casesLabel = activeCase
        ? truncateLabel(mentionMessageToPlainText(activeCase.text, activeCase.mentions), messages.composer.caseTabLabel(activeCaseIndex + 1))
        : messages.composer.casesDropdownLabel;
    const categoryLabel = category ? messages.composer.categoryOption[category] : messages.composer.categoryLabel;
    const handleGitHubIssueClick = () => {
        if (isActionDisabled || !onGitHubIssueSubmit) {
            return;
        }
        if (!isGitHubIssueConfirming) {
            onGitHubIssueConfirmingChange?.(true);
            return;
        }
        onGitHubIssueConfirmingChange?.(false);
        onGitHubIssueSubmit();
    };
    return (_jsxs("div", { className: "flex shrink-0 items-center gap-[6px] px-[8px] py-[6px]", children: [_jsx(HoverTooltip, { label: messages.composer.addCase, children: _jsx("button", { type: "button", "data-fivepixels-interactive": "", onClick: onAddCase, disabled: isActionDisabled, "aria-label": messages.composer.addCaseTabAriaLabel, className: "inline-flex h-[28px] w-[28px] shrink-0 items-center justify-center rounded-[8px] text-[18px] font-medium leading-none text-[var(--adaptive-black600)] transition-colors hover:bg-[var(--adaptive-tintOpacity100)] hover:text-[var(--adaptive-black900)] disabled:opacity-50", children: "+" }) }), _jsxs("section", { className: "flex flex-col gap-[4px]", children: [_jsxs("section", { className: "flex items-center", children: [_jsx("p", { className: "text-[12px] text-[var(--adaptive-black500)]", children: "case" }), _jsx(DropdownMenu, { open: casesOpen, onClose: () => setCasesOpen(false), align: "left", menuClassName: "min-w-[180px] rounded-[10px]", trigger: _jsxs("button", { type: "button", "data-fivepixels-interactive": "", "aria-expanded": casesOpen, "aria-label": messages.composer.casesDropdownAriaLabel, disabled: isActionDisabled, onClick: () => {
                                        setCategoryOpen(false);
                                        setCasesOpen((current) => !current);
                                    }, className: `${TOOLBAR_TRIGGER_CLASS} disabled:opacity-50`, children: [_jsx("span", { className: "min-w-0 truncate text-[12px]", children: casesLabel }), _jsx(ChevronDownIcon, { className: "h-[12px] w-[12px] shrink-0" })] }), children: cases.map((item, index) => {
                                    const isActive = item.id === activeCaseId;
                                    return (_jsxs("div", { className: "flex items-stretch", children: [_jsx(DropdownMenuItem, { active: isActive, onClick: () => {
                                                    onSelectCase(item.id);
                                                    setCasesOpen(false);
                                                }, children: _jsx("span", { className: "min-w-0 flex-1 truncate", children: truncateLabel(mentionMessageToPlainText(item.text, item.mentions), messages.composer.caseTabLabel(index + 1)) }) }), cases.length > 1 ? (_jsx("button", { type: "button", "data-fivepixels-interactive": "", onClick: () => {
                                                    onRemoveCase(item.id);
                                                    if (cases.length <= 2) {
                                                        setCasesOpen(false);
                                                    }
                                                }, "aria-label": messages.composer.removeCaseAriaLabel(index + 1), className: "inline-flex w-[28px] shrink-0 items-center justify-center text-[14px] text-[var(--adaptive-black500)] hover:bg-[var(--adaptive-black100)] hover:text-[var(--adaptive-black900)]", children: "\u00D7" })) : null] }, item.id));
                                }) })] }), _jsxs("section", { className: "flex items-center", children: [_jsx("p", { className: "text-[12px] text-[var(--adaptive-black500)]", children: "category" }), _jsx(DropdownMenu, { open: categoryOpen, onClose: () => setCategoryOpen(false), align: "left", menuClassName: "min-w-[140px] rounded-[10px]", trigger: _jsxs("button", { type: "button", "data-fivepixels-interactive": "", "aria-expanded": categoryOpen, "aria-label": messages.composer.categoryAriaLabel, "aria-invalid": categoryNeedsAttention || undefined, disabled: isActionDisabled, onClick: () => {
                                        setCasesOpen(false);
                                        setCategoryOpen((current) => !current);
                                    }, className: `${TOOLBAR_TRIGGER_CLASS} disabled:opacity-50 ` + (categoryNeedsAttention ? "fivepixels-validation-attention text-rose-500 hover:text-rose-600" : ""), children: [_jsx("span", { className: "min-w-0 truncate text-[12px]", children: categoryLabel }), _jsx(ChevronDownIcon, { className: "h-[12px] w-[12px] shrink-0" })] }), children: SELECTABLE_FEEDBACK_CATEGORIES.map((item) => (_jsx(DropdownMenuItem, { active: category === item, onClick: () => {
                                        onCategoryChange(item);
                                        setCategoryOpen(false);
                                    }, children: messages.composer.categoryOption[item] }, item))) })] })] }), _jsx("div", { className: "min-w-[8px] flex-1" }), showGitHubIssueOnCreate && onGitHubIssueSubmit ? (_jsxs("button", { type: "button", "data-fivepixels-interactive": "", disabled: isActionDisabled, onClick: handleGitHubIssueClick, className: "inline-flex h-[28px] items-center justify-center rounded-full border border-[var(--adaptive-border-subtle)] px-[10px] text-[12px] font-semibold text-[var(--adaptive-black500)] disabled:opacity-50", "aria-label": isGitHubIssueConfirming ? messages.feedbackList.gitIssueConfirmAriaLabel : messages.composer.gitIssueSendAriaLabel, title: isGitHubIssueConfirming ? messages.feedbackList.gitIssueConfirmTitle : messages.composer.gitIssueSendTitle, children: ["+ ", isGitHubIssueSubmitting ? messages.composer.gitIssueSendingLabel : isGitHubIssueConfirming ? messages.feedbackList.gitIssueConfirmLabel : messages.composer.gitIssueSendLabel] })) : null, _jsx(HoverTooltip, { label: resolvedSubmitLabel, disabled: isActionDisabled, children: _jsx("button", { type: "button", "data-fivepixels-interactive": "", disabled: isActionDisabled, onClick: onSubmit, className: "inline-flex h-[32px] w-[32px] shrink-0 items-center justify-center rounded-full bg-[var(--adaptive-black900)] hover:bg-[var(--adaptive-blue400)] text-[var(--adaptive-black50)] disabled:opacity-50", "aria-label": isSubmitting ? resolvedSubmittingLabel : resolvedSubmitLabel, children: _jsx(SendIcon, { className: "h-[18px] w-[18px] invert pointer-events-none" }) }) })] }));
}
export function DraftComposerToolbar(props) {
    if (props.variant === "memo") {
        return (_jsx(MemoComposerToolbar, { onSave: props.onSave, onCancel: props.onCancel, onDelete: props.onDelete, canDelete: props.canDelete, canSave: props.canSave }));
    }
    return _jsx(FeedbackComposerToolbar, { ...props });
}
//# sourceMappingURL=DraftComposerToolbar.js.map