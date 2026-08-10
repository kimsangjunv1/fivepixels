import type { ReportMessages } from "../../i18n/types.js";
import type { ReportFeedback } from "../../types/report.js";
export type PanelRoleStatItem = {
    key: string;
    kind: "stat" | "cta";
    label: string;
    display: string;
};
export type BuildPanelRoleStatsOptions = {
    reports: ReportFeedback[];
    actorName: string | null;
    messages: ReportMessages;
};
/** Shared header stats for every panel role: created / replied / assigned. */
export declare function buildPanelRoleStats({ reports, actorName, messages }: BuildPanelRoleStatsOptions): PanelRoleStatItem[];
//# sourceMappingURL=panelRoleStats.d.ts.map