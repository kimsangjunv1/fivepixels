import { jsx as _jsx } from "react/jsx-runtime";
export function FeedbackFieldTags({ tags }) {
    if (tags.length === 0) {
        return null;
    }
    return (_jsx("div", { className: "flex flex-wrap items-center gap-[6px]", children: tags.map((tag) => (_jsx("span", { className: "rounded-full border border-[var(--adaptive-grey400)] px-[10px] py-[4px] text-[10px] font-semibold uppercase tracking-wide text-[var(--adaptive-grey500)]", children: tag.label }, tag.key))) }));
}
//# sourceMappingURL=FeedbackFieldTags.js.map