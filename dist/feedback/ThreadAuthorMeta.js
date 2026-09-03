import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useReportPreferences } from "../providers/reportContext.js";
import { formatTimeCompact } from "../utils/shared/format.js";
import { formatAssigneeLabel, resolveAuthorDepartment } from "../utils/report/reportCases.js";
import { FeedbackCreatorBadge } from "./FeedbackCreatorBadge.js";
import { FeedbackMineBadge } from "./FeedbackMineBadge.js";
export function ThreadAuthorMeta({ authorName, authors, createdAt, showCreator = false, showMine = false, trailing, className = "" }) {
    const { locale } = useReportPreferences();
    if (!authorName.trim()) {
        return null;
    }
    const displayName = formatAssigneeLabel(authorName, authors ? resolveAuthorDepartment(authors, authorName) : null);
    return (_jsxs("div", { className: `flex min-w-0 items-center gap-[6px] ${className}`, children: [createdAt ? _jsx("span", { className: "shrink-0 text-[12px] tabular-nums text-[var(--adaptive-black500)]", children: formatTimeCompact(createdAt, locale) }) : null, _jsx("p", { className: "min-w-0 truncate text-[12px] text-[var(--adaptive-black500)]", title: displayName, children: displayName }), showMine ? _jsx(FeedbackMineBadge, {}) : null, showCreator ? _jsx(FeedbackCreatorBadge, {}) : null, trailing] }));
}
//# sourceMappingURL=ThreadAuthorMeta.js.map