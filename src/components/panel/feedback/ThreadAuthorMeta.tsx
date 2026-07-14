import type { ReactNode } from "react";
import { formatClockTime } from "@/utils/format.js";
import { FeedbackCreatorBadge } from "./FeedbackCreatorBadge.js";

type ThreadAuthorMetaProps = {
    authorName: string;
    createdAt?: string;
    showCreator?: boolean;
    trailing?: ReactNode;
};

export function ThreadAuthorMeta({ authorName, createdAt, showCreator = false, trailing }: ThreadAuthorMetaProps) {
    if (!authorName.trim()) {
        return null;
    }

    return (
        <div className="flex items-center justify-between gap-[8px]">
            <div className="flex min-w-0 items-center gap-[6px]">
                <p className="truncate text-[12px] text-[var(--adaptive-black500)]">{authorName}</p>
                {showCreator ? <FeedbackCreatorBadge /> : null}
                {trailing}
            </div>
            {/* {createdAt ? <span className="shrink-0 text-[12px] text-[var(--adaptive-black500)]">{formatClockTime(createdAt)}</span> : null} */}
        </div>
    );
}
