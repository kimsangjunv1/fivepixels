import { useState, type MouseEvent } from "react";
import type { ReportFeedback } from "@/types/report.js";
import { FavoritePinIcon } from "@/components/icons/Icons.js";
import { HoverTooltip } from "@/components/ui/HoverTooltip.js";
import { useReportPreferences } from "@/providers/reportContext.js";
import { createPinnedFeedbackItem, isFeedbackPinned } from "@/utils/pinned/pinnedFeedback.js";

type FeedbackPinToggleButtonProps = {
    report: ReportFeedback;
    caseId?: string | null;
    className?: string;
    iconClassName?: string;
};

export function FeedbackPinToggleButton({ report, caseId = null, className = "", iconClassName = "h-[14px] w-[14px]" }: FeedbackPinToggleButtonProps) {
    const { messages, pinnedFeedbackItems, togglePinnedFeedback } = useReportPreferences();
    const [popping, setPopping] = useState(false);
    const pinned = isFeedbackPinned(pinnedFeedbackItems, report.id);
    const label = pinned ? messages.pins.unpinAriaLabel : messages.pins.pinAriaLabel;

    const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
        event.stopPropagation();
        event.preventDefault();

        setPopping(true);
        window.setTimeout(() => setPopping(false), 180);

        togglePinnedFeedback(
            createPinnedFeedbackItem(report, {
                caseId,
                summaryMore: messages.cases.summaryMore,
            }),
        );
    };

    return (
        <HoverTooltip label={label}>
            <button
                type="button"
                data-fivepixels-interactive=""
                onPointerDown={(event) => event.stopPropagation()}
                onClick={handleClick}
                aria-label={label}
                aria-pressed={pinned}
                className={`flex h-[24px] w-[24px] items-center justify-center rounded-[6px] transition-colors hover:bg-[var(--adaptive-tintOpacity200)] ${
                    pinned ? "text-[var(--adaptive-blue500)]" : "text-[var(--adaptive-black500)] hover:text-[var(--adaptive-black900)]"
                } ${className}`}
            >
                <span className={popping ? "fivepixels-pin-star-pop inline-flex" : "inline-flex"}>
                    <FavoritePinIcon
                        filled={pinned}
                        className={iconClassName}
                    />
                </span>
            </button>
        </HoverTooltip>
    );
}
