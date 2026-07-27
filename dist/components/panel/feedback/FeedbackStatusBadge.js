import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { FEEDBACK_STATUS_COLOR } from "../../../constants/feedbackStatus.js";
import { FeedbackStatusIcon } from "../../../components/icons/Icons.js";
import { useReportPreferences } from "../../../providers/reportContext.js";
export function FeedbackStatusBadge({ status, className = "", isNeedGray = false }) {
    const { messages } = useReportPreferences();
    const color = FEEDBACK_STATUS_COLOR[status];
    return (_jsxs("div", { className: `flex items-center gap-[2px] ${isNeedGray ? "normal-case" : "uppercase"} ${className}`, children: [_jsx("span", { className: "inline-flex w-[12px]", "aria-hidden": true, children: _jsx(FeedbackStatusIcon, { status: status, fill: isNeedGray ? "var(--adaptive-black500)" : color }) }), _jsx("span", { style: { color: isNeedGray ? "var(--adaptive-black500)" : color }, className: "text-[12px] font-semibold", children: messages.status.feedback[status] })] }));
}
//# sourceMappingURL=FeedbackStatusBadge.js.map