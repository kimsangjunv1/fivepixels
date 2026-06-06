import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { getFeedbackDisplayStatus } from "../../../utils/feedbackThread.js";
import { FeedbackFieldTags } from "./FeedbackFieldTags.js";
import { FeedbackStatusBadge } from "./FeedbackStatusBadge.js";
export function FeedbackHoverCard({ report, fieldTags }) {
    const displayStatus = getFeedbackDisplayStatus(report, false);
    return (_jsxs("div", { className: "flex w-[260px] flex-col gap-[10px] p-[16px] bg-[var(--adaptive-blackOpacity800)] backdrop-blur-[10px]", children: [_jsx(FeedbackStatusBadge, { status: displayStatus }), _jsx("p", { className: "line-clamp-2 leading-[1.5] text-[16px] text-[var(--adaptive-black50)]", children: report.message }), report.author_name ? _jsx("p", { className: "text-[12px] text-[var(--adaptive-black500)]", children: report.author_name }) : null, _jsx(FeedbackFieldTags, { tags: fieldTags })] }));
}
//# sourceMappingURL=FeedbackHoverCard.js.map