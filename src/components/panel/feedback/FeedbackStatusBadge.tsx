import type { FeedbackDisplayStatus } from "../../../constants/feedbackStatus.js";
import { FEEDBACK_STATUS_COLOR, FEEDBACK_STATUS_LABEL } from "../../../constants/feedbackStatus.js";

type FeedbackStatusBadgeProps = {
    status: FeedbackDisplayStatus;
    className?: string;
};

export function FeedbackStatusBadge({ status, className = "" }: FeedbackStatusBadgeProps) {
    const color = FEEDBACK_STATUS_COLOR[status];

    return (
        <div className={`flex items-center gap-[6px] text-[12px] font-bold uppercase ${className}`}>
            <span
                className="inline-flex h-[14px] w-[14px] items-center justify-center rounded-full"
                style={{ backgroundColor: color, color: "var(--adaptive-black900)" }}
                aria-hidden
            >
                {status === "verified" ? "✓" : status === "found_error" ? "−" : "◷"}
            </span>
            <span style={{ color }}>{FEEDBACK_STATUS_LABEL[status]}</span>
        </div>
    );
}
