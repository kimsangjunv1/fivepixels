import type { FeedbackDisplayStatus } from "@/constants/feedbackStatus.js";
import { FEEDBACK_STATUS_COLOR } from "@/constants/feedbackStatus.js";
import { FeedbackStatusIcon } from "@/components/icons/Icons.js";
import { useReportPreferences } from "@/providers/reportContext.js";

type FeedbackStatusBadgeProps = {
    status: FeedbackDisplayStatus;
    className?: string;
    isNeedGray?: boolean;
};

export function FeedbackStatusBadge({ status, className = "", isNeedGray = false }: FeedbackStatusBadgeProps) {
    const { messages } = useReportPreferences();
    const color = FEEDBACK_STATUS_COLOR[status];

    return (
        <div className={`flex items-center gap-[6px] ${isNeedGray ? "normal-case" : "uppercase"} ${className}`}>
            <span
                className="inline-flex w-[14px]"
                // className="inline-flex h-[14px] w-[14px] shrink-0 items-center justify-center [&_svg]:h-[14px] [&_svg]:w-[14px]"
                aria-hidden
            >
                <FeedbackStatusIcon
                    status={status}
                    fill={isNeedGray ? "var(--adaptive-black900)" : color}
                />
            </span>
            <span
                style={{ color: isNeedGray ? "var(--adaptive-black900)" : color }}
                className="text-[14px]"
            >
                {messages.status.feedback[status]}
            </span>
        </div>
    );
}
