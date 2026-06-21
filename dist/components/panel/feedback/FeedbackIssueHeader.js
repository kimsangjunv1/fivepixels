import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { getFeedbackDisplayStatus } from "../../../utils/feedbackThread.js";
import { FeedbackCreatorBadge } from "./FeedbackCreatorBadge.js";
import { FeedbackFieldTags } from "./FeedbackFieldTags.js";
import { FeedbackStatusBadge } from "./FeedbackStatusBadge.js";
export function FeedbackIssueHeader({ report, fieldTags, expanded = true }) {
    const displayStatus = getFeedbackDisplayStatus(report, expanded);
    return (_jsxs("section", { className: "flex flex-col gap-[12px] bg-transparent p-[16px]", children: [_jsxs("section", { className: "flex flex-col gap-[4px]", children: [_jsx(FeedbackStatusBadge, { status: displayStatus }), _jsx("p", { className: "text-[16px] leading-[1.5] font-semibold text-[var(--adaptive-text-primary)]", children: report.message }), report.author_name ? (_jsxs("div", { className: "flex items-center gap-[6px]", children: [_jsx("p", { className: "text-[12px] text-[var(--adaptive-black500)]", children: report.author_name }), _jsx(FeedbackCreatorBadge, {})] })) : null] }), _jsx(FeedbackFieldTags, { tags: fieldTags })] }));
}
//# sourceMappingURL=FeedbackIssueHeader.js.map