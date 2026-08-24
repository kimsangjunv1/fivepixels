import { jsx as _jsx } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { LockIcon, TrashIcon } from "../../../components/icons/Icons.js";
import { HoverTooltip } from "../../../components/ui/HoverTooltip.js";
export function FeedbackDeleteAction({ reportId, onDelete, disabled = false, locked = false, lockLabel, messages, className = "flex h-[20px] w-[20px] items-center justify-center disabled:opacity-50", iconClassName = "h-[12px] w-[12px]", deleteTitle = messages.feedbackList.deleteTitle, deleteConfirmTitle = messages.feedbackList.deleteConfirmTitle, deleteAriaLabel = messages.feedbackList.deleteAriaLabel, deleteConfirmAriaLabel = messages.feedbackList.deleteConfirmAriaLabel, }) {
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
    const handleDelete = (event) => {
        event.stopPropagation();
        if (locked) {
            return;
        }
        if (!confirming) {
            setConfirming(true);
            return;
        }
        void onDelete(reportId).finally(() => {
            setConfirming(false);
        });
    };
    const tooltipLabel = locked ? lockLabel ?? deleteTitle : confirming ? deleteConfirmTitle : deleteTitle;
    return (_jsx(HoverTooltip, { label: tooltipLabel, multiline: locked, children: _jsx("button", { type: "button", "data-fivepixels-interactive": "", onPointerDown: (event) => event.stopPropagation(), onClick: handleDelete, disabled: disabled || locked, "aria-label": locked ? tooltipLabel : confirming ? deleteConfirmAriaLabel : deleteAriaLabel, className: `${className} ${confirming ? "text-rose-200 hover:text-white" : "text-[var(--adaptive-black50)] hover:text-white"}`, children: locked ? (_jsx(LockIcon, { className: iconClassName })) : confirming ? (_jsx("span", { className: "text-[9px] font-semibold", children: "!" })) : (_jsx(TrashIcon, { className: iconClassName })) }) }));
}
//# sourceMappingURL=FeedbackDeleteAction.js.map