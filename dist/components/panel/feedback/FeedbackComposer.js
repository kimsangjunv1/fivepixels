import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useMemo, useState } from "react";
import { useReportPreferences } from "../../../providers/reportContext.js";
import { SendIcon } from "../../../components/icons/Icons.js";
import { AuthorSelector } from "./AuthorSelector.js";
import { HoverTooltip } from "../../../components/ui/HoverTooltip.js";
import { FeedbackCategorySelector } from "./FeedbackCategorySelector.js";
import { FeedbackCaseEditor } from "./FeedbackCaseEditor.js";
function isCaseTextErrorMessage(errorMessage, caseCount, caseTextRequired, casesRequired) {
    if (!errorMessage) {
        return false;
    }
    if (errorMessage === casesRequired) {
        return true;
    }
    for (let index = 1; index <= Math.max(caseCount, 1); index += 1) {
        if (errorMessage === caseTextRequired(index)) {
            return true;
        }
    }
    return false;
}
export function FeedbackComposer({ message = "", onMessageChange, cases, onCaseChange, onAddCase, onRemoveCase, authorName, onAuthorNameChange, authors, fields: _fields, fieldValues: _fieldValues, onFieldChange: _onFieldChange, category = null, onCategoryChange, showCategory = false, showTags: _showTags = false, onSubmit, isSubmitting = false, showGitHubIssueOnCreate = false, onGitHubIssueSubmit, isGitHubIssueSubmitting = false, placeholder, autoFocus = false, errorMessage = "", showAskQuestionToggle = false, askQuestionChecked = false, onAskQuestionChange, askQuestionForced = false, hideAuthorSelector = false, lockedAuthorName, onFooterWarningChange, }) {
    const { messages } = useReportPreferences();
    const [isGitHubIssueConfirming, setIsGitHubIssueConfirming] = useState(false);
    const [categoryAttentionKey, setCategoryAttentionKey] = useState(0);
    const [caseAttentionKey, setCaseAttentionKey] = useState(0);
    const isQuestionMode = askQuestionForced || askQuestionChecked;
    const usesCaseEditor = Boolean(cases && onCaseChange && onAddCase && onRemoveCase);
    const resolvedPlaceholder = isQuestionMode ? messages.composer.questionPlaceholder : (placeholder ?? (usesCaseEditor ? messages.fieldEditor.messagePlaceholder : messages.composer.placeholder));
    const emptyCaseIds = useMemo(() => (cases ?? []).filter((item) => !item.text.trim()).map((item) => item.id), [cases]);
    const hasEmptyCase = emptyCaseIds.length > 0;
    const isCategoryRequiredError = errorMessage === messages.errors.categoryRequired;
    const isEmptyCaseError = isCaseTextErrorMessage(errorMessage, cases?.length ?? 0, messages.errors.caseTextRequired, messages.errors.casesRequired);
    const categoryNeedsAttention = showCategory && !category && !hasEmptyCase && (categoryAttentionKey > 0 || isCategoryRequiredError);
    const caseNeedsAttention = usesCaseEditor && hasEmptyCase && (caseAttentionKey > 0 || isEmptyCaseError);
    const footerWarning = caseNeedsAttention
        ? messages.errors.emptyCaseMessageRequired
        : categoryNeedsAttention
            ? messages.errors.categoryRequired
            : null;
    const isFooterHandledError = isCategoryRequiredError || isEmptyCaseError;
    const isActionDisabled = isSubmitting || isGitHubIssueSubmitting;
    useEffect(() => {
        onFooterWarningChange?.(footerWarning);
    }, [footerWarning, onFooterWarningChange]);
    useEffect(() => {
        if (!isGitHubIssueConfirming) {
            return;
        }
        const timer = window.setTimeout(() => setIsGitHubIssueConfirming(false), 1500);
        return () => window.clearTimeout(timer);
    }, [isGitHubIssueConfirming]);
    useEffect(() => {
        if (!isEmptyCaseError || !usesCaseEditor || !hasEmptyCase) {
            return;
        }
        setCaseAttentionKey((current) => current + 1);
    }, [isEmptyCaseError, usesCaseEditor, hasEmptyCase, errorMessage]);
    useEffect(() => {
        if (!isCategoryRequiredError || !showCategory || category || hasEmptyCase) {
            return;
        }
        setCategoryAttentionKey((current) => current + 1);
    }, [isCategoryRequiredError, showCategory, category, hasEmptyCase, errorMessage]);
    useEffect(() => {
        if (!hasEmptyCase && caseAttentionKey > 0) {
            setCaseAttentionKey(0);
        }
    }, [hasEmptyCase, caseAttentionKey]);
    useEffect(() => {
        if (category && categoryAttentionKey > 0) {
            setCategoryAttentionKey(0);
        }
    }, [category, categoryAttentionKey]);
    const bumpValidationAttention = () => {
        if (usesCaseEditor && hasEmptyCase) {
            setCaseAttentionKey((current) => current + 1);
            return;
        }
        if (showCategory && !category) {
            setCategoryAttentionKey((current) => current + 1);
        }
    };
    const handleSubmit = () => {
        if (isActionDisabled) {
            return;
        }
        bumpValidationAttention();
        onSubmit();
    };
    const handleGitHubIssueSubmit = () => {
        if (isActionDisabled || !onGitHubIssueSubmit) {
            return;
        }
        if (!isGitHubIssueConfirming) {
            setIsGitHubIssueConfirming(true);
            return;
        }
        bumpValidationAttention();
        setIsGitHubIssueConfirming(false);
        onGitHubIssueSubmit();
    };
    return (_jsxs("div", { className: `flex w-full flex-col bg-[var(--adaptive-fillOpacity400)] backdrop-blur-sm ${usesCaseEditor ? "min-h-0 flex-1" : ""}`, children: [_jsxs("div", { className: `relative ${usesCaseEditor ? "min-h-0 flex-1" : ""}`, children: [errorMessage && !isFooterHandledError ? (_jsx("p", { role: "alert", className: "absolute bottom-full left-[8px] right-[8px] z-10 mb-[6px] rounded-[8px] border border-rose-200 bg-rose-50 px-[8px] py-[4px] text-[12px] leading-[1.4] text-rose-700 shadow-[0_2px_8px_rgba(0,0,0,0.08)]", children: errorMessage })) : null, usesCaseEditor ? (_jsx(FeedbackCaseEditor, { cases: cases, onCaseChange: onCaseChange, onAddCase: onAddCase, onRemoveCase: onRemoveCase, autoFocus: autoFocus, onSubmitShortcut: handleSubmit, needsAttention: caseNeedsAttention, attentionKey: caseAttentionKey, emptyCaseIds: emptyCaseIds })) : (_jsx("textarea", { autoFocus: autoFocus, value: message, onChange: (event) => onMessageChange?.(event.target.value), placeholder: resolvedPlaceholder, rows: 3, className: "min-h-[72px] w-full resize-none bg-transparent px-[12px] pt-[12px] text-[14px] leading-[1.5] text-[var(--adaptive-text-primary)] outline-none placeholder:text-[var(--adaptive-text-muted)]", onKeyDown: (event) => {
                            if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
                                event.preventDefault();
                                handleSubmit();
                            }
                        } }))] }), _jsxs("div", { className: `flex items-center gap-[8px] px-[8px] pb-[8px] ${hideAuthorSelector && !lockedAuthorName ? "justify-end" : "justify-between"}`, children: [hideAuthorSelector ? (lockedAuthorName ? (_jsx("span", { className: "flex h-[24px] min-w-0 max-w-[50%] items-center truncate rounded-full bg-[var(--adaptive-surface-muted)] px-[12px] text-[12px] text-[var(--adaptive-black500)]", children: lockedAuthorName })) : null) : (_jsx(AuthorSelector, { authors: authors, value: authorName, onChange: onAuthorNameChange })), _jsxs("div", { className: "flex shrink-0 items-center gap-[6px]", children: [showAskQuestionToggle ? (_jsxs("label", { className: "inline-flex items-center gap-[4px] px-[2px] text-[12px] text-[var(--adaptive-black600)]", children: [_jsx("input", { type: "checkbox", "data-fivepixels-interactive": "", checked: isQuestionMode, disabled: askQuestionForced || isActionDisabled, onChange: (event) => onAskQuestionChange?.(event.target.checked), className: "h-[14px] w-[14px] accent-[var(--adaptive-blue500)]" }), _jsx("span", { children: messages.composer.askQuestionLabel })] })) : null, showGitHubIssueOnCreate ? (_jsx("button", { type: "button", "data-fivepixels-interactive": "", disabled: isActionDisabled, onClick: handleGitHubIssueSubmit, className: "inline-flex h-[24px] items-center justify-center gap-[4px] rounded-full border border-[var(--adaptive-border-subtle)] px-[12px] py-[4px] disabled:opacity-50", "aria-label": isGitHubIssueConfirming ? messages.feedbackList.gitIssueConfirmAriaLabel : messages.composer.gitIssueSendAriaLabel, title: isGitHubIssueConfirming ? messages.feedbackList.gitIssueConfirmTitle : messages.composer.gitIssueSendTitle, children: _jsxs("span", { className: "text-[12px] font-semibold text-[var(--adaptive-black500)]", children: ["+", " ", isGitHubIssueSubmitting
                                            ? messages.composer.gitIssueSendingLabel
                                            : isGitHubIssueConfirming
                                                ? messages.feedbackList.gitIssueConfirmLabel
                                                : messages.composer.gitIssueSendLabel] }) })) : null, _jsx(HoverTooltip, { label: messages.composer.sendAriaLabel, disabled: isActionDisabled, children: _jsx("button", { type: "button", "data-fivepixels-interactive": "", disabled: isActionDisabled, onClick: handleSubmit, className: "inline-flex h-[32px] w-[32px] shrink-0 items-center justify-center rounded-full bg-[var(--adaptive-blue500)] text-white disabled:opacity-50", "aria-label": messages.composer.sendAriaLabel, children: _jsx(SendIcon, { className: "h-[16px] w-[16px]" }) }) })] })] }), showCategory && onCategoryChange ? (_jsx(FeedbackCategorySelector, { value: category, onChange: onCategoryChange, messages: messages, needsAttention: categoryNeedsAttention, attentionKey: categoryAttentionKey })) : null] }));
}
//# sourceMappingURL=FeedbackComposer.js.map