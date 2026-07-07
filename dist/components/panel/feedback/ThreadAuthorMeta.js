import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { FeedbackCreatorBadge } from "./FeedbackCreatorBadge.js";
export function ThreadAuthorMeta({ authorName, createdAt, showCreator = false, trailing }) {
    if (!authorName.trim()) {
        return null;
    }
    return (_jsx("div", { className: "flex items-center justify-between gap-[8px]", children: _jsxs("div", { className: "flex min-w-0 items-center gap-[6px]", children: [_jsx("p", { className: "truncate text-[12px] text-[var(--adaptive-black500)]", children: authorName }), showCreator ? _jsx(FeedbackCreatorBadge, {}) : null, trailing] }) }));
}
//# sourceMappingURL=ThreadAuthorMeta.js.map