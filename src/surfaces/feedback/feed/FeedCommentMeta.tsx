import type { FeedbackDisplayStatus } from "@/shared/constants/feedbackStatus.js";
import { FEEDBACK_STATUS_COLOR } from "@/shared/constants/feedbackStatus.js";
import { useReportPreferences } from "@/shared/providers/reportContext.js";
import { formatRelativeTimeCompact } from "@/shared/utils/shared/format.js";
import { formatAssigneeLabel, resolveAuthorDepartment } from "@/shared/utils/report/reportCases.js";

type FeedCommentMetaProps = {
    authorName: string;
    createdAt: string;
    authors?: Array<{ name: string; department?: string }>;
    /** Reply/case status shown after name + time (e.g. 확인 요청, 오류 발견). */
    status?: FeedbackDisplayStatus;
};

/** Name + compact time + optional status label. */
export function FeedCommentMeta({ authorName, createdAt, authors, status }: FeedCommentMetaProps) {
    const { messages } = useReportPreferences();
    const displayName = formatAssigneeLabel(authorName, authors ? resolveAuthorDepartment(authors, authorName) : null);
    const relativeTime = formatRelativeTimeCompact(createdAt);
    const statusLabel = status ? messages.status.feedback[status] : "";
    // Match timestamp gray for issue_apply; keep accent colors for other statuses.
    const statusColor = status && status !== "issue_apply" ? FEEDBACK_STATUS_COLOR[status] : undefined;

    return (
        <div className="flex min-w-0 flex-wrap items-baseline gap-x-[6px] gap-y-[2px]">
            <p
                className="text-xs min-w-0 truncate font-semibold text-[var(--adaptive-black900)]"
                title={displayName}
            >
                {displayName}
            </p>
            {relativeTime ? <span className="text-xs shrink-0 font-semibold text-[var(--adaptive-black500)]">{relativeTime}</span> : null}
            {statusLabel ? (
                <span
                    className={`text-xs shrink-0 font-semibold ${statusColor ? "" : "text-[var(--adaptive-black500)]"}`}
                    style={statusColor ? { color: statusColor } : undefined}
                >
                    {statusLabel}
                </span>
            ) : null}
        </div>
    );
}

type FeedActivityLineProps = {
    actorName?: string;
    action: string;
    createdAt?: string;
};

/** Single-line activity: `Name action · 12m` */
export function FeedActivityLine({ actorName, action, createdAt }: FeedActivityLineProps) {
    const relativeTime = createdAt ? formatRelativeTimeCompact(createdAt) : "";

    return (
        <p className="min-w-0 pt-[2px] text-[12px] leading-[1.35] text-[var(--adaptive-black600)]">
            {actorName ? <span className="font-semibold text-[var(--adaptive-black800)]">{actorName}</span> : null}
            {actorName ? " " : null}
            <span>{action}</span>
            {relativeTime ? <span className="text-[var(--adaptive-black500)]"> · {relativeTime}</span> : null}
        </p>
    );
}
