import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { formatRelativeTimeCompact } from "../../../../utils/shared/format.js";
import { formatAssigneeLabel, resolveAuthorDepartment } from "../../../../utils/report/reportCases.js";
/** Name + compact time — badges intentionally omitted for feed density. */
export function FeedCommentMeta({ authorName, createdAt, authors }) {
    const displayName = formatAssigneeLabel(authorName, authors ? resolveAuthorDepartment(authors, authorName) : null);
    const relativeTime = formatRelativeTimeCompact(createdAt);
    return (_jsxs("div", { className: "flex min-w-0 flex-wrap items-baseline gap-x-[6px] gap-y-[2px]", children: [_jsx("p", { className: "min-w-0 truncate text-[13px] font-semibold text-[var(--adaptive-text-primary)]", title: displayName, children: displayName }), relativeTime ? _jsx("span", { className: "shrink-0 text-[12px] text-[var(--adaptive-black500)]", children: relativeTime }) : null] }));
}
/** Single-line activity: `Name action · 12m` */
export function FeedActivityLine({ actorName, action, createdAt }) {
    const relativeTime = createdAt ? formatRelativeTimeCompact(createdAt) : "";
    return (_jsxs("p", { className: "min-w-0 pt-[2px] text-[12px] leading-[1.35] text-[var(--adaptive-black600)]", children: [actorName ? _jsx("span", { className: "font-semibold text-[var(--adaptive-black800)]", children: actorName }) : null, actorName ? " " : null, _jsx("span", { children: action }), relativeTime ? _jsxs("span", { className: "text-[var(--adaptive-black500)]", children: [" \u00B7 ", relativeTime] }) : null] }));
}
//# sourceMappingURL=FeedCommentMeta.js.map