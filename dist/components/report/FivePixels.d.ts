import type { CreateReportFeedbackPayload, ReportEvent, ReportFeedback, ReportField, ReportAuthor, ReportGitHubConfig, ReportIdentify, ReportListAllParams, ReportListAllResult, ReportProject, ReportTeam, ReportUi, ReportVisibility, UpdateReportFeedbackPayload } from "../../types/report.js";
export type FivePixelsProps = {
    project?: ReportProject;
    /** @deprecated Use `project.id`. */
    projectId?: string;
    /** @deprecated Use `project.env`. */
    environment?: string;
    /** @deprecated Use `project.version`. */
    appVersion?: string;
    ui?: ReportUi;
    /** @deprecated Use `ui.appearance`. */
    appearance?: ReportUi["appearance"];
    /** @deprecated Use `ui.showFeedbackList`. */
    showFeedbackList?: boolean;
    /** @deprecated Use `ui.visibleShortcutKeys`. */
    visibleShortcutKeys?: boolean;
    /** @deprecated Use `ui.shortcut`. */
    shortcut?: string;
    visibility?: ReportVisibility;
    /** @deprecated Use `visibility.enabled`. */
    enabled?: boolean;
    /** @deprecated Use `visibility.devOnly`. */
    devOnly?: boolean;
    /** @deprecated Use `visibility.routeKey`. */
    routeKey?: string;
    /** @deprecated Use `visibility.routeKey`. */
    pathname?: string;
    team?: ReportTeam;
    /** @deprecated Use `team.user`. */
    identify?: ReportIdentify;
    /** @deprecated Use `team.reviewers`. */
    authors?: ReportAuthor[];
    fields?: ReportField[];
    onList?: (params: {
        pathname: string;
    }) => Promise<ReportFeedback[]>;
    onListAll?: (params: ReportListAllParams) => Promise<ReportListAllResult>;
    onNavigate?: (pathname: string) => void | Promise<void>;
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
export declare function FivePixels({ project, projectId, environment, appVersion, ui, appearance, showFeedbackList, visibleShortcutKeys, shortcut, visibility, enabled, devOnly, routeKey, pathname, team, identify, authors, fields, onList, onListAll, onNavigate, onCreate, onUpdate, onDelete, onEvent, onReply, github, }: FivePixelsProps): import("react/jsx-runtime").JSX.Element | null;
//# sourceMappingURL=FivePixels.d.ts.map