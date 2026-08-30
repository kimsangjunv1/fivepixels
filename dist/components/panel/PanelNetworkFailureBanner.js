import { jsx as _jsx } from "react/jsx-runtime";
import { useReport, useReportPreferences, useReportSession } from "../../providers/reportContext.js";
import { formatApiFlowSummaryLine } from "../../utils/network/formatApiFlowEntry.js";
import { ReportPanelNoticeDialog } from "./ReportPanelNoticeDialog.js";
export function PanelNetworkFailureBanner() {
    const { messages } = useReportPreferences();
    const { activeApiFailureAlert, dismissFailureAlert, openPanelTab, networkMonitorEnabled } = useReport();
    const { draft } = useReportSession();
    if (!networkMonitorEnabled || !activeApiFailureAlert || draft) {
        return null;
    }
    return (_jsx(ReportPanelNoticeDialog, { role: "alert", title: messages.apiFlow.alertTitle, description: formatApiFlowSummaryLine(activeApiFailureAlert, messages), actions: [
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