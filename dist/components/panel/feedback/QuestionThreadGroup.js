import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { useReport } from "../../../providers/reportContext.js";
import { ChevronDownIcon } from "../../../components/icons/Icons.js";
import { ThreadChildReply } from "./ThreadChildReply.js";
export function QuestionThreadGroup({ questions, originalAuthorName, locale, threadReplyPrefix, forceExpanded = false, }) {
    const { messages, questionThreadDisplay } = useReport();
    const [isExpanded, setIsExpanded] = useState(() => questionThreadDisplay === "expanded");
    useEffect(() => {
        setIsExpanded(questionThreadDisplay === "expanded");
    }, [questionThreadDisplay]);
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
    return (_jsxs("div", { className: "flex flex-col", children: [_jsxs("button", { type: "button", "data-fivepixels-interactive": "", "aria-expanded": isExpanded, "aria-label": messages.thread.questionsToggleAriaLabel(questions.length, isExpanded), onClick: () => setIsExpanded((current) => !current), className: "flex w-full items-center gap-[6px] border-t border-[var(--adaptive-border-subtle)] px-[12px] py-[8px] text-left text-[12px] font-medium text-[var(--adaptive-blue500)] hover:bg-[var(--adaptive-black100)]", children: [_jsx(ChevronDownIcon, { className: `h-[14px] w-[14px] shrink-0 transition-transform ${isExpanded ? "rotate-180" : ""}` }), _jsx("span", { children: toggleLabel })] }), isExpanded
                ? questions.map((question) => (_jsx(ThreadChildReply, { reply: question, originalAuthorName: originalAuthorName, locale: locale, threadReplyPrefix: threadReplyPrefix }, question.id)))
                : null] }));
}
//# sourceMappingURL=QuestionThreadGroup.js.map