import { jsx as _jsx } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { TrashIcon } from "../../../components/icons/Icons.js";
import { HoverTooltip } from "../../../components/ui/HoverTooltip.js";
export function FeedbackDeleteAction({ reportId, onDelete, disabled = false, messages, className = "flex h-[20px] w-[20px] items-center justify-center disabled:opacity-50", iconClassName = "h-[12px] w-[12px]", deleteTitle = messages.feedbackList.deleteTitle, deleteConfirmTitle = messages.feedbackList.deleteConfirmTitle, deleteAriaLabel = messages.feedbackList.deleteAriaLabel, deleteConfirmAriaLabel = messages.feedbackList.deleteConfirmAriaLabel, }) {
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
        if (!confirming) {
            setConfirming(true);
            return;
        }
        void onDelete(reportId).finally(() => {
            setConfirming(false);
        });
    };
    return (_jsx(HoverTooltip, { label: confirming ? deleteConfirmTitle : deleteTitle, children: _jsx("button", { type: "button", "data-fivepixels-interactive": "", onClick: handleDelete, disabled: disabled, "aria-label": confirming ? deleteConfirmAriaLabel : deleteAriaLabel, className: `${className} ${confirming ? "text-rose-200 hover:text-white" : "text-[var(--adaptive-black50)] hover:text-white"}`, children: confirming ? _jsx("span", { className: "text-[9px] font-semibold", children: "!" }) : _jsx(TrashIcon, { className: iconClassName }) }) }));
}
//# sourceMappingURL=FeedbackDeleteAction.js.map