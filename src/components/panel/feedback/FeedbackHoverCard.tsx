import type { FeedbackDisplayStatus } from "@/constants/feedbackStatus.js";
import type { ReportFeedback } from "@/types/report.js";
import type { MarkerDetachedKind } from "@/types/report-ui.js";
import { CheckCircleIcon } from "@/components/icons/Icons.js";
import { getDetachedMarkerHint } from "@/utils/marker/markerContext.js";
import { getCaseLatestStatus } from "@/utils/feedback/feedbackThread.js";
import { getReportCases } from "@/utils/report/reportCases.js";
import { mentionMessageToPlainText } from "@/utils/mention/elementMentions.js";
import { formatRelativeTime } from "@/utils/shared/format.js";
import { useReportPreferences } from "@/providers/reportContext.js";
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
    const cases = getReportCases(report);
    const visibleCases = cases.slice(0, MAX_TOOLTIP_CASES);
    const hasMoreCases = cases.length > MAX_TOOLTIP_CASES;
    const resolvedDetachedHint = detached && detachedHint && detachedModalHint ? getDetachedMarkerHint(detachedKind, { detachedHint, detachedModalHint }) : null;
    const reportRelativeTime = formatRelativeTime(report.created_at, messages.common.relativeTime);

    return (
        <div className="flex w-[260px] flex-col bg-transparent">
            <div className="flex flex-col gap-[6px] p-[8px_12px]">
                {resolvedDetachedHint ? <p className="text-[13px] leading-[1.4] text-[var(--adaptive-black500)]">{resolvedDetachedHint}</p> : null}

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

                {report.author_name || reportRelativeTime ? (
                    <div className="flex items-center gap-[6px] pt-[6px]">
                        {report.author_name ? <p className="text-[14px] text-[var(--adaptive-black500)]">{report.author_name}</p> : null}
                        {reportRelativeTime ? <p className="text-[14px] text-[var(--adaptive-black500)]">{reportRelativeTime}</p> : null}
                    </div>
                ) : null}
            </div>
        </div>
    );
}
