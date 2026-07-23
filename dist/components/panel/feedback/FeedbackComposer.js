import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useReportPreferences } from "../../../providers/reportContext.js";
import { CloseIcon, AskActionIcon, DeniedActionIcon, CompleteActionIcon, SendIcon } from "../../../components/icons/Icons.js";
import { HoverTooltip } from "../../../components/ui/HoverTooltip.js";
import { FeedbackCategorySelector } from "./FeedbackCategorySelector.js";
import { FeedbackCaseEditor } from "./FeedbackCaseEditor.js";
import { resolveComposerModeActionKind, THREAD_ACTION_STYLE } from "../../../constants/threadActionStyles.js";
const REPLY_TEXTAREA_MIN_HEIGHT = 56;
const REPLY_TEXTAREA_MAX_HEIGHT = 200;
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
function getComposerModeLabel(mode, messages) {
    const kind = resolveComposerModeActionKind(mode);
    if (kind === "ask") {
        return messages.composer.modeTag.ask;
    }
    if (kind === "denied") {
        return messages.composer.modeTag.denied;
    }
    return messages.composer.modeTag.complete;
}
function ComposerModeIcon({ mode, className }) {
    const kind = resolveComposerModeActionKind(mode);
    const color = THREAD_ACTION_STYLE[kind].color;
    if (kind === "ask") {
        return (_jsx(AskActionIcon, { className: className, fill: color }));
    }
    if (kind === "denied") {
        return (_jsx(DeniedActionIcon, { className: className, fill: color }));
    }
    return (_jsx(CompleteActionIcon, { className: className, fill: color }));
}
function ComposerModeTag({ mode, messages, onDismiss }) {
    const kind = resolveComposerModeActionKind(mode);
    const style = THREAD_ACTION_STYLE[kind];
    return (_jsxs("span", { className: `inline-flex h-[22px] shrink-0 items-center gap-[4px] rounded-full px-[8px] text-[12px] font-semibold ${style.tagBg} ${style.tagText}`, style: { color: style.color }, children: [_jsx(ComposerModeIcon, { mode: mode, className: "h-[12px] w-[12px]" }), _jsx("span", { style: { color: style.color }, children: getComposerModeLabel(mode, messages) }), onDismiss ? (_jsx("button", { type: "button", "data-fivepixels-interactive": "", onClick: onDismiss, "aria-label": messages.composer.modeTagDismissAriaLabel, className: `ml-[2px] inline-flex h-[14px] w-[14px] items-center justify-center rounded-full ${style.tagDismissHoverBg}`, style: { color: style.color }, children: _jsx(CloseIcon, { className: "h-[10px] w-[10px]" }) })) : null] }));
}
function ReplyTextarea({ value, onChange, placeholder, autoFocus, onSubmitShortcut, }) {
    const textareaRef = useRef(null);
    const syncHeight = useCallback(() => {
        const textarea = textareaRef.current;
        if (!textarea) {
            return;
        }
        textarea.style.height = "auto";
        const nextHeight = Math.min(Math.max(REPLY_TEXTAREA_MIN_HEIGHT, textarea.scrollHeight), REPLY_TEXTAREA_MAX_HEIGHT);
        textarea.style.height = `${nextHeight}px`;
        textarea.style.overflowY = textarea.scrollHeight > REPLY_TEXTAREA_MAX_HEIGHT ? "auto" : "hidden";
    }, []);
    useLayoutEffect(() => {
        syncHeight();
    }, [syncHeight, value]);
    return (_jsx("textarea", { ref: textareaRef, autoFocus: autoFocus, value: value, onChange: (event) => onChange(event.target.value), placeholder: placeholder, rows: 1, className: "min-h-[56px] max-h-[200px] w-full resize-none overflow-hidden bg-transparent px-[12px] py-[8px] text-[14px] leading-[1.5] text-[var(--adaptive-text-primary)] outline-none placeholder:text-[var(--adaptive-text-muted)]", onKeyDown: (event) => {
            if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
                event.preventDefault();
                onSubmitShortcut();
            }
        } }));
}
export function FeedbackComposer({ message = "", onMessageChange, cases, onCaseChange, onAddCase, onRemoveCase, authorName, onAuthorNameChange, authors, fields: _fields, fieldValues: _fieldValues, onFieldChange: _onFieldChange, category = null, onCategoryChange, showCategory = false, showTags: _showTags = false, onSubmit, isSubmitting = false, showGitHubIssueOnCreate = false, onGitHubIssueSubmit, isGitHubIssueSubmitting = false, placeholder, autoFocus = false, errorMessage = "", showAskQuestionToggle = false, askQuestionChecked = false, onAskQuestionChange, askQuestionForced = false, composerMode = null, onCancelComposerMode, hideAuthorSelector = false, lockedAuthorName, onFooterWarningChange, hideEditor = false, hideActions = false, hidePrimarySubmitAction = false, categoryPrompt, }) {
    const { messages } = useReportPreferences();
    const [isGitHubIssueConfirming, setIsGitHubIssueConfirming] = useState(false);
    const [categoryAttentionKey, setCategoryAttentionKey] = useState(0);
    const [caseAttentionKey, setCaseAttentionKey] = useState(0);
    const resolvedComposerMode = composerMode ?? (askQuestionForced ? "question" : null);
    const isQuestionMode = askQuestionForced || askQuestionChecked || resolvedComposerMode === "question";
    const usesCaseEditor = Boolean(cases && onCaseChange && onAddCase && onRemoveCase);
    const showActionRow = !hideActions && (showAskQuestionToggle || showGitHubIssueOnCreate || !hidePrimarySubmitAction);
    const resolvedPlaceholder = isQuestionMode ? messages.composer.questionPlaceholder : (placeholder ?? (usesCaseEditor ? messages.fieldEditor.messagePlaceholder : messages.composer.placeholder));
    const emptyCaseIds = useMemo(() => (cases ?? []).filter((item) => !item.text.trim()).map((item) => item.id), [cases]);
    const hasEmptyCase = emptyCaseIds.length > 0;
    const isCategoryRequiredError = errorMessage === messages.errors.categoryRequired;
    const isEmptyCaseError = isCaseTextErrorMessage(errorMessage, cases?.length ?? 0, messages.errors.caseTextRequired, messages.errors.casesRequired);
    const categoryNeedsAttention = showCategory && !category && !hasEmptyCase && (categoryAttentionKey > 0 || isCategoryRequiredError);
    const caseNeedsAttention = usesCaseEditor && hasEmptyCase && (caseAttentionKey > 0 || isEmptyCaseError);
    const footerWarning = caseNeedsAttention ? messages.errors.emptyCaseMessageRequired : categoryNeedsAttention ? messages.errors.categoryRequired : null;
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
    return (_jsxs("div", { className: `flex w-full flex-col bg-[var(--adaptive-neutralTintOpacity50)] backdrop-blur-sm ${usesCaseEditor && !hideEditor ? "min-h-0 flex-1" : ""}`, children: [!hideEditor ? (_jsxs("div", { className: `relative ${usesCaseEditor ? "min-h-0 flex-1" : ""}`, children: [errorMessage && !isFooterHandledError ? (_jsx("p", { role: "alert", className: "absolute bottom-full left-[8px] right-[8px] z-10 mb-[6px] rounded-[8px] border border-rose-200 bg-rose-50 px-[8px] py-[4px] text-[12px] leading-[1.4] text-rose-700 shadow-[0_2px_8px_rgba(0,0,0,0.08)]", children: errorMessage })) : null, usesCaseEditor ? (_jsx(FeedbackCaseEditor, { cases: cases, onCaseChange: onCaseChange, onAddCase: onAddCase, onRemoveCase: onRemoveCase, autoFocus: autoFocus, onSubmitShortcut: handleSubmit, needsAttention: caseNeedsAttention, attentionKey: caseAttentionKey, emptyCaseIds: emptyCaseIds })) : (_jsxs("div", { className: "flex flex-col gap-[4px] px-[8px] pt-[8px]", children: [resolvedComposerMode ? (_jsx("div", { className: "flex items-center px-[4px]", children: _jsx(ComposerModeTag, { mode: resolvedComposerMode, messages: messages, onDismiss: onCancelComposerMode }) })) : null, _jsx(ReplyTextarea, { value: message, onChange: (value) => onMessageChange?.(value), placeholder: resolvedPlaceholder, autoFocus: autoFocus, onSubmitShortcut: handleSubmit })] }))] })) : null, showActionRow ? (_jsx("div", { className: `flex items-center gap-[8px] px-[8px] pb-[8px] ${hideAuthorSelector && !lockedAuthorName ? "justify-end" : "justify-between"}`, children: _jsxs("div", { className: "flex shrink-0 items-center gap-[6px]", children: [showAskQuestionToggle ? (_jsxs("label", { className: "inline-flex items-center gap-[4px] px-[2px] text-[12px] text-[var(--adaptive-black600)]", children: [_jsx("input", { type: "checkbox", "data-fivepixels-interactive": "", checked: isQuestionMode, disabled: askQuestionForced || isActionDisabled, onChange: (event) => onAskQuestionChange?.(event.target.checked), className: "h-[14px] w-[14px] accent-[var(--adaptive-blue500)]" }), _jsx("span", { children: messages.composer.askQuestionLabel })] })) : null, showGitHubIssueOnCreate ? (_jsx("button", { type: "button", "data-fivepixels-interactive": "", disabled: isActionDisabled, onClick: handleGitHubIssueSubmit, className: "inline-flex h-[24px] items-center justify-center gap-[4px] rounded-full border border-[var(--adaptive-border-subtle)] px-[12px] py-[4px] disabled:opacity-50", "aria-label": isGitHubIssueConfirming ? messages.feedbackList.gitIssueConfirmAriaLabel : messages.composer.gitIssueSendAriaLabel, title: isGitHubIssueConfirming ? messages.feedbackList.gitIssueConfirmTitle : messages.composer.gitIssueSendTitle, children: _jsxs("span", { className: "text-[12px] font-semibold text-[var(--adaptive-black500)]", children: ["+", " ", isGitHubIssueSubmitting
                                        ? messages.composer.gitIssueSendingLabel
                                        : isGitHubIssueConfirming
                                            ? messages.feedbackList.gitIssueConfirmLabel
                                            : messages.composer.gitIssueSendLabel] }) })) : null, !hidePrimarySubmitAction ? (_jsx(HoverTooltip, { label: messages.composer.sendAriaLabel, disabled: isActionDisabled, children: _jsx("button", { type: "button", "data-fivepixels-interactive": "", disabled: isActionDisabled, onClick: handleSubmit, className: "inline-flex h-[32px] w-[32px] shrink-0 items-center justify-center rounded-full bg-[#f6562f] text-white disabled:opacity-50", "aria-label": messages.composer.sendAriaLabel, children: _jsx(SendIcon, { className: "h-[16px] w-[16px]" }) }) })) : null] }) })) : null, showCategory && categoryPrompt ? _jsx("div", { className: "px-[12px] py-[8px] text-[16px] font-bold leading-[1.5] text-[var(--adaptive-text-primary)]", children: categoryPrompt }) : null, showCategory && onCategoryChange ? (_jsx(FeedbackCategorySelector, { value: category, onChange: onCategoryChange, messages: messages, needsAttention: categoryNeedsAttention, attentionKey: categoryAttentionKey })) : null] }));
}
//# sourceMappingURL=FeedbackComposer.js.map