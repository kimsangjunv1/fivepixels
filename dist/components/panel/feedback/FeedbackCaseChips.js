import { jsx as _jsx } from "react/jsx-runtime";
export function FeedbackCaseChips({ cases, caseIds }) {
    if (caseIds.length === 0) {
        return null;
    }
    const chips = caseIds.flatMap((caseId) => {
        const label = cases.find((item) => item.id === caseId)?.text.trim();
        return label ? [{ caseId, label }] : [];
    });
    if (chips.length === 0) {
        return null;
    }
    return (_jsx("div", { className: "flex flex-wrap gap-[4px]", children: chips.map(({ caseId, label }) => (_jsx("span", { className: "max-w-full truncate rounded-full bg-[var(--adaptive-blue100)] px-[8px] py-[2px] text-[11px] font-medium text-[var(--adaptive-blue500)]", children: label }, caseId))) }));
}
//# sourceMappingURL=FeedbackCaseChips.js.map