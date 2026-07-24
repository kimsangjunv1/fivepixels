import { FEEDBACK_STATUS_COLOR, type FeedbackDisplayStatus } from "@/constants/feedbackStatus.js";
import type { ReportFeedback } from "@/types/report.js";
import type { MarkerDetachedKind } from "@/types/report-ui.js";
import { getDetachedMarkerHint } from "@/utils/marker/markerContext.js";
import { getCaseLatestStatus } from "@/utils/feedback/feedbackThread.js";
import { getReportCases } from "@/utils/report/reportCases.js";
import { useReportPreferences } from "@/providers/reportContext.js";
import { FeedbackCreatorBadge } from "./FeedbackCreatorBadge.js";

const MAX_TOOLTIP_CASES = 5;

type FeedbackHoverCardProps = {
    report: ReportFeedback;
    detached?: boolean;
    detachedKind?: MarkerDetachedKind;
    detachedHint?: string;
    detachedModalHint?: string;
};

function CaseStatusLabel({ status }: { status: FeedbackDisplayStatus }) {
    const { messages } = useReportPreferences();
    const color = FEEDBACK_STATUS_COLOR[status];

    return (
        <span
            className="shrink-0 whitespace-nowrap text-[11px] font-semibold leading-none"
            style={{ color }}
        >
            {messages.status.feedback[status]}
        </span>
    );
}

export function FeedbackHoverCard({ report, detached = false, detachedKind = null, detachedHint, detachedModalHint }: FeedbackHoverCardProps) {
    const { messages } = useReportPreferences();
    const cases = getReportCases(report);
    const visibleCases = cases.slice(0, MAX_TOOLTIP_CASES);
    const hasMoreCases = cases.length > MAX_TOOLTIP_CASES;
    const resolvedDetachedHint = detached && detachedHint && detachedModalHint ? getDetachedMarkerHint(detachedKind, { detachedHint, detachedModalHint }) : null;

    return (
        <div className="flex w-[260px] flex-col bg-transparent">
            <div className="shrink-0 border-b border-b-[var(--adaptive-border-subtle)] bg-[var(--adaptive-neutralTintOpacity900)] px-[12px] py-[4px] flex items-center justify-between">
                <div className="w-[3px] h-[3px] bg-[var(--adaptive-black400)] rounded-full" />
                <p className="text-[12px] font-semibold leading-none text-[var(--adaptive-black900)]">{messages.marker.hoverTooltipHeader}</p>
                <div className="w-[3px] h-[3px] bg-[var(--adaptive-black400)] rounded-full" />
            </div>

            <div className="flex flex-col gap-[6px] p-[8px]">
                {resolvedDetachedHint ? <p className="text-[12px] leading-[1.4] text-[var(--adaptive-black500)]">{resolvedDetachedHint}</p> : null}

                <ul className="flex flex-col gap-[4px]">
                    {visibleCases.map((item) => {
                        const status = getCaseLatestStatus(report, item.id);

                        return (
                            <li
                                key={item.id}
                                className="flex min-w-0 items-center gap-[6px] text-[12px] leading-[1.4]"
                            >
                                <span
                                    className={`min-w-0 flex-1 truncate text-[var(--adaptive-text-primary)] ${item.status === "resolved" ? "text-[var(--adaptive-black500)] line-through" : ""}`}
                                    title={item.text}
                                >
                                    {item.text}
                                </span>
                                <span
                                    className="shrink-0 text-[var(--adaptive-black400)]"
                                    aria-hidden
                                >
                                    |
                                </span>
                                <CaseStatusLabel status={status} />
                            </li>
                        );
                    })}
                </ul>

                {hasMoreCases ? <p className="text-[11px] leading-[1.4] text-[var(--adaptive-black500)]">{messages.marker.viewMoreCases}</p> : null}

                {report.author_name ? (
                    <div className="flex items-center gap-[6px] border-t border-[var(--adaptive-border-subtle)] pt-[6px]">
                        <p className="text-[12px] text-[var(--adaptive-black500)]">{report.author_name}</p>
                        <FeedbackCreatorBadge />
                    </div>
                ) : null}
            </div>
        </div>
    );
}
