import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { FEEDBACK_STATUS_COLOR } from "../../../constants/feedbackStatus.js";
import { useReport } from "../../../providers/reportContext.js";
export function FeedbackStatusBadge({ status, className = "" }) {
    const { messages } = useReport();
    const color = FEEDBACK_STATUS_COLOR[status];
    return (_jsxs("div", { className: `flex items-center gap-[6px] text-[12px] font-bold uppercase ${className}`, children: [_jsx("span", { className: "inline-flex h-[14px] w-[14px] items-center justify-center rounded-full", style: { backgroundColor: color, color: "var(--adaptive-black900)" }, "aria-hidden": true, children: status === "resolved" ? "✓" : status === "found_error" ? "−" : status === "git_issued" ? "＋" : "◷" }), _jsx("span", { style: { color }, className: "text-[12px]", children: messages.status.feedback[status] })] }));
}
//# sourceMappingURL=FeedbackStatusBadge.js.map