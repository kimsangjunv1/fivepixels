import type { ReportField, ReportFieldValues, ReportCase } from "@/types/report.js";
import type { ReportAuthor } from "@/types/report.js";
import type { FeedbackCategory } from "@/constants/feedbackCategory.js";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useReportPreferences } from "@/providers/reportContext.js";
import type { ReportMessages } from "@/i18n/types.js";
import { CloseIcon, AskActionIcon, DeniedActionIcon, CompleteActionIcon, SendIcon } from "@/components/icons/Icons.js";
import { HoverTooltip } from "@/components/ui/HoverTooltip.js";
import { FeedbackCategorySelector } from "./FeedbackCategorySelector.js";
import { FeedbackCaseEditor } from "./FeedbackCaseEditor.js";
import { resolveComposerModeActionKind, THREAD_ACTION_STYLE } from "@/constants/threadActionStyles.js";

export type ComposerMode = "deny" | "recheck" | "checkout" | "question";

type FeedbackComposerProps = {
    message?: string;
    onMessageChange?: (value: string) => void;
    cases?: ReportCase[];
    onCaseChange?: (caseId: string, text: string) => void;
    onAddCase?: () => void;
    onRemoveCase?: (caseId: string) => void;
    authorName: string;
    onAuthorNameChange: (value: string) => void;
    authors: ReportAuthor[];
    fields: ReportField[];
    fieldValues: ReportFieldValues;
    onFieldChange: (key: string, value: string | boolean) => void;
    category?: FeedbackCategory | null;
    onCategoryChange?: (value: FeedbackCategory) => void;
    showCategory?: boolean;
    showTags?: boolean;
    onSubmit: () => void;
    isSubmitting?: boolean;
    showGitHubIssueOnCreate?: boolean;
    onGitHubIssueSubmit?: () => void;
    isGitHubIssueSubmitting?: boolean;
    placeholder?: string;
    autoFocus?: boolean;
    errorMessage?: string;
    showAskQuestionToggle?: boolean;
    askQuestionChecked?: boolean;
    onAskQuestionChange?: (checked: boolean) => void;
    askQuestionForced?: boolean;
    composerMode?: ComposerMode | null;
    onCancelComposerMode?: () => void;
    hideAuthorSelector?: boolean;
    lockedAuthorName?: string;
    onFooterWarningChange?: (message: string | null) => void;
    hideEditor?: boolean;
    hideActions?: boolean;
    hidePrimarySubmitAction?: boolean;
    categoryPrompt?: string;
    showCaseTabBar?: boolean;
    activeCaseId?: string | null;
    onActiveCaseIdChange?: (caseId: string) => void;
};

const REPLY_TEXTAREA_MIN_HEIGHT = 32;
const REPLY_TEXTAREA_MAX_HEIGHT = 200;
const REPLY_LINE_HEIGHT_PX = 21;
const COMPOSER_MODE_TAG_INLINE_RESERVE_PX = 96;
const REPLY_MEASURE_ROOT_ATTR = "data-reply-measure-root";

function isCaseTextErrorMessage(errorMessage: string, caseCount: number, caseTextRequired: (index: number) => string, casesRequired: string) {
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

function getComposerModeLabel(mode: ComposerMode, messages: ReportMessages) {
    const kind = resolveComposerModeActionKind(mode);

    if (kind === "ask") {
        return messages.composer.modeTag.ask;
    }

    if (kind === "denied") {
        return messages.composer.modeTag.denied;
    }

    return messages.composer.modeTag.complete;
}

function ComposerModeIcon({ mode, className }: { mode: ComposerMode; className?: string }) {
    const kind = resolveComposerModeActionKind(mode);
    const color = THREAD_ACTION_STYLE[kind].color;

    if (kind === "ask") {
        return (
            <AskActionIcon
                className={className}
                fill={color}
            />
        );
    }

    if (kind === "denied") {
        return (
            <DeniedActionIcon
                className={className}
                fill={color}
            />
        );
    }

    return (
        <CompleteActionIcon
            className={className}
            fill={color}
        />
    );
}

function ComposerModeTag({ mode, messages, onDismiss }: { mode: ComposerMode; messages: ReportMessages; onDismiss?: () => void }) {
    const kind = resolveComposerModeActionKind(mode);
    const style = THREAD_ACTION_STYLE[kind];

    return (
        <span
            className={`inline-flex h-[22px] shrink-0 items-center gap-[4px] rounded-full px-[8px] text-[12px] font-semibold ${style.tagBg} ${style.tagText}`}
            style={{ color: style.color }}
        >
            <ComposerModeIcon
                mode={mode}
                className="h-[12px] w-[12px]"
            />
            <span style={{ color: style.color }}>{getComposerModeLabel(mode, messages)}</span>
            {onDismiss ? (
                <button
                    type="button"
                    data-fivepixels-interactive=""
                    onClick={onDismiss}
                    aria-label={messages.composer.modeTagDismissAriaLabel}
                    className={`ml-[2px] inline-flex h-[14px] w-[14px] items-center justify-center rounded-full ${style.tagDismissHoverBg}`}
                    style={{ color: style.color }}
                >
                    <CloseIcon className="h-[10px] w-[10px]" />
                </button>
            ) : null}
        </span>
    );
}

function ReplyTextarea({
    value,
    onChange,
    placeholder,
    autoFocus,
    onSubmitShortcut,
    onMultilineChange,
    reserveInlineStart = 0,
}: {
    value: string;
    onChange: (value: string) => void;
    placeholder: string;
    autoFocus: boolean;
    onSubmitShortcut: () => void;
    onMultilineChange?: (isMultiline: boolean) => void;
    reserveInlineStart?: number;
}) {
    const textareaRef = useRef<HTMLTextAreaElement | null>(null);
    const measureFrameRef = useRef<number | null>(null);
    const lastMultilineRef = useRef<boolean | null>(null);

    const syncHeight = useCallback(() => {
        const textarea = textareaRef.current;

        if (!textarea) {
            return;
        }

        const measureRoot = textarea.closest(`[${REPLY_MEASURE_ROOT_ATTR}]`);
        const rootWidth = measureRoot instanceof HTMLElement ? measureRoot.clientWidth : (textarea.parentElement?.clientWidth ?? textarea.clientWidth);
        const measureWidth = reserveInlineStart > 0 ? Math.max(80, rootWidth - reserveInlineStart) : rootWidth;

        const previousWidth = textarea.style.width;
        const previousFlex = textarea.style.flex;
        const previousMinWidth = textarea.style.minWidth;

        // Isolate measurement from flex siblings (mode tag) so wrap detection stays stable across layouts.
        textarea.style.flex = "none";
        textarea.style.minWidth = "0";
        textarea.style.width = `${measureWidth}px`;
        textarea.style.height = "auto";

        const measureScrollHeight = textarea.scrollHeight;
        const styles = window.getComputedStyle(textarea);
        const paddingY = (Number.parseFloat(styles.paddingTop) || 0) + (Number.parseFloat(styles.paddingBottom) || 0);
        const lineHeight = Number.parseFloat(styles.lineHeight) || REPLY_LINE_HEIGHT_PX;
        const singleLineHeight = lineHeight + paddingY;
        const isMultiline = value.includes("\n") || measureScrollHeight > singleLineHeight + 1;

        textarea.style.flex = previousFlex;
        textarea.style.minWidth = previousMinWidth;
        textarea.style.width = previousWidth;
        textarea.style.height = "auto";

        const displayScrollHeight = textarea.scrollHeight;
        const nextHeight = Math.min(Math.max(REPLY_TEXTAREA_MIN_HEIGHT, displayScrollHeight), REPLY_TEXTAREA_MAX_HEIGHT);
        textarea.style.height = `${nextHeight}px`;
        textarea.style.overflowY = displayScrollHeight > REPLY_TEXTAREA_MAX_HEIGHT ? "auto" : "hidden";

        if (lastMultilineRef.current === isMultiline) {
            return;
        }

        lastMultilineRef.current = isMultiline;
        onMultilineChange?.(isMultiline);
    }, [onMultilineChange, reserveInlineStart, value]);

    useLayoutEffect(() => {
        lastMultilineRef.current = null;
    }, [reserveInlineStart]);

    useLayoutEffect(() => {
        syncHeight();
    }, [syncHeight]);

    useEffect(() => {
        const handleResize = () => {
            if (measureFrameRef.current !== null) {
                window.cancelAnimationFrame(measureFrameRef.current);
            }

            measureFrameRef.current = window.requestAnimationFrame(() => {
                syncHeight();
            });
        };

        window.addEventListener("resize", handleResize);

        return () => {
            window.removeEventListener("resize", handleResize);

            if (measureFrameRef.current !== null) {
                window.cancelAnimationFrame(measureFrameRef.current);
            }
        };
    }, [syncHeight]);

    return (
        <textarea
            ref={textareaRef}
            autoFocus={autoFocus}
            value={value}
            onChange={(event) => onChange(event.target.value)}
            placeholder={placeholder}
            rows={1}
            className="max-h-[200px] w-full min-w-0 flex-1 resize-none overflow-hidden bg-transparent px-[4px] py-[6px] text-[14px] leading-[1.5] text-[var(--adaptive-text-primary)] outline-none placeholder:text-[var(--adaptive-text-muted)]"
            style={{ minHeight: REPLY_TEXTAREA_MIN_HEIGHT }}
            onKeyDown={(event) => {
                if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
                    event.preventDefault();
                    onSubmitShortcut();
                }
            }}
        />
    );
}

export function FeedbackComposer({
    message = "",
    onMessageChange,
    cases,
    onCaseChange,
    onAddCase,
    onRemoveCase,
    authorName,
    onAuthorNameChange,
    authors,
    fields: _fields,
    fieldValues: _fieldValues,
    onFieldChange: _onFieldChange,
    category = null,
    onCategoryChange,
    showCategory = false,
    showTags: _showTags = false,
    onSubmit,
    isSubmitting = false,
    showGitHubIssueOnCreate = false,
    onGitHubIssueSubmit,
    isGitHubIssueSubmitting = false,
    placeholder,
    autoFocus = false,
    errorMessage = "",
    showAskQuestionToggle = false,
    askQuestionChecked = false,
    onAskQuestionChange,
    askQuestionForced = false,
    composerMode = null,
    onCancelComposerMode,
    hideAuthorSelector = false,
    lockedAuthorName,
    onFooterWarningChange,
    hideEditor = false,
    hideActions = false,
    hidePrimarySubmitAction = false,
    categoryPrompt,
    showCaseTabBar = true,
    activeCaseId,
    onActiveCaseIdChange,
}: FeedbackComposerProps) {
    const { messages } = useReportPreferences();
    const [isGitHubIssueConfirming, setIsGitHubIssueConfirming] = useState(false);
    const [categoryAttentionKey, setCategoryAttentionKey] = useState(0);
    const [caseAttentionKey, setCaseAttentionKey] = useState(0);
    const [isReplyMultiline, setIsReplyMultiline] = useState(false);
    const resolvedComposerMode = composerMode ?? (askQuestionForced ? ("question" as const) : null);
    const isQuestionMode = askQuestionForced || askQuestionChecked || resolvedComposerMode === "question";
    const usesCaseEditor = Boolean(cases && onCaseChange && onAddCase && onRemoveCase);
    const showInlineComposerModeTag = Boolean(resolvedComposerMode && !isReplyMultiline);
    const showFooterComposerModeTag = Boolean(resolvedComposerMode && isReplyMultiline);
    const showActionRow = !hideActions && (showAskQuestionToggle || showGitHubIssueOnCreate || !hidePrimarySubmitAction || showFooterComposerModeTag);
    const resolvedPlaceholder = isQuestionMode ? messages.composer.questionPlaceholder : (placeholder ?? (usesCaseEditor ? messages.fieldEditor.messagePlaceholder : messages.composer.placeholder));
    const emptyCaseIds = useMemo(() => (cases ?? []).filter((item) => !item.text.trim()).map((item) => item.id), [cases]);
    const hasEmptyCase = emptyCaseIds.length > 0;
    const isCategoryRequiredError = errorMessage === messages.errors.categoryRequired;
    const isEmptyCaseError = isCaseTextErrorMessage(errorMessage, cases?.length ?? 0, messages.errors.caseTextRequired, messages.errors.casesRequired);
    const canSelectCategory = Boolean(onCategoryChange);
    const categoryNeedsAttention = canSelectCategory && !category && !hasEmptyCase && (categoryAttentionKey > 0 || isCategoryRequiredError);
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
        if (!isCategoryRequiredError || !canSelectCategory || category || hasEmptyCase) {
            return;
        }

        setCategoryAttentionKey((current) => current + 1);
    }, [isCategoryRequiredError, canSelectCategory, category, hasEmptyCase, errorMessage]);

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

    useEffect(() => {
        if (!resolvedComposerMode) {
            setIsReplyMultiline(false);
        }
    }, [resolvedComposerMode]);

    const handleReplyMultilineChange = useCallback((next: boolean) => {
        setIsReplyMultiline((current) => (current === next ? current : next));
    }, []);

    const bumpValidationAttention = () => {
        if (usesCaseEditor && hasEmptyCase) {
            setCaseAttentionKey((current) => current + 1);
            return;
        }

        if (canSelectCategory && !category) {
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

    return (
        <div className={`flex w-full flex-col bg-[var(--adaptive-neutralTintOpacity50)] backdrop-blur-sm ${usesCaseEditor && !hideEditor ? "min-h-0 flex-1" : ""}`}>
            {!hideEditor ? (
                <div className={`relative ${usesCaseEditor ? "min-h-0 flex-1" : ""}`}>
                    {errorMessage && !isFooterHandledError ? (
                        <p
                            role="alert"
                            className="absolute bottom-full left-[8px] right-[8px] z-10 mb-[6px] rounded-[8px] border border-rose-200 bg-rose-50 px-[8px] py-[4px] text-[12px] leading-[1.4] text-rose-700 shadow-[0_2px_8px_rgba(0,0,0,0.08)]"
                        >
                            {errorMessage}
                        </p>
                    ) : null}
                    {usesCaseEditor ? (
                        <FeedbackCaseEditor
                            cases={cases!}
                            onCaseChange={onCaseChange!}
                            onAddCase={onAddCase!}
                            onRemoveCase={onRemoveCase!}
                            autoFocus={autoFocus}
                            onSubmitShortcut={handleSubmit}
                            needsAttention={caseNeedsAttention}
                            attentionKey={caseAttentionKey}
                            emptyCaseIds={emptyCaseIds}
                            showTabBar={showCaseTabBar}
                            activeCaseId={activeCaseId}
                            onActiveCaseIdChange={onActiveCaseIdChange}
                        />
                    ) : (
                        <div
                            data-reply-measure-root=""
                            className="px-[8px] pt-[8px]"
                        >
                            <div className={showInlineComposerModeTag ? "flex items-start gap-[6px]" : undefined}>
                                {showInlineComposerModeTag && resolvedComposerMode ? (
                                    <div className="flex h-[32px] shrink-0 items-center">
                                        <ComposerModeTag
                                            mode={resolvedComposerMode}
                                            messages={messages}
                                            onDismiss={onCancelComposerMode}
                                        />
                                    </div>
                                ) : null}
                                <ReplyTextarea
                                    value={message}
                                    onChange={(value) => onMessageChange?.(value)}
                                    placeholder={resolvedPlaceholder}
                                    autoFocus={autoFocus}
                                    onSubmitShortcut={handleSubmit}
                                    onMultilineChange={handleReplyMultilineChange}
                                    reserveInlineStart={resolvedComposerMode ? COMPOSER_MODE_TAG_INLINE_RESERVE_PX : 0}
                                />
                            </div>
                        </div>
                    )}
                </div>
            ) : null}

            {showActionRow ? (
                <div className={`flex items-center gap-[8px] px-[8px] pb-[8px] ${showFooterComposerModeTag || !(hideAuthorSelector && !lockedAuthorName) ? "justify-between" : "justify-end"}`}>
                    {/* {hideAuthorSelector ? (
                    lockedAuthorName ? (
                        <span className="flex h-[24px] min-w-0 max-w-[50%] items-center truncate rounded-full bg-[var(--adaptive-surface-muted)] px-[12px] text-[12px] text-[var(--adaptive-black500)]">
                            {lockedAuthorName}
                        </span>
                    ) : null
                ) : (
                    <AuthorSelector
                        authors={authors}
                        value={authorName}
                        onChange={onAuthorNameChange}
                    />
                )} */}

                    {showFooterComposerModeTag && resolvedComposerMode ? (
                        <ComposerModeTag
                            mode={resolvedComposerMode}
                            messages={messages}
                            onDismiss={onCancelComposerMode}
                        />
                    ) : (
                        <div className="min-w-0 flex-1" />
                    )}

                    <div className="flex shrink-0 items-center gap-[6px]">
                        {showAskQuestionToggle ? (
                            <label className="inline-flex items-center gap-[4px] px-[2px] text-[12px] text-[var(--adaptive-black600)]">
                                <input
                                    type="checkbox"
                                    data-fivepixels-interactive=""
                                    checked={isQuestionMode}
                                    disabled={askQuestionForced || isActionDisabled}
                                    onChange={(event) => onAskQuestionChange?.(event.target.checked)}
                                    className="h-[14px] w-[14px] accent-[var(--adaptive-blue500)]"
                                />
                                <span>{messages.composer.askQuestionLabel}</span>
                            </label>
                        ) : null}
                        {showGitHubIssueOnCreate ? (
                            <button
                                type="button"
                                data-fivepixels-interactive=""
                                disabled={isActionDisabled}
                                onClick={handleGitHubIssueSubmit}
                                className="inline-flex h-[24px] items-center justify-center gap-[4px] rounded-full border border-[var(--adaptive-border-subtle)] px-[12px] py-[4px] disabled:opacity-50"
                                aria-label={isGitHubIssueConfirming ? messages.feedbackList.gitIssueConfirmAriaLabel : messages.composer.gitIssueSendAriaLabel}
                                title={isGitHubIssueConfirming ? messages.feedbackList.gitIssueConfirmTitle : messages.composer.gitIssueSendTitle}
                            >
                                <span className="text-[12px] font-semibold text-[var(--adaptive-black500)]">
                                    +{" "}
                                    {isGitHubIssueSubmitting
                                        ? messages.composer.gitIssueSendingLabel
                                        : isGitHubIssueConfirming
                                          ? messages.feedbackList.gitIssueConfirmLabel
                                          : messages.composer.gitIssueSendLabel}
                                </span>
                            </button>
                        ) : null}
                        {!hidePrimarySubmitAction ? (
                            <HoverTooltip
                                label={messages.composer.sendAriaLabel}
                                disabled={isActionDisabled}
                            >
                                <button
                                    type="button"
                                    data-fivepixels-interactive=""
                                    disabled={isActionDisabled}
                                    onClick={handleSubmit}
                                    className="inline-flex h-[32px] w-[32px] shrink-0 items-center justify-center rounded-full bg-[#f6562f] text-white disabled:opacity-50"
                                    aria-label={messages.composer.sendAriaLabel}
                                >
                                    <SendIcon className="h-[16px] w-[16px]" />
                                </button>
                            </HoverTooltip>
                        ) : null}
                    </div>
                </div>
            ) : null}
            {showCategory && categoryPrompt ? <div className="px-[12px] py-[8px] text-[16px] font-bold leading-[1.5] text-[var(--adaptive-text-primary)]">{categoryPrompt}</div> : null}
            {showCategory && onCategoryChange ? (
                <FeedbackCategorySelector
                    value={category}
                    onChange={onCategoryChange}
                    messages={messages}
                    needsAttention={categoryNeedsAttention}
                    attentionKey={categoryAttentionKey}
                />
            ) : null}
        </div>
    );
}
