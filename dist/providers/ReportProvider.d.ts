import type { ReactNode } from "react";
import type { CreateReportFeedbackPayload, ReportEvent, ReportFeedback, ReportField, ReportGitHubConfig, ReportListAllParams, ReportListAllResult, ReportProject, ReportTeam, ReportUi, ReportVisibility, UpdateReportFeedbackPayload } from "@/types/report.js";
export type ReportProviderProps = {
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
    children: ReactNode;
};
export declare function ReportProvider({ project, ui, visibility, team, fields, onList, onListAll, onNavigate, onRevealTarget, onCreate, onUpdate, onDelete, onEvent, onReply, github, children, }: ReportProviderProps): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=ReportProvider.d.ts.map