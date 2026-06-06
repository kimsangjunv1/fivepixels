import { jsx as _jsx } from "react/jsx-runtime";
export function FeedbackFieldTags({ tags }) {
    if (tags.length === 0) {
        return null;
    }
    return (_jsx("div", { className: "flex flex-wrap items-center gap-[6px]", children: tags.map((tag) => (_jsx("span", { className: "rounded-full border border-[var(--adaptive-black400)] px-[4px] py-[2px] text-[10px] font-semibold uppercase text-[var(--adaptive-black500)]", children: tag.label }, tag.key))) }));
}
//# sourceMappingURL=FeedbackFieldTags.js.map