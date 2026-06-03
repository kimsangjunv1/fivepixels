import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { getFeedbackDisplayStatus } from "../../../utils/feedbackThread.js";
import { FeedbackFieldTags } from "./FeedbackFieldTags.js";
import { FeedbackStatusBadge } from "./FeedbackStatusBadge.js";
export function FeedbackHoverCard({ report, fieldTags }) {
    const displayStatus = getFeedbackDisplayStatus(report, false);
    return (_jsxs("div", { className: "flex w-[260px] flex-col gap-[10px] p-[16px]", children: [_jsx(FeedbackStatusBadge, { status: displayStatus }), _jsx("p", { className: "line-clamp-2 text-[13px] leading-[1.45] text-[var(--adaptive-grey900)]", children: report.message }), report.author_name ? _jsx("p", { className: "text-[12px] text-[var(--adaptive-grey500)]", children: report.author_name }) : null, _jsx(FeedbackFieldTags, { tags: fieldTags })] }));
}
//# sourceMappingURL=FeedbackHoverCard.js.map