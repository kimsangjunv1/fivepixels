import { useEffect, useState } from "react";
import type { ReportReply } from "@/types/report.js";
import { useReportPreferences } from "@/providers/reportContext.js";
import { ChevronDownIcon } from "@/components/icons/Icons.js";
import { ThreadChildReply } from "./ThreadChildReply.js";
import { ThreadTimelineRow } from "./ThreadTimelineRow.js";

type QuestionThreadGroupProps = {
    questions: ReportReply[];
    originalAuthorName: string;
    forceExpanded?: boolean;
};

export function QuestionThreadGroup({ questions, originalAuthorName, forceExpanded = false }: QuestionThreadGroupProps) {
    const { messages, questionThreadDisplay } = useReportPreferences();
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
            <ThreadTimelineRow>
                <button
                    type="button"
                    data-fivepixels-interactive=""
                    aria-expanded={isExpanded}
                    aria-label={messages.thread.questionsToggleAriaLabel(questions.length, isExpanded)}
                    onClick={() => setIsExpanded((current) => !current)}
                    className="flex items-center gap-[4px] rounded-[6px] py-[2px] text-left text-[12px] text-[var(--adaptive-black500)] hover:opacity-80"
                >
                    <ChevronDownIcon className={`h-[12px] w-[12px] shrink-0 text-[var(--adaptive-black400)] transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                    <span className="text-[12px] text-[var(--adaptive-black500)] font-medium">{toggleLabel}</span>
                </button>
            </ThreadTimelineRow>

            {isExpanded
                ? questions.map((question) => (
                      <ThreadChildReply
                          key={question.id}
                          reply={question}
                          originalAuthorName={originalAuthorName}
                      />
                  ))
                : null}
        </div>
    );
}
