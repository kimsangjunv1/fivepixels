import { jsx as _jsx } from "react/jsx-runtime";
import { useReportData, useReportPreferences, useReportSession } from "../../shared/providers/reportContext.js";
import { formatApiFlowSummaryLine } from "../../shared/utils/network/formatApiFlowEntry.js";
import { NoticeDialog } from "../../shared/components/ui/NoticeDialog.js";
export function PanelNetworkFailureBanner() {
    const { messages } = useReportPreferences();
    const { activeApiFailureAlert, dismissFailureAlert, networkMonitorEnabled } = useReportData();
    const { draft, openPanelTab } = useReportSession();
    if (!networkMonitorEnabled || !activeApiFailureAlert || draft) {
        return null;
    }
    return (_jsx(NoticeDialog, { role: "alert", title: messages.apiFlow.alertTitle, description: formatApiFlowSummaryLine(activeApiFailureAlert, messages), actions: [
            {
                id: "open",
                label: messages.apiFlow.alertOpenTab,
                variant: "primary",
                onClick: () => openPanelTab("api-flow"),
            },
            {
                id: "dismiss",
                label: messages.apiFlow.alertDismiss,
                variant: "muted",
                onClick: () => dismissFailureAlert(activeApiFailureAlert.id),
            },
        ] }));
}
//# sourceMappingURL=PanelNetworkFailureBanner.js.map