import type { ReactNode } from "react";
import type { ReportPanelTab } from "@/shared/types/report-ui.js";
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

type PanelContentProps = {
    activeTab: ReportPanelTab | null;
    blocked: boolean;
    showFeedbackList: boolean;
    settings: ReactNode;
    command: ReactNode;
};

/** Exhaustive panel content router. Start here when tracing a panel tab. */
export function PanelContent({ activeTab, blocked, showFeedbackList, settings, command }: PanelContentProps) {
    if (!activeTab || blocked) {
        return null;
    }

    switch (activeTab) {
        case "overview":
            return <ReportOverview />;
        case "route-details":
            return <ReportRouteDetails />;
        case "feedback-list":
            return showFeedbackList ? <ReportFeedbackList listKind="feedback" /> : null;
        case "memo-list":
            return showFeedbackList ? <ReportFeedbackList listKind="memo" /> : null;
        case "diagnostics":
            return <ReportAuthDiagnostics />;
        case "api-flow":
            return <ReportApiFlowPanel />;
        case "my-tasks":
            return <ReportMyTasksPanel />;
        case "page-brief":
            return <ReportPageBriefPanel />;
        case "needs-attention":
            return <ReportNeedsAttentionPanel />;
        case "project-health":
            return <ReportProjectHealthPanel />;
        case "today-digest":
            return <ReportTodayDigestPanel />;
        case "settings":
            return settings;
        case "command":
            return command;
    }
}
