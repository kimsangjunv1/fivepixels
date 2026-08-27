import { useReport, useReportPreferences, useReportSession } from "@/providers/reportContext.js";
import { formatApiFlowSummaryLine } from "@/utils/network/formatApiFlowEntry.js";

export function DraftNetworkErrorBanner() {
    const { messages } = useReportPreferences();
    const { draft } = useReportSession();
    const { activeApiFailureAlert, appendApiFlowEntryToDraftCase } = useReport();

    if (!draft || !activeApiFailureAlert) {
        return null;
    }

    return (
        <section
            className="flex items-center gap-[8px] border-b border-[var(--adaptive-red100)] bg-[var(--adaptive-red50)] px-[12px] py-[8px]"
            data-fivepixels-interactive=""
        >
            <div className="min-w-0 flex-1">
                <p className="text-[11px] font-semibold text-[var(--adaptive-red900)]">{messages.apiFlow.draftBannerTitle}</p>
                <p className="mt-[2px] text-[11px] leading-[1.4] text-[var(--adaptive-red900)]">{formatApiFlowSummaryLine(activeApiFailureAlert, messages)}</p>
            </div>
            <button
                type="button"
                data-fivepixels-interactive=""
                onClick={() => appendApiFlowEntryToDraftCase(activeApiFailureAlert.id)}
                className="shrink-0 rounded-[8px] bg-[var(--adaptive-red700)] px-[10px] py-[4px] text-[11px] font-semibold text-white"
            >
                {messages.apiFlow.draftBannerAttach}
            </button>
        </section>
    );
}
