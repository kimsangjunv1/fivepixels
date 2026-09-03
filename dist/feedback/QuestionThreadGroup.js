import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { useReportPreferences } from "../providers/reportContext.js";
import { ChevronDownIcon } from "../components/icons/Icons.js";
import { ThreadChildReply } from "./ThreadChildReply.js";
import { FeedSpineDot } from "./feed/FeedTimelineRow.js";
import { ThreadLayoutShell } from "./feed/ThreadLayoutShell.js";
export function QuestionThreadGroup({ questions, authors, originalAuthorName, actorName, forceExpanded = false }) {
    const { messages, questionThreadDisplay, threadLayout } = useReportPreferences();
    const isFeed = threadLayout === "feed";
    const [isExpanded, setIsExpanded] = useState(() => questionThreadDisplay === "expanded" || isFeed);
    useEffect(() => {
        setIsExpanded(questionThreadDisplay === "expanded" || isFeed);
    }, [questionThreadDisplay, isFeed]);
    useEffect(() => {
        if (forceExpanded) {
            setIsExpanded(true);
        }
    }, [forceExpanded]);
    if (questions.length === 0) {
        return null;
    }
    const toggleLabel = isExpanded
        ? forceExpanded
            ? messages.thread.questionsPending(questions.length)
            : messages.thread.questionsHide(questions.length)
        : messages.thread.questionsShow(questions.length);
    if (isFeed) {
        if (!isExpanded) {
            return (_jsx(ThreadLayoutShell, { density: "activity", nested: true, feedNode: _jsx(FeedSpineDot, {}), children: _jsxs("button", { type: "button", "data-fivepixels-interactive": "", "aria-expanded": false, "aria-label": messages.thread.questionsToggleAriaLabel(questions.length, false), onClick: () => setIsExpanded(true), className: "inline-flex items-center gap-[4px] py-[1px] text-left text-[12px] text-[var(--adaptive-black500)] hover:opacity-80", children: [_jsx("span", { children: toggleLabel }), _jsx(ChevronDownIcon, { className: "h-[12px] w-[12px] shrink-0 text-[var(--adaptive-black400)]" })] }) }));
        }
        return (_jsxs("div", { className: "flex flex-col", children: [questions.map((question) => (_jsx(ThreadChildReply, { reply: question, authors: authors, originalAuthorName: originalAuthorName, actorName: actorName }, question.id))), !forceExpanded ? (_jsx(ThreadLayoutShell, { density: "activity", nested: true, feedNode: _jsx(FeedSpineDot, {}), children: _jsxs("button", { type: "button", "data-fivepixels-interactive": "", "aria-expanded": true, "aria-label": messages.thread.questionsToggleAriaLabel(questions.length, true), onClick: () => setIsExpanded(false), className: "inline-flex items-center gap-[4px] py-[1px] text-left text-[12px] text-[var(--adaptive-black500)] hover:opacity-80", children: [_jsx("span", { children: messages.thread.questionsHide(questions.length) }), _jsx(ChevronDownIcon, { className: "h-[12px] w-[12px] shrink-0 rotate-180 text-[var(--adaptive-black400)]" })] }) })) : null] }));
    }
    return (_jsxs("div", { className: "flex flex-col", children: [_jsx(ThreadLayoutShell, { children: _jsxs("button", { type: "button", "data-fivepixels-interactive": "", "aria-expanded": isExpanded, "aria-label": messages.thread.questionsToggleAriaLabel(questions.length, isExpanded), onClick: () => setIsExpanded((current) => !current), className: "flex items-center gap-[4px] rounded-[6px] py-[2px] text-left text-[12px] text-[var(--adaptive-black500)] hover:opacity-80", children: [_jsx(ChevronDownIcon, { className: `h-[12px] w-[12px] shrink-0 text-[var(--adaptive-black400)] transition-transform ${isExpanded ? "rotate-180" : ""}` }), _jsx("span", { className: "text-[12px] text-[var(--adaptive-black500)] font-medium", children: toggleLabel })] }) }), isExpanded
                ? questions.map((question) => (_jsx(ThreadChildReply, { reply: question, authors: authors, originalAuthorName: originalAuthorName, actorName: actorName }, question.id)))
                : null] }));
}
//# sourceMappingURL=QuestionThreadGroup.js.map