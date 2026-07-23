import { useEffect, useState, type MouseEvent } from "react";
import type { ReportMessages } from "@/i18n/types.js";
import { TrashIcon } from "@/components/icons/Icons.js";
import { HoverTooltip } from "@/components/ui/HoverTooltip.js";

type FeedbackDeleteActionProps = {
    reportId: string;
    onDelete: (id: string) => Promise<void>;
    disabled?: boolean;
    messages: ReportMessages;
    className?: string;
    iconClassName?: string;
    deleteTitle?: string;
    deleteConfirmTitle?: string;
    deleteAriaLabel?: string;
    deleteConfirmAriaLabel?: string;
};

export function FeedbackDeleteAction({
    reportId,
    onDelete,
    disabled = false,
    messages,
    className = "flex h-[20px] w-[20px] items-center justify-center disabled:opacity-50",
    iconClassName = "h-[12px] w-[12px]",
    deleteTitle = messages.feedbackList.deleteTitle,
    deleteConfirmTitle = messages.feedbackList.deleteConfirmTitle,
    deleteAriaLabel = messages.feedbackList.deleteAriaLabel,
    deleteConfirmAriaLabel = messages.feedbackList.deleteConfirmAriaLabel,
}: FeedbackDeleteActionProps) {
    const [confirming, setConfirming] = useState(false);

    useEffect(() => {
        if (!confirming) {
            return;
        }

        const timer = window.setTimeout(() => setConfirming(false), 1500);

        return () => {
            window.clearTimeout(timer);
        };
    }, [confirming]);

    const handleDelete = (event: MouseEvent<HTMLButtonElement>) => {
        event.stopPropagation();

        if (!confirming) {
            setConfirming(true);
            return;
        }

        void onDelete(reportId).finally(() => {
            setConfirming(false);
        });
    };

    return (
        <HoverTooltip label={confirming ? deleteConfirmTitle : deleteTitle}>
            <button
                type="button"
                data-fivepixels-interactive=""
                onClick={handleDelete}
                disabled={disabled}
                aria-label={confirming ? deleteConfirmAriaLabel : deleteAriaLabel}
                className={`${className} ${confirming ? "text-rose-200 hover:text-white" : "text-[var(--adaptive-black50)] hover:text-white"}`}
            >
                {confirming ? <span className="text-[9px] font-semibold">!</span> : <TrashIcon className={iconClassName} />}
            </button>
        </HoverTooltip>
    );
}
