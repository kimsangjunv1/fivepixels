import { jsx as _jsx } from "react/jsx-runtime";
import { useState } from "react";
import { FavoritePinIcon } from "../../../components/icons/Icons.js";
import { HoverTooltip } from "../../../components/ui/HoverTooltip.js";
import { MOTION } from "../../../constants/motionClasses.js";
import { useReportPreferences } from "../../../providers/reportContext.js";
import { createPinnedFeedbackItem, isFeedbackPinned } from "../../../utils/pinned/pinnedFeedback.js";
export function FeedbackPinToggleButton({ report, caseId = null, className = "", iconClassName = "h-[14px] w-[14px]" }) {
    const { messages, pinnedFeedbackItems, togglePinnedFeedback } = useReportPreferences();
    const [popping, setPopping] = useState(false);
    const pinned = isFeedbackPinned(pinnedFeedbackItems, report.id);
    const label = pinned ? messages.pins.unpinAriaLabel : messages.pins.pinAriaLabel;
    const handleClick = (event) => {
        event.stopPropagation();
        event.preventDefault();
        setPopping(true);
        window.setTimeout(() => setPopping(false), 180);
        togglePinnedFeedback(createPinnedFeedbackItem(report, {
            caseId,
            summaryMore: messages.cases.summaryMore,
        }));
    };
    return (_jsx(HoverTooltip, { label: label, children: _jsx("button", { type: "button", "data-fivepixels-interactive": "", onPointerDown: (event) => event.stopPropagation(), onClick: handleClick, "aria-label": label, "aria-pressed": pinned, className: `flex h-[24px] w-[24px] items-center justify-center rounded-[6px] transition-colors hover:bg-[var(--adaptive-tintOpacity200)] ${pinned ? "text-[var(--adaptive-blue500)]" : "text-[var(--adaptive-black500)] hover:text-[var(--adaptive-black900)]"} ${className}`, children: _jsx("span", { className: popping ? `${MOTION.pinStarPop} inline-flex` : "inline-flex", children: _jsx(FavoritePinIcon, { filled: pinned, className: iconClassName }) }) }) }));
}
//# sourceMappingURL=FeedbackPinToggleButton.js.map