import { jsx as _jsx } from "react/jsx-runtime";
export function FeedbackFieldTags({ tags }) {
    if (tags.length === 0) {
        return null;
    }
    return (_jsx("div", { className: "flex flex-wrap items-center gap-[6px]", children: tags.map((tag) => (_jsx("span", { className: "rounded-[8px] border border-[var(--adaptive-black600)] px-[8px] py-[4px] text-[12px] font-semibold uppercase text-[var(--adaptive-black500)]", children: tag.label }, tag.key))) }));
}
//# sourceMappingURL=FeedbackFieldTags.js.map