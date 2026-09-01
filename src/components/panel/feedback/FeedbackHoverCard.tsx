import type { FeedbackDisplayStatus } from "@/constants/feedbackStatus.js";
import type { ReportFeedback } from "@/types/report.js";
import type { MarkerDetachedKind } from "@/types/report-ui.js";
import { CheckCircleIcon } from "@/components/icons/Icons.js";
import { getDetachedMarkerHint } from "@/utils/marker/markerContext.js";
import { getCaseLatestStatus } from "@/utils/feedback/feedbackThread.js";
import { formatAssigneeLabel, getReportCases, resolveAuthorDepartment } from "@/utils/report/reportCases.js";
import { mentionMessageToPlainText } from "@/utils/mention/elementMentions.js";
import { formatRelativeTime } from "@/utils/shared/format.js";
import { useReport, useReportPreferences } from "@/providers/reportContext.js";
import { ACCENT_COLOR } from "@/constants/accentColors.js";

const MAX_TOOLTIP_CASES = 5;
const RESOLVED_STATUS_COLOR = ACCENT_COLOR.green;

type FeedbackHoverCardProps = {
    report: ReportFeedback;
    detached?: boolean;
    detachedKind?: MarkerDetachedKind;
    detachedHint?: string;
    detachedModalHint?: string;
};

function CaseStatusLabel({ status }: { status: FeedbackDisplayStatus }) {
    const { messages } = useReportPreferences();
    const isResolved = status === "resolved";

    return (
        <span
            className={`shrink-0 whitespace-nowrap text-[14px] font-semibold leading-none ${isResolved ? "" : "text-[var(--adaptive-black500)]"}`}
            style={isResolved ? { color: RESOLVED_STATUS_COLOR } : undefined}
        >
            {messages.status.feedback[status]}
        </span>
    );
}

export function FeedbackHoverCard({ report, detached = false, detachedKind = null, detachedHint, detachedModalHint }: FeedbackHoverCardProps) {
    const { messages } = useReportPreferences();
    const { authors } = useReport();
    const cases = getReportCases(report);
    const isMemo = report.category === "memo";
    const visibleCases = cases.slice(0, MAX_TOOLTIP_CASES);
    const hasMoreCases = cases.length > MAX_TOOLTIP_CASES;
    const resolvedDetachedHint = detached && detachedHint && detachedModalHint ? getDetachedMarkerHint(detachedKind, { detachedHint, detachedModalHint }) : null;
    const reportRelativeTime = formatRelativeTime(report.created_at, messages.common.relativeTime);
    const authorLabel = report.author_name ? formatAssigneeLabel(report.author_name, resolveAuthorDepartment(authors, report.author_name)) : null;

    if (isMemo) {
        const memoText = visibleCases
            .map((item) => mentionMessageToPlainText(item.text, item.mentions))
            .filter(Boolean)
            .join("\n");

        return (
            <div className="flex w-[260px] flex-col bg-transparent">
                <div className="flex flex-col gap-[6px] p-[8px_12px]">
                    {resolvedDetachedHint ? <p className="text-[13px] leading-[1.4] text-[var(--adaptive-black500)]">{resolvedDetachedHint}</p> : null}
                    {memoText ? <p className="whitespace-pre-wrap break-words text-[14px] leading-[1.5] text-[var(--adaptive-text-primary)]">{memoText}</p> : null}
                    {authorLabel || reportRelativeTime ? (
                        <div className="flex items-center gap-[6px] pt-[2px]">
                            {authorLabel ? (
                                <p
                                    className="min-w-0 truncate text-[14px] text-[var(--adaptive-black500)]"
                                    title={authorLabel}
                                >
                                    {authorLabel}
                                </p>
                            ) : null}
                            {reportRelativeTime ? <p className="shrink-0 text-[14px] text-[var(--adaptive-black500)]">{reportRelativeTime}</p> : null}
                        </div>
                    ) : null}
                </div>
            </div>
        );
    }

    return (
        <div className="flex w-[260px] flex-col bg-transparent">
            <div className="flex flex-col gap-[6px] p-[6px_8px]">
                <ul className="flex flex-col gap-[4px]">
                    {visibleCases.map((item) => {
                        const status = getCaseLatestStatus(report, item.id);
                        const isResolved = status === "resolved";
                        const caseText = mentionMessageToPlainText(item.text, item.mentions);

                        return (
                            <li
                                key={item.id}
                                className="flex min-w-0 items-center gap-[6px]"
                            >
                                <span
                                    className="min-w-0 flex-1 text-[14px] leading-[1.5] truncate text-[var(--adaptive-text-primary)]"
                                    title={caseText}
                                >
                                    {caseText}
                                </span>
                                {isResolved ? (
                                    <CheckCircleIcon
                                        className="h-[16px] w-[16px] shrink-0"
                                        fill={RESOLVED_STATUS_COLOR}
                                    />
                                ) : null}
                                <CaseStatusLabel status={status} />
                            </li>
                        );
                    })}
                </ul>

                {hasMoreCases ? <p className="text-[12px] leading-[1.4] text-[var(--adaptive-black500)]">{messages.marker.viewMoreCases}</p> : null}

                <section className="flex items-center justify-between">
                    {authorLabel || reportRelativeTime ? (
                        <div className="flex items-center gap-[6px]">
                            {authorLabel ? (
                                <p
                                    className="min-w-0 truncate text-[12px] text-[var(--adaptive-black500)]"
                                    title={authorLabel}
                                >
                                    {authorLabel}
                                </p>
                            ) : null}

                            {reportRelativeTime ? <p className="shrink-0 text-[12px] text-[var(--adaptive-black500)]">{reportRelativeTime}</p> : null}
                        </div>
                    ) : null}

                    {resolvedDetachedHint ? <p className="text-[12px] text-[var(--adaptive-black500)]">{resolvedDetachedHint}</p> : null}
                </section>
            </div>
        </div>
    );
}
