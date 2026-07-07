import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { useReport } from "../../../providers/reportContext.js";
import { ChevronDownIcon } from "../../../components/icons/Icons.js";
import { ThreadChildReply } from "./ThreadChildReply.js";
import { ThreadTimelineRow } from "./ThreadTimelineRow.js";
export function QuestionThreadGroup({ questions, originalAuthorName, forceExpanded = false }) {
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
    return (_jsxs("div", { className: "flex flex-col", children: [_jsx(ThreadTimelineRow, { children: _jsxs("button", { type: "button", "data-fivepixels-interactive": "", "aria-expanded": isExpanded, "aria-label": messages.thread.questionsToggleAriaLabel(questions.length, isExpanded), onClick: () => setIsExpanded((current) => !current), className: "flex items-center gap-[4px] rounded-[6px] py-[2px] text-left text-[12px] text-[var(--adaptive-black500)] hover:opacity-80", children: [_jsx(ChevronDownIcon, { className: `h-[12px] w-[12px] shrink-0 text-[var(--adaptive-black400)] transition-transform ${isExpanded ? "rotate-180" : ""}` }), _jsx("span", { className: "text-[12px] text-[var(--adaptive-black500)] font-medium", children: toggleLabel })] }) }), isExpanded
                ? questions.map((question) => (_jsx(ThreadChildReply, { reply: question, originalAuthorName: originalAuthorName }, question.id)))
                : null] }));
}
//# sourceMappingURL=QuestionThreadGroup.js.map