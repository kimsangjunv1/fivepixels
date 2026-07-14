import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useReportPreferences, useReportSession } from "../../providers/reportContext.js";
export function DraftProbeSummaryBanner() {
    const { messages } = useReportPreferences();
    const { savedProbeEdits, appendSavedProbeSummaryAsNewDraftCase } = useReportSession();
    if (Object.keys(savedProbeEdits).length === 0) {
        return null;
    }
    return (_jsxs("section", { className: "flex items-center gap-[8px] border-b border-[var(--adaptive-border-subtle)] bg-[var(--adaptive-surface-muted)] px-[12px] py-[8px]", "data-fivepixels-interactive": "", children: [_jsx("p", { className: "min-w-0 flex-1 text-[11px] font-medium leading-[1.4] text-[var(--adaptive-text-secondary)]", children: messages.composer.probeSummaryPrompt }), _jsx("button", { type: "button", "data-fivepixels-interactive": "", onClick: () => appendSavedProbeSummaryAsNewDraftCase(), className: "shrink-0 rounded-[8px] bg-[var(--adaptive-blue500)] px-[10px] py-[4px] text-[11px] font-semibold text-white", children: messages.composer.probeSummaryApply })] }));
}
//# sourceMappingURL=DraftProbeSummaryBanner.js.map