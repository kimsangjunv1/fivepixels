import { useEffect, useState } from "react";
import type { ReportReply } from "@/types/report.js";
import type { ReportLocale } from "@/i18n/types.js";
import { useReport } from "@/providers/reportContext.js";
import { ChevronDownIcon } from "@/components/icons/Icons.js";
import { ThreadChildReply } from "./ThreadChildReply.js";

type QuestionThreadGroupProps = {
    questions: ReportReply[];
    originalAuthorName: string;
    locale: ReportLocale;
    threadReplyPrefix: string;
    forceExpanded?: boolean;
};

export function QuestionThreadGroup({
    questions,
    originalAuthorName,
    locale,
    threadReplyPrefix,
    forceExpanded = false,
}: QuestionThreadGroupProps) {
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

    return (
        <div className="flex flex-col">
            <button
                type="button"
                data-fivepixels-interactive=""
                aria-expanded={isExpanded}
                aria-label={messages.thread.questionsToggleAriaLabel(questions.length, isExpanded)}
                onClick={() => setIsExpanded((current) => !current)}
                className="flex w-full items-center gap-[6px] border-t border-[var(--adaptive-border-subtle)] px-[12px] py-[8px] text-left text-[12px] font-medium text-[var(--adaptive-blue500)] hover:bg-[var(--adaptive-black100)]"
            >
                <ChevronDownIcon className={`h-[14px] w-[14px] shrink-0 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                <span>{toggleLabel}</span>
            </button>

            {isExpanded
                ? questions.map((question) => (
                      <ThreadChildReply
                          key={question.id}
                          reply={question}
                          originalAuthorName={originalAuthorName}
                          locale={locale}
                          threadReplyPrefix={threadReplyPrefix}
                      />
                  ))
                : null}
        </div>
    );
}
