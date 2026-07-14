import { useReport } from "@/providers/reportContext.js";

export function DraftProbeSummaryBanner() {
    const { savedProbeEdits, appendSavedProbeSummaryAsNewDraftCase, messages } = useReport();

    if (Object.keys(savedProbeEdits).length === 0) {
        return null;
    }

    return (
        <section
            className="flex items-center gap-[8px] border-b border-[var(--adaptive-border-subtle)] bg-[var(--adaptive-surface-muted)] px-[12px] py-[8px]"
            data-fivepixels-interactive=""
        >
            <p className="min-w-0 flex-1 text-[11px] font-medium leading-[1.4] text-[var(--adaptive-text-secondary)]">
                {messages.composer.probeSummaryPrompt}
            </p>
            <button
                type="button"
                data-fivepixels-interactive=""
                onClick={() => appendSavedProbeSummaryAsNewDraftCase()}
                className="shrink-0 rounded-[8px] bg-[var(--adaptive-blue500)] px-[10px] py-[4px] text-[11px] font-semibold text-white"
            >
                {messages.composer.probeSummaryApply}
            </button>
        </section>
    );
}
