import { jsx as _jsx } from "react/jsx-runtime";
import { useReport } from "@/providers/reportContext.js";
export function FeedbackCreatorBadge() {
    const { messages } = useReport();
    return (_jsx("span", { className: "rounded-full border border-[var(--adaptive-border-subtle)] px-[6px] py-[1px] text-[10px] font-semibold leading-none text-[var(--adaptive-black500)]", children: messages.author.creatorLabel }));
}
//# sourceMappingURL=FeedbackCreatorBadge.js.map