import type { ReactNode } from "react";
import { useReportPreferences } from "@/providers/reportContext.js";
import { formatTimeCompact } from "@/utils/shared/format.js";
import { FeedbackCreatorBadge } from "./FeedbackCreatorBadge.js";

type ThreadAuthorMetaProps = {
    authorName: string;
    createdAt?: string;
    showCreator?: boolean;
    trailing?: ReactNode;
};

export function ThreadAuthorMeta({ authorName, createdAt, showCreator = false, trailing }: ThreadAuthorMetaProps) {
    const { locale } = useReportPreferences();

    if (!authorName.trim()) {
        return null;
    }

    return (
        <div className="flex min-w-0 items-center gap-[6px]">
            {createdAt ? <span className="shrink-0 text-[12px] tabular-nums text-[var(--adaptive-black500)]">{formatTimeCompact(createdAt, locale)}</span> : null}
            <p className="min-w-0 truncate text-[12px] text-[var(--adaptive-black500)]">{authorName}</p>
            {showCreator ? <FeedbackCreatorBadge /> : null}
            {trailing}
        </div>
    );
}
