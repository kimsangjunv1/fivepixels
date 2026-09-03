import type { ReactNode } from "react";
import { useReportPreferences } from "@/shared/providers/reportContext.js";
import { formatTimeCompact } from "@/shared/utils/shared/format.js";
import { formatAssigneeLabel, resolveAuthorDepartment } from "@/shared/utils/report/reportCases.js";
import { FeedbackCreatorBadge } from "./FeedbackCreatorBadge.js";
import { FeedbackMineBadge } from "./FeedbackMineBadge.js";

type ThreadAuthorMetaProps = {
    authorName: string;
    authors?: Array<{ name: string; department?: string }>;
    createdAt?: string;
    showCreator?: boolean;
    showMine?: boolean;
    trailing?: ReactNode;
    className?: string;
};

export function ThreadAuthorMeta({ authorName, authors, createdAt, showCreator = false, showMine = false, trailing, className = "" }: ThreadAuthorMetaProps) {
    const { locale } = useReportPreferences();

    if (!authorName.trim()) {
        return null;
    }

    const displayName = formatAssigneeLabel(authorName, authors ? resolveAuthorDepartment(authors, authorName) : null);

    return (
        <div className={`flex min-w-0 items-center gap-[6px] ${className}`}>
            {createdAt ? <span className="shrink-0 text-[12px] tabular-nums text-[var(--adaptive-black500)]">{formatTimeCompact(createdAt, locale)}</span> : null}
            <p
                className="min-w-0 truncate text-[12px] text-[var(--adaptive-black500)]"
                title={displayName}
            >
                {displayName}
            </p>
            {showMine ? <FeedbackMineBadge /> : null}
            {showCreator ? <FeedbackCreatorBadge /> : null}
            {trailing}
        </div>
    );
}
