import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { FEEDBACK_STATUS_COLOR } from "../../../constants/feedbackStatus.js";
import { FeedbackStatusIcon } from "../../../components/icons/Icons.js";
import { useReport } from "../../../providers/reportContext.js";
export function FeedbackStatusBadge({ status, className = "", isNeedGray = false }) {
    const { messages } = useReport();
    const color = FEEDBACK_STATUS_COLOR[status];
    return (_jsxs("div", { className: `flex items-center gap-[6px] ${isNeedGray ? "normal-case" : "uppercase"} ${className}`, children: [_jsx("span", { className: "inline-flex w-[14px]", "aria-hidden": true, children: _jsx(FeedbackStatusIcon, { status: status, fill: isNeedGray ? "var(--adaptive-black900)" : color }) }), _jsx("span", { style: { color: isNeedGray ? "var(--adaptive-black900)" : color }, className: "text-[14px]", children: messages.status.feedback[status] })] }));
}
//# sourceMappingURL=FeedbackStatusBadge.js.map