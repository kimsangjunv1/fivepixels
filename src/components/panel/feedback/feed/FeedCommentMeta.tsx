import { useReportPreferences } from "@/providers/reportContext.js";
import { formatRelativeTimeCompact } from "@/utils/shared/format.js";
import { formatAssigneeLabel, resolveAuthorDepartment } from "@/utils/report/reportCases.js";

type FeedCommentMetaProps = {
    authorName: string;
    createdAt: string;
    authors?: Array<{ name: string; department?: string }>;
};

/** Name + compact time — badges intentionally omitted for feed density. */
export function FeedCommentMeta({ authorName, createdAt, authors }: FeedCommentMetaProps) {
    const displayName = formatAssigneeLabel(authorName, authors ? resolveAuthorDepartment(authors, authorName) : null);
    const relativeTime = formatRelativeTimeCompact(createdAt);

    return (
        <div className="flex min-w-0 flex-wrap items-baseline gap-x-[6px] gap-y-[2px]">
            <p
                className="min-w-0 truncate text-[13px] font-semibold text-[var(--adaptive-text-primary)]"
                title={displayName}
            >
                {displayName}
            </p>
            {relativeTime ? <span className="shrink-0 text-[12px] text-[var(--adaptive-black500)]">{relativeTime}</span> : null}
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
