import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { FEEDBACK_STATUS_COLOR } from "../../../shared/constants/feedbackStatus.js";
import { useReportPreferences } from "../../../shared/providers/reportContext.js";
import { formatRelativeTimeCompact } from "../../../shared/utils/shared/format.js";
import { formatAssigneeLabel, resolveAuthorDepartment } from "../../../shared/utils/report/reportCases.js";
/** Name + compact time + optional status label. */
export function FeedCommentMeta({ authorName, createdAt, authors, status }) {
    const { messages } = useReportPreferences();
    const displayName = formatAssigneeLabel(authorName, authors ? resolveAuthorDepartment(authors, authorName) : null);
    const relativeTime = formatRelativeTimeCompact(createdAt);
    const statusLabel = status ? messages.status.feedback[status] : "";
    // Match timestamp gray for issue_apply; keep accent colors for other statuses.
    const statusColor = status && status !== "issue_apply" ? FEEDBACK_STATUS_COLOR[status] : undefined;
    return (_jsxs("div", { className: "flex min-w-0 flex-wrap items-baseline gap-x-[6px] gap-y-[2px]", children: [_jsx("p", { className: "text-xs min-w-0 truncate font-semibold text-[var(--adaptive-black900)]", title: displayName, children: displayName }), relativeTime ? _jsx("span", { className: "text-xs shrink-0 font-semibold text-[var(--adaptive-black500)]", children: relativeTime }) : null, statusLabel ? (_jsx("span", { className: `text-xs shrink-0 font-semibold ${statusColor ? "" : "text-[var(--adaptive-black500)]"}`, style: statusColor ? { color: statusColor } : undefined, children: statusLabel })) : null] }));
}
/** Single-line activity: `Name action · 12m` */
export function FeedActivityLine({ actorName, action, createdAt }) {
    const relativeTime = createdAt ? formatRelativeTimeCompact(createdAt) : "";
    return (_jsxs("p", { className: "min-w-0 pt-[2px] text-[12px] leading-[1.5] text-[var(--adaptive-black600)]", children: [actorName ? _jsx("span", { className: "font-semibold text-[var(--adaptive-black800)]", children: actorName }) : null, actorName ? " " : null, _jsx("span", { children: action }), relativeTime ? _jsxs("span", { className: "text-[var(--adaptive-black500)]", children: [" \u00B7 ", relativeTime] }) : null] }));
}
//# sourceMappingURL=FeedCommentMeta.js.map