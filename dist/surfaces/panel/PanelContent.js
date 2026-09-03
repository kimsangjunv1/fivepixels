import { jsx as _jsx } from "react/jsx-runtime";
import { ReportFeedbackList } from "./ReportFeedbackList.js";
import { ReportOverview } from "./ReportOverview.js";
import { ReportRouteDetails } from "./ReportRouteDetails.js";
import { ReportAuthDiagnostics } from "./ReportAuthDiagnostics.js";
import { ReportApiFlowPanel } from "./ReportApiFlowPanel.js";
import { ReportMyTasksPanel } from "./tabs/ReportMyTasksPanel.js";
import { ReportPageBriefPanel } from "./tabs/ReportPageBriefPanel.js";
import { ReportNeedsAttentionPanel } from "./tabs/ReportNeedsAttentionPanel.js";
import { ReportProjectHealthPanel } from "./tabs/ReportProjectHealthPanel.js";
import { ReportTodayDigestPanel } from "./tabs/ReportTodayDigestPanel.js";
/** Exhaustive panel content router. Start here when tracing a panel tab. */
export function PanelContent({ activeTab, blocked, showFeedbackList, settings, command }) {
    if (!activeTab || blocked) {
        return null;
    }
    switch (activeTab) {
        case "overview":
            return _jsx(ReportOverview, {});
        case "route-details":
            return _jsx(ReportRouteDetails, {});
        case "feedback-list":
            return showFeedbackList ? _jsx(ReportFeedbackList, { listKind: "feedback" }) : null;
        case "memo-list":
            return showFeedbackList ? _jsx(ReportFeedbackList, { listKind: "memo" }) : null;
        case "diagnostics":
            return _jsx(ReportAuthDiagnostics, {});
        case "api-flow":
            return _jsx(ReportApiFlowPanel, {});
        case "my-tasks":
            return _jsx(ReportMyTasksPanel, {});
        case "page-brief":
            return _jsx(ReportPageBriefPanel, {});
        case "needs-attention":
            return _jsx(ReportNeedsAttentionPanel, {});
        case "project-health":
            return _jsx(ReportProjectHealthPanel, {});
        case "today-digest":
            return _jsx(ReportTodayDigestPanel, {});
        case "settings":
            return settings;
        case "command":
            return command;
    }
}
//# sourceMappingURL=PanelContent.js.map