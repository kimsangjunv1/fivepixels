import { useEffect, useState } from "react";
import type { ReportAuthor, ReportReply } from "@/shared/types/report.js";
import { useReportPreferences } from "@/shared/providers/reportContext.js";
import { ChevronDownIcon } from "@/shared/components/icons/Icons.js";
import { ThreadChildReply } from "./ThreadChildReply.js";
import { FeedSpineDot } from "./feed/FeedTimelineRow.js";
import { ThreadLayoutShell } from "./feed/ThreadLayoutShell.js";

type QuestionThreadGroupProps = {
    questions: ReportReply[];
    authors: ReportAuthor[];
    originalAuthorName: string;
    actorName: string;
    forceExpanded?: boolean;
};

export function QuestionThreadGroup({ questions, authors, originalAuthorName, actorName, forceExpanded = false }: QuestionThreadGroupProps) {
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
            return (
                <ThreadLayoutShell
                    density="activity"
                    nested
                    feedNode={<FeedSpineDot />}
                >
                    <button
                        type="button"
                        data-fivepixels-interactive=""
                        aria-expanded={false}
                        aria-label={messages.thread.questionsToggleAriaLabel(questions.length, false)}
                        onClick={() => setIsExpanded(true)}
                        className="inline-flex items-center gap-[4px] py-[1px] text-left text-[12px] text-[var(--adaptive-black500)] hover:opacity-80"
                    >
                        <span>{toggleLabel}</span>
                        <ChevronDownIcon className="h-[12px] w-[12px] shrink-0 text-[var(--adaptive-black400)]" />
                    </button>
                </ThreadLayoutShell>
            );
        }

        return (
            <div className="flex flex-col">
                {questions.map((question) => (
                    <ThreadChildReply
                        key={question.id}
                        reply={question}
                        authors={authors}
                        originalAuthorName={originalAuthorName}
                        actorName={actorName}
                    />
                ))}
                {!forceExpanded ? (
                    <ThreadLayoutShell
                        density="activity"
                        nested
                        feedNode={<FeedSpineDot />}
                    >
                        <button
                            type="button"
                            data-fivepixels-interactive=""
                            aria-expanded
                            aria-label={messages.thread.questionsToggleAriaLabel(questions.length, true)}
                            onClick={() => setIsExpanded(false)}
                            className="inline-flex items-center gap-[4px] py-[1px] text-left text-[12px] text-[var(--adaptive-black500)] hover:opacity-80"
                        >
                            <span>{messages.thread.questionsHide(questions.length)}</span>
                            <ChevronDownIcon className="h-[12px] w-[12px] shrink-0 rotate-180 text-[var(--adaptive-black400)]" />
                        </button>
                    </ThreadLayoutShell>
                ) : null}
            </div>
        );
    }

    return (
        <div className="flex flex-col">
            <ThreadLayoutShell>
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
            </ThreadLayoutShell>

            {isExpanded
                ? questions.map((question) => (
                      <ThreadChildReply
                          key={question.id}
                          reply={question}
                          authors={authors}
                          originalAuthorName={originalAuthorName}
                          actorName={actorName}
                      />
                  ))
                : null}
        </div>
    );
}
