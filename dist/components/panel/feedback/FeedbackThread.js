import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useReport } from "../../../providers/reportContext.js";
import { formatDate } from "../../../utils/format.js";
import { buildConfirmAuthorOptions, buildThreadTimeline, canShowCheckoutBranchActions, canShowIssueEntryActions, canShowSuggestedBranchActions, ISSUE_ROOT_PARENT_ID, resolveOriginalFeedbackAuthorName, } from "../../../utils/feedbackThread.js";
import { getGitHubIssueUrl, isGitIssuedSystemReply } from "../../../utils/githubIntegration.js";
import { AuthorSelector } from "./AuthorSelector.js";
import { FeedbackCreatorBadge } from "./FeedbackCreatorBadge.js";
import { FeedbackStatusBadge } from "./FeedbackStatusBadge.js";
import { GitIssuedThreadEntry } from "./GitIssuedThreadEntry.js";
function getScrollOverflowState(element) {
    const { scrollTop, scrollHeight, clientHeight } = element;
    const hasOverflow = scrollHeight > clientHeight + 1;
    return {
        canScrollUp: hasOverflow && scrollTop > 0,
        canScrollDown: hasOverflow && scrollTop + clientHeight < scrollHeight - 1,
    };
}
const SCROLL_HINT_CLASS = "pointer-events-none absolute left-0 right-0 z-10 px-[16px] py-[12px] text-center text-[12px] text-[var(--adaptive-black600)]";
function ThreadEntryActions({ reply, report, authors, pendingComposer, confirmAuthorName, showConfirmAuthorSelect, onConfirmAuthorNameChange, onStartDeny, onStartCheckout, onStartAskQuestion, onConfirm, isUpdating, }) {
    const { messages } = useReport();
    const [isResolvedConfirming, setIsResolvedConfirming] = useState(false);
    const confirmAuthorOptions = useMemo(() => buildConfirmAuthorOptions(report, authors), [authors, report]);
    const showReview = canShowSuggestedBranchActions(report, reply);
    const showCheckout = canShowCheckoutBranchActions(report, reply);
    const denyActive = (pendingComposer?.type === "deny" || pendingComposer?.type === "recheck") && pendingComposer.targetReplyId === reply.id;
    const checkoutActive = pendingComposer?.type === "checkout" && pendingComposer.targetReplyId === reply.id;
    const askQuestionActive = pendingComposer?.type === "question" && pendingComposer.targetReplyId === reply.id;
    useEffect(() => {
        if (!isResolvedConfirming) {
            return;
        }
        const timer = window.setTimeout(() => setIsResolvedConfirming(false), 1500);
        return () => window.clearTimeout(timer);
    }, [isResolvedConfirming]);
    const handleResolvedClick = () => {
        if (isUpdating) {
            return;
        }
        if (!isResolvedConfirming) {
            setIsResolvedConfirming(true);
            return;
        }
        setIsResolvedConfirming(false);
        onConfirm();
    };
    if (!showReview && !showCheckout) {
        return null;
    }
    return (_jsxs("div", { className: "mt-[10px] flex flex-col gap-[8px]", children: [_jsxs("div", { className: "flex gap-[8px]", children: [showReview ? (_jsxs(_Fragment, { children: [_jsx("button", { type: "button", "data-fivepixels-interactive": "", disabled: isUpdating, onClick: onStartDeny, className: `rounded-full py-[4px] px-[8px] text-[12px] font-semibold border ${denyActive ? " bg-[#FF2B6A] text-white border-transparent" : " border-[var(--adaptive-border-subtle)] text-[var(--adaptive-text-primary)]"}`, children: messages.thread.denied }), _jsx("button", { type: "button", "data-fivepixels-interactive": "", disabled: isUpdating, onClick: onStartAskQuestion, className: `rounded-full border py-[4px] px-[8px] text-[12px] font-semibold ${askQuestionActive ? "border-transparent bg-[var(--adaptive-blue500)] text-white" : "border-[var(--adaptive-border-subtle)] text-[var(--adaptive-text-primary)]"}`, children: messages.thread.askQuestion }), _jsx("button", { type: "button", "data-fivepixels-interactive": "", disabled: isUpdating, onClick: handleResolvedClick, "aria-label": isResolvedConfirming ? messages.thread.resolvedConfirmAriaLabel : messages.thread.resolved, className: `flex-1 rounded-full text-[12px] font-semibold text-white ${isResolvedConfirming ? "bg-[#D94A22]" : "bg-[#F6572E]"}`, children: isResolvedConfirming ? messages.thread.resolvedConfirmLabel : messages.thread.resolved })] })) : null, showCheckout ? (_jsxs(_Fragment, { children: [_jsx("button", { type: "button", "data-fivepixels-interactive": "", disabled: isUpdating, onClick: onStartDeny, className: `rounded-[8px] border py-[4px] px-[8px] text-[12px] font-semibold ${denyActive ? "border-transparent bg-[#FF2B6A] text-white" : "border-[var(--adaptive-border-subtle)] text-[var(--adaptive-text-primary)]"}`, children: messages.thread.denied }), _jsx("button", { type: "button", "data-fivepixels-interactive": "", disabled: isUpdating, onClick: onStartAskQuestion, className: `rounded-[8px] border py-[4px] px-[8px] text-[12px] font-semibold ${askQuestionActive ? "border-transparent bg-[var(--adaptive-blue500)] text-white" : "border-[var(--adaptive-border-subtle)] text-[var(--adaptive-text-primary)]"}`, children: messages.thread.askQuestion }), _jsx("button", { type: "button", "data-fivepixels-interactive": "", disabled: isUpdating, onClick: () => onStartCheckout(reply.id), className: "flex-1 py-[4px] rounded-[8px] text-[12px] font-semibold " + (checkoutActive ? "bg-[#F6572E] text-[var(--adaptive-text-inverse)]" : "bg-[#F6572E20] text-[#F6572E]"), children: messages.thread.leaveResult })] })) : null] }), showReview && showConfirmAuthorSelect ? (_jsx(AuthorSelector, { authors: confirmAuthorOptions, value: confirmAuthorName, onChange: onConfirmAuthorNameChange })) : null] }));
}
function ThreadChildReply({ reply, originalAuthorName, locale, threadReplyPrefix }) {
    return (_jsxs("article", { className: `flex flex-col gap-[4px] border-t border-[var(--adaptive-border-subtle)] ${threadReplyPrefix ? "py-[8px] pl-[18px]" : "py-[8px] pl-[12px]"}`, children: [_jsxs("div", { className: "flex items-start justify-between gap-[8px]", children: [_jsx(FeedbackStatusBadge, { status: reply.status }), _jsx("span", { className: "text-[12px] text-[var(--adaptive-black500)]", children: formatDate(reply.created_at, locale) })] }), _jsxs("p", { className: "leading-[1.5] text-[13px] text-[var(--adaptive-text-primary)]", children: [_jsx("span", { className: "text-[var(--adaptive-black400)]", children: threadReplyPrefix }), " ", reply.message] }), reply.author_name ? (_jsxs("div", { className: "flex items-center gap-[6px]", children: [_jsx("p", { className: "text-[12px] text-[var(--adaptive-black500)]", children: reply.author_name }), reply.author_name.trim() === originalAuthorName ? _jsx(FeedbackCreatorBadge, {}) : null] })) : null] }));
}
function ThreadIssueEntryActions({ report, pendingComposer, onStartAskQuestion, onStartCheckout, isUpdating, }) {
    const { messages } = useReport();
    if (!canShowIssueEntryActions(report)) {
        return null;
    }
    const askQuestionActive = pendingComposer?.type === "question" && pendingComposer.targetReplyId === ISSUE_ROOT_PARENT_ID;
    const leaveResultActive = pendingComposer?.type === "checkout" && pendingComposer.targetReplyId === ISSUE_ROOT_PARENT_ID;
    return (_jsx("div", { className: "mt-[10px] flex flex-col gap-[8px]", children: _jsxs("div", { className: "flex gap-[8px]", children: [_jsx("button", { type: "button", "data-fivepixels-interactive": "", disabled: isUpdating, onClick: onStartAskQuestion, className: `rounded-full border py-[4px] px-[8px] text-[12px] font-semibold ${askQuestionActive ? "border-transparent bg-[var(--adaptive-blue500)] text-white" : "border-[var(--adaptive-border-subtle)] text-[var(--adaptive-text-primary)]"}`, children: messages.thread.askQuestion }), _jsx("button", { type: "button", "data-fivepixels-interactive": "", disabled: isUpdating, onClick: () => onStartCheckout(ISSUE_ROOT_PARENT_ID), className: "flex-1 rounded-full py-[4px] text-[12px] font-semibold " + (leaveResultActive ? "bg-[#F6572E] text-white" : "bg-[#F6572E20] text-[#F6572E]"), children: messages.thread.leaveResult })] }) }));
}
function ThreadIssueEntry({ report, children, locale, originalAuthorName, threadReplyPrefix, pendingComposer, onStartAskQuestion, onStartCheckout, isUpdating, }) {
    return (_jsxs("div", { className: "flex flex-col", children: [_jsxs("article", { className: "flex flex-col gap-[4px] border-t border-[var(--adaptive-border-subtle)] p-[8px]", children: [_jsxs("div", { className: "flex items-start justify-between gap-[8px]", children: [_jsx(FeedbackStatusBadge, { status: "wait_for_reply" }), _jsx("span", { className: "text-[12px] text-[var(--adaptive-black500)]", children: formatDate(report.created_at, locale) })] }), _jsx("p", { className: "leading-[1.5] text-[14px] text-[var(--adaptive-text-primary)]", children: report.message }), report.author_name ? (_jsxs("div", { className: "flex items-center gap-[6px]", children: [_jsx("p", { className: "text-[12px] text-[var(--adaptive-black500)]", children: report.author_name }), _jsx(FeedbackCreatorBadge, {})] })) : null, _jsx(ThreadIssueEntryActions, { report: report, pendingComposer: pendingComposer, onStartAskQuestion: onStartAskQuestion, onStartCheckout: onStartCheckout, isUpdating: isUpdating })] }), children.map((child) => (_jsx(ThreadChildReply, { reply: child, originalAuthorName: originalAuthorName, locale: locale, threadReplyPrefix: threadReplyPrefix }, child.id)))] }));
}
function ThreadRootReply({ reply, report, authors, pendingComposer, confirmAuthorName, showConfirmAuthorSelect, originalAuthorName, locale, issueUrl, onConfirmAuthorNameChange, onStartDeny, onStartCheckout, onStartAskQuestion, onConfirm, isUpdating, }) {
    if (isGitIssuedSystemReply(reply, report) && issueUrl) {
        return (_jsx(GitIssuedThreadEntry, { reply: reply, issueUrl: issueUrl }));
    }
    return (_jsxs("article", { className: "flex flex-col gap-[4px] border-t border-[var(--adaptive-border-subtle)] p-[8px]", children: [_jsxs("div", { className: "flex items-start justify-between gap-[8px]", children: [_jsx(FeedbackStatusBadge, { status: reply.status }), _jsx("span", { className: "text-[12px] text-[var(--adaptive-black500)]", children: formatDate(reply.created_at, locale) })] }), _jsx("p", { className: "leading-[1.5] text-[14px] text-[var(--adaptive-text-primary)]", children: reply.message }), reply.author_name ? (_jsxs("div", { className: "flex items-center gap-[6px]", children: [_jsx("p", { className: "text-[12px] text-[var(--adaptive-black500)]", children: reply.author_name }), reply.author_name.trim() === originalAuthorName ? _jsx(FeedbackCreatorBadge, {}) : null] })) : null, _jsx(ThreadEntryActions, { reply: reply, report: report, authors: authors, pendingComposer: pendingComposer, confirmAuthorName: confirmAuthorName, showConfirmAuthorSelect: showConfirmAuthorSelect, onConfirmAuthorNameChange: onConfirmAuthorNameChange, onStartDeny: onStartDeny, onStartCheckout: onStartCheckout, onStartAskQuestion: onStartAskQuestion, onConfirm: onConfirm, isUpdating: isUpdating })] }));
}
export function FeedbackThread({ report, authors, pendingComposer, confirmAuthorName, showConfirmAuthorSelect, onConfirmAuthorNameChange, onToggleConfirmAuthorSelect: _onToggleConfirmAuthorSelect, onStartDeny, onStartCheckout, onStartAskQuestion, onConfirm, isUpdating, }) {
    const { locale, messages } = useReport();
    const scrollRef = useRef(null);
    const [scrollOverflow, setScrollOverflow] = useState({
        canScrollUp: false,
        canScrollDown: false,
    });
    const timeline = useMemo(() => buildThreadTimeline(report), [report]);
    const originalAuthorName = resolveOriginalFeedbackAuthorName(report);
    const issueUrl = getGitHubIssueUrl(report);
    const refreshScrollOverflow = useCallback(() => {
        const element = scrollRef.current;
        if (!element) {
            return;
        }
        setScrollOverflow(getScrollOverflowState(element));
    }, []);
    const scrollToBottom = useCallback(() => {
        const element = scrollRef.current;
        if (!element) {
            return;
        }
        element.scrollTop = element.scrollHeight;
        refreshScrollOverflow();
    }, [refreshScrollOverflow]);
    useEffect(() => {
        const element = scrollRef.current;
        if (!element) {
            return;
        }
        refreshScrollOverflow();
        element.addEventListener("scroll", refreshScrollOverflow, { passive: true });
        const resizeObserver = new ResizeObserver(refreshScrollOverflow);
        resizeObserver.observe(element);
        return () => {
            element.removeEventListener("scroll", refreshScrollOverflow);
            resizeObserver.disconnect();
        };
    }, [refreshScrollOverflow, report.replies]);
    useEffect(() => {
        scrollToBottom();
    }, [report.replies, scrollToBottom]);
    return (_jsxs("div", { className: "relative min-h-0 flex-1", children: [scrollOverflow.canScrollUp ? _jsx("p", { className: `${SCROLL_HINT_CLASS} top-0 bg-[linear-gradient(0deg,transparent,var(--adaptive-surface-overlay))]`, children: messages.thread.scrollHintUp }) : null, scrollOverflow.canScrollDown ? (_jsx("p", { className: `${SCROLL_HINT_CLASS} bottom-0 bg-[linear-gradient(180deg,transparent,var(--adaptive-surface-overlay))]`, children: messages.thread.scrollHintDown })) : null, _jsxs("section", { ref: scrollRef, className: "flex h-full max-h-[360px] flex-col overflow-auto bg-transparent", children: [_jsx(ThreadIssueEntry, { report: report, children: timeline.issueChildren, locale: locale, originalAuthorName: originalAuthorName, threadReplyPrefix: messages.feedbackList.threadReplyPrefix, pendingComposer: pendingComposer, onStartAskQuestion: onStartAskQuestion, onStartCheckout: onStartCheckout, isUpdating: isUpdating }), timeline.branches.map((branch) => (_jsxs("div", { className: "flex flex-col", children: [_jsx(ThreadRootReply, { reply: branch.root, report: report, authors: authors, pendingComposer: pendingComposer, confirmAuthorName: confirmAuthorName, showConfirmAuthorSelect: showConfirmAuthorSelect, originalAuthorName: originalAuthorName, locale: locale, issueUrl: issueUrl, onConfirmAuthorNameChange: onConfirmAuthorNameChange, onStartDeny: onStartDeny, onStartCheckout: onStartCheckout, onStartAskQuestion: onStartAskQuestion, onConfirm: onConfirm, isUpdating: isUpdating }), branch.children.map((child) => (_jsx(ThreadChildReply, { reply: child, originalAuthorName: originalAuthorName, locale: locale, threadReplyPrefix: messages.feedbackList.threadReplyPrefix }, child.id)))] }, branch.root.id)))] })] }));
}
//# sourceMappingURL=FeedbackThread.js.map