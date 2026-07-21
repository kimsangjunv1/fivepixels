import type { PanelRole } from "../../constants/panelRole.js";
import type { ReportMessages } from "../../i18n/types.js";
import type { ReportFeedback, ReportPanelStats } from "../../types/report.js";
export type PanelRoleStatItem = {
    key: string;
    kind: "stat" | "cta";
    label: string;
    display: string;
};
export type BuildPanelRoleStatsOptions = {
    role: PanelRole;
    reports: ReportFeedback[];
    actorName: string | null;
    fallbackStats: ReportPanelStats;
    messages: ReportMessages;
};
export declare function buildPanelRoleStats({ role, reports, actorName, fallbackStats, messages }: BuildPanelRoleStatsOptions): PanelRoleStatItem[];
//# sourceMappingURL=panelRoleStats.d.ts.map