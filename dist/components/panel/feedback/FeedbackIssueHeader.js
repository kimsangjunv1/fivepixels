import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { getFeedbackDisplayStatus } from "../../../utils/feedbackThread.js";
import { FeedbackFieldTags } from "./FeedbackFieldTags.js";
import { FeedbackStatusBadge } from "./FeedbackStatusBadge.js";
export function FeedbackIssueHeader({ report, fieldTags, expanded = true }) {
    const displayStatus = getFeedbackDisplayStatus(report, expanded);
    return (_jsxs("section", { className: "flex flex-col gap-[10px] bg-[var(--adaptive-whiteOpacity500)] p-[16px] backdrop-blur-[20px]", children: [_jsx(FeedbackStatusBadge, { status: displayStatus }), _jsx("p", { className: "text-[14px] leading-[1.45] font-semibold text-[var(--adaptive-black900)]", children: report.message }), report.author_name ? _jsx("p", { className: "text-[12px] text-[var(--adaptive-black500)]", children: report.author_name }) : null, _jsx(FeedbackFieldTags, { tags: fieldTags })] }));
}
//# sourceMappingURL=FeedbackIssueHeader.js.map