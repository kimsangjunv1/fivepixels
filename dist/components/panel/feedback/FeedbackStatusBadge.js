import { jsx as _jsx } from "react/jsx-runtime";
import { FEEDBACK_STATUS_COLOR } from "../../../constants/feedbackStatus.js";
import { useReportPreferences } from "../../../providers/reportContext.js";
export function FeedbackStatusBadge({ status, className = "", isNeedGray = false }) {
    const { messages } = useReportPreferences();
    const color = FEEDBACK_STATUS_COLOR[status];
    return (_jsx("div", { className: `flex items-center gap-[2px] ${isNeedGray ? "normal-case" : "uppercase"} ${className}`, children: _jsx("span", { style: { color: isNeedGray ? "var(--adaptive-black500)" : color }, className: "text-[14px] font-semibold", children: messages.status.feedback[status] }) }));
}
//# sourceMappingURL=FeedbackStatusBadge.js.map