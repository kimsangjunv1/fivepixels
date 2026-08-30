import { useReport, useReportPreferences, useReportSession } from "@/providers/reportContext.js";
import { formatApiFlowSummaryLine } from "@/utils/network/formatApiFlowEntry.js";
import { ReportPanelNoticeDialog } from "./ReportPanelNoticeDialog.js";

export function DraftNetworkErrorBanner() {
    const { messages } = useReportPreferences();
    const { draft } = useReportSession();
    const { activeApiFailureAlert, appendApiFlowEntryToDraftCase } = useReport();

    if (!draft || !activeApiFailureAlert) {
        return null;
    }

    return (
        <ReportPanelNoticeDialog
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
