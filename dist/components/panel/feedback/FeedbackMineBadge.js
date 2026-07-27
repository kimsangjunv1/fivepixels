import { jsx as _jsx } from "react/jsx-runtime";
import { useReportPreferences } from "../../../providers/reportContext.js";
export function FeedbackMineBadge() {
    const { messages } = useReportPreferences();
    return _jsx("span", { className: "rounded-full px-[6px] py-[1px] text-[10px] font-semibold leading-none bg-[var(--adaptive-blue300)] text-[var(--adaptive-black50)]", children: messages.author.myLabel });
}
//# sourceMappingURL=FeedbackMineBadge.js.map