import type { CreateReportFeedbackPayload, ReportEvent, ReportFeedback, ReportField, ReportGitHubConfig, ReportListAllParams, ReportListAllResult, ReportProject, ReportTeam, ReportUi, ReportVisibility, UpdateReportFeedbackPayload } from "@/types/report.js";
export type FivePixelsProps = {
    project?: ReportProject;
    ui?: ReportUi;
    visibility?: ReportVisibility;
    team?: ReportTeam;
    fields?: ReportField[];
    onList?: (params: {
        pathname: string;
    }) => Promise<ReportFeedback[]>;
    onListAll?: (params: ReportListAllParams) => Promise<ReportListAllResult>;
    onNavigate?: (pathname: string) => void | Promise<void>;
    onRevealTarget?: (report: ReportFeedback) => boolean | Promise<boolean>;
    onCreate?: (payload: CreateReportFeedbackPayload) => Promise<ReportFeedback>;
    onUpdate?: (id: string, payload: UpdateReportFeedbackPayload) => Promise<ReportFeedback>;
    onDelete?: (id: string) => Promise<void>;
    onEvent?: (event: ReportEvent) => void | Promise<void>;
    onReply?: (params: {
        feedbackId: string;
        message: string;
    }) => void | Promise<void>;
    github?: ReportGitHubConfig;
};
export declare function FivePixels({ project, ui, visibility, team, fields, onList, onListAll, onNavigate, onRevealTarget, onCreate, onUpdate, onDelete, onEvent, onReply, github, }: FivePixelsProps): import("react/jsx-runtime").JSX.Element | null;
//# sourceMappingURL=FivePixels.d.ts.map