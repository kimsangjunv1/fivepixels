import { useReportData, useReportPreferences, useReportSession } from "@/providers/reportContext.js";
import { formatApiFlowSummaryLine } from "@/utils/network/formatApiFlowEntry.js";
import { NoticeDialog } from "@/components/ui/NoticeDialog.js";

export function DraftNetworkErrorBanner() {
    const { messages } = useReportPreferences();
    const { draft, appendApiFlowEntryToDraftCase } = useReportSession();
    const { activeApiFailureAlert } = useReportData();

    if (!draft || !activeApiFailureAlert) {
        return null;
    }

    return (
        <NoticeDialog
            role="alert"
            title={messages.apiFlow.draftBannerTitle}
            description={formatApiFlowSummaryLine(activeApiFailureAlert, messages)}
            actions={[
                {
                    id: "attach",
                    label: messages.apiFlow.draftBannerAttach,
                    variant: "primary",
                    onClick: () => appendApiFlowEntryToDraftCase(activeApiFailureAlert.id),
                },
            ]}
        />
    );
}
