import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useReportPreferences } from "../../../providers/reportContext.js";
import { formatTimeCompact } from "../../../utils/shared/format.js";
import { FeedbackCreatorBadge } from "./FeedbackCreatorBadge.js";
export function ThreadAuthorMeta({ authorName, createdAt, showCreator = false, trailing }) {
    const { locale } = useReportPreferences();
    if (!authorName.trim()) {
        return null;
    }
    return (_jsxs("div", { className: "flex min-w-0 items-center gap-[6px]", children: [createdAt ? _jsx("span", { className: "shrink-0 text-[12px] tabular-nums text-[var(--adaptive-black500)]", children: formatTimeCompact(createdAt, locale) }) : null, _jsx("p", { className: "min-w-0 truncate text-[12px] text-[var(--adaptive-black500)]", children: authorName }), showCreator ? _jsx(FeedbackCreatorBadge, {}) : null, trailing] }));
}
//# sourceMappingURL=ThreadAuthorMeta.js.map