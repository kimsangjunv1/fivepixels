import type { FeedbackDisplayStatus } from "@/constants/feedbackStatus.js";
import { FEEDBACK_STATUS_COLOR } from "@/constants/feedbackStatus.js";
import { FeedbackStatusIcon } from "@/components/icons/Icons.js";
import { useReport } from "@/providers/reportContext.js";

type FeedbackStatusBadgeProps = {
    status: FeedbackDisplayStatus;
    className?: string;
};

export function FeedbackStatusBadge({ status, className = "" }: FeedbackStatusBadgeProps) {
    const { messages } = useReport();
    const color = FEEDBACK_STATUS_COLOR[status];

    return (
        <div className={`flex items-center gap-[6px] text-[12px] font-bold uppercase ${className}`}>
            <span
                className="inline-flex h-[14px] w-[14px] items-center justify-center rounded-full [&_svg]:h-[10px] [&_svg]:w-[10px]"
                style={{ backgroundColor: color, color: "var(--adaptive-black900)" }}
                aria-hidden
            >
                <FeedbackStatusIcon status={status} />
            </span>
            <span
                style={{ color }}
                className="text-[12px]"
            >
                {messages.status.feedback[status]}
            </span>
        </div>
    );
}
