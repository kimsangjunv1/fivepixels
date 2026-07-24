import { useState } from "react";
import type { ReportCase } from "@/types/report.js";
import { FEEDBACK_CATEGORIES, type FeedbackCategory } from "@/constants/feedbackCategory.js";
import { ChevronDownIcon, SendIcon } from "@/components/icons/Icons.js";
import { HoverTooltip } from "@/components/ui/HoverTooltip.js";
import { PanelDropdownMenu, PanelDropdownMenuItem } from "@/components/panel/PanelDropdownMenu.js";
import { useReportPreferences } from "@/providers/reportContext.js";

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
    showGitHubIssueOnCreate?: boolean;
    onGitHubIssueSubmit?: () => void;
    isGitHubIssueSubmitting?: boolean;
    isGitHubIssueConfirming?: boolean;
    onGitHubIssueConfirmingChange?: (confirming: boolean) => void;
};

const TOOLBAR_TRIGGER_CLASS =
    "inline-flex h-[28px] max-w-[140px] items-center gap-[4px] rounded-[8px] px-[8px] text-[12px] font-semibold text-[var(--adaptive-black600)] transition-colors hover:bg-[var(--adaptive-tintOpacity100)] hover:text-[var(--adaptive-black900)]";

function truncateLabel(text: string, fallback: string) {
    const trimmed = text.trim();

    if (!trimmed) {
        return fallback;
    }

    return trimmed.length > 18 ? `${trimmed.slice(0, 18)}…` : trimmed;
}

export function DraftComposerToolbar({
    cases,
    activeCaseId,
    onSelectCase,
    onAddCase,
    onRemoveCase,
    category,
    onCategoryChange,
    categoryNeedsAttention = false,
    onSubmit,
    isSubmitting = false,
    showGitHubIssueOnCreate = false,
    onGitHubIssueSubmit,
    isGitHubIssueSubmitting = false,
    isGitHubIssueConfirming = false,
    onGitHubIssueConfirmingChange,
}: DraftComposerToolbarProps) {
    const { messages } = useReportPreferences();
    const [casesOpen, setCasesOpen] = useState(false);
    const [categoryOpen, setCategoryOpen] = useState(false);
    const isActionDisabled = isSubmitting || isGitHubIssueSubmitting;
    const activeCaseIndex = Math.max(
        0,
        cases.findIndex((item) => item.id === activeCaseId),
    );
    const activeCase = cases[activeCaseIndex] ?? cases[0] ?? null;
    const casesLabel = activeCase ? truncateLabel(activeCase.text, messages.composer.caseTabLabel(activeCaseIndex + 1)) : messages.composer.casesDropdownLabel;
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

    return (
        <div className="flex shrink-0 items-center gap-[6px] px-[8px] py-[6px]">
            <HoverTooltip label={messages.composer.addCase}>
                <button
                    type="button"
                    data-fivepixels-interactive=""
                    onClick={onAddCase}
                    disabled={isActionDisabled}
                    aria-label={messages.composer.addCaseTabAriaLabel}
                    className="inline-flex h-[28px] w-[28px] shrink-0 items-center justify-center rounded-[8px] text-[18px] font-medium leading-none text-[var(--adaptive-black600)] transition-colors hover:bg-[var(--adaptive-tintOpacity100)] hover:text-[var(--adaptive-black900)] disabled:opacity-50"
                >
                    +
                </button>
            </HoverTooltip>

            <span
                className="h-[14px] w-px shrink-0 bg-[var(--adaptive-border-subtle)]"
                aria-hidden
            />

            <PanelDropdownMenu
                open={casesOpen}
                onClose={() => setCasesOpen(false)}
                align="left"
                menuClassName="min-w-[180px] rounded-[10px]"
                trigger={
                    <button
                        type="button"
                        data-fivepixels-interactive=""
                        aria-expanded={casesOpen}
                        aria-label={messages.composer.casesDropdownAriaLabel}
                        disabled={isActionDisabled}
                        onClick={() => {
                            setCategoryOpen(false);
                            setCasesOpen((current) => !current);
                        }}
                        className={`${TOOLBAR_TRIGGER_CLASS} disabled:opacity-50`}
                    >
                        <span className="min-w-0 truncate">{casesLabel}</span>
                        <ChevronDownIcon className="h-[12px] w-[12px] shrink-0" />
                    </button>
                }
            >
                {cases.map((item, index) => {
                    const isActive = item.id === activeCaseId;

                    return (
                        <div
                            key={item.id}
                            className="flex items-stretch"
                        >
                            <PanelDropdownMenuItem
                                active={isActive}
                                onClick={() => {
                                    onSelectCase(item.id);
                                    setCasesOpen(false);
                                }}
                            >
                                <span className="min-w-0 flex-1 truncate">{truncateLabel(item.text, messages.composer.caseTabLabel(index + 1))}</span>
                            </PanelDropdownMenuItem>
                            {cases.length > 1 ? (
                                <button
                                    type="button"
                                    data-fivepixels-interactive=""
                                    onClick={() => {
                                        onRemoveCase(item.id);
                                        if (cases.length <= 2) {
                                            setCasesOpen(false);
                                        }
                                    }}
                                    aria-label={messages.composer.removeCaseAriaLabel(index + 1)}
                                    className="inline-flex w-[28px] shrink-0 items-center justify-center text-[14px] text-[var(--adaptive-black500)] hover:bg-[var(--adaptive-black100)] hover:text-[var(--adaptive-black900)]"
                                >
                                    ×
                                </button>
                            ) : null}
                        </div>
                    );
                })}
            </PanelDropdownMenu>

            <PanelDropdownMenu
                open={categoryOpen}
                onClose={() => setCategoryOpen(false)}
                align="left"
                menuClassName="min-w-[140px] rounded-[10px]"
                trigger={
                    <button
                        type="button"
                        data-fivepixels-interactive=""
                        aria-expanded={categoryOpen}
                        aria-label={messages.composer.categoryAriaLabel}
                        aria-invalid={categoryNeedsAttention || undefined}
                        disabled={isActionDisabled}
                        onClick={() => {
                            setCasesOpen(false);
                            setCategoryOpen((current) => !current);
                        }}
                        className={`${TOOLBAR_TRIGGER_CLASS} disabled:opacity-50 ` + (categoryNeedsAttention ? "fivepixels-validation-attention text-rose-500 hover:text-rose-600" : "")}
                    >
                        <span className="min-w-0 truncate">{categoryLabel}</span>
                        <ChevronDownIcon className="h-[12px] w-[12px] shrink-0" />
                    </button>
                }
            >
                {FEEDBACK_CATEGORIES.map((item) => (
                    <PanelDropdownMenuItem
                        key={item}
                        active={category === item}
                        onClick={() => {
                            onCategoryChange(item);
                            setCategoryOpen(false);
                        }}
                    >
                        {messages.composer.categoryOption[item]}
                    </PanelDropdownMenuItem>
                ))}
            </PanelDropdownMenu>

            <div className="min-w-[8px] flex-1" />

            {showGitHubIssueOnCreate && onGitHubIssueSubmit ? (
                <button
                    type="button"
                    data-fivepixels-interactive=""
                    disabled={isActionDisabled}
                    onClick={handleGitHubIssueClick}
                    className="inline-flex h-[28px] items-center justify-center rounded-full border border-[var(--adaptive-border-subtle)] px-[10px] text-[12px] font-semibold text-[var(--adaptive-black500)] disabled:opacity-50"
                    aria-label={isGitHubIssueConfirming ? messages.feedbackList.gitIssueConfirmAriaLabel : messages.composer.gitIssueSendAriaLabel}
                    title={isGitHubIssueConfirming ? messages.feedbackList.gitIssueConfirmTitle : messages.composer.gitIssueSendTitle}
                >
                    + {isGitHubIssueSubmitting ? messages.composer.gitIssueSendingLabel : isGitHubIssueConfirming ? messages.feedbackList.gitIssueConfirmLabel : messages.composer.gitIssueSendLabel}
                </button>
            ) : null}

            <HoverTooltip
                label={messages.composer.draftComplete}
                disabled={isActionDisabled}
            >
                <button
                    type="button"
                    data-fivepixels-interactive=""
                    disabled={isActionDisabled}
                    onClick={onSubmit}
                    className="inline-flex h-[32px] w-[32px] shrink-0 items-center justify-center rounded-full bg-[var(--adaptive-black900)] text-[var(--adaptive-black50)] disabled:opacity-50"
                    aria-label={isSubmitting ? messages.composer.draftCompleting : messages.composer.draftComplete}
                >
                    <SendIcon className="h-[14px] w-[14px]" />
                </button>
            </HoverTooltip>
        </div>
    );
}
