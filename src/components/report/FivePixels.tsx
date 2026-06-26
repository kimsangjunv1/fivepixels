"use client";

import { DEFAULT_FIELDS } from "@/constants/report.js";
import { ReportProvider } from "@/providers/ReportProvider.js";
import { resolveReportEnabled } from "@/utils/env.js";
import { resolveReportVisibility } from "@/utils/reportVisibility.js";
import type {
    CreateReportFeedbackPayload,
    ReportEvent,
    ReportFeedback,
    ReportField,
    ReportGitHubConfig,
    ReportListAllParams,
    ReportListAllResult,
    ReportProject,
    ReportTeam,
    ReportUi,
    ReportVisibility,
    UpdateReportFeedbackPayload,
} from "@/types/report.js";
import { ReportView } from "./ReportView.js";

export type FivePixelsProps = {
    project?: ReportProject;
    ui?: ReportUi;
    visibility?: ReportVisibility;
    team?: ReportTeam;
    fields?: ReportField[];
    onList?: (params: { pathname: string }) => Promise<ReportFeedback[]>;
    onListAll?: (params: ReportListAllParams) => Promise<ReportListAllResult>;
    onNavigate?: (pathname: string) => void | Promise<void>;
    onRevealTarget?: (report: ReportFeedback) => boolean | Promise<boolean>;
    onCreate?: (payload: CreateReportFeedbackPayload) => Promise<ReportFeedback>;
    onUpdate?: (id: string, payload: UpdateReportFeedbackPayload) => Promise<ReportFeedback>;
    onDelete?: (id: string) => Promise<void>;
    onEvent?: (event: ReportEvent) => void | Promise<void>;
    onReply?: (params: { feedbackId: string; message: string }) => void | Promise<void>;
    github?: ReportGitHubConfig;
};

export function FivePixels({
    project,
    ui,
    visibility,
    team,
    fields = DEFAULT_FIELDS,
    onList,
    onListAll,
    onNavigate,
    onRevealTarget,
    onCreate,
    onUpdate,
    onDelete,
    onEvent,
    onReply,
    github,
}: FivePixelsProps) {
    const resolvedVisibility = resolveReportVisibility({ visibility });

    if (!resolveReportEnabled(resolvedVisibility)) {
        return null;
    }

    return (
        <ReportProvider
            project={project}
            ui={ui}
            visibility={visibility}
            team={team}
            fields={fields}
            onList={onList}
            onListAll={onListAll}
            onNavigate={onNavigate}
            onRevealTarget={onRevealTarget}
            onCreate={onCreate}
            onUpdate={onUpdate}
            onDelete={onDelete}
            onEvent={onEvent}
            onReply={onReply}
            github={github}
        >
            <ReportView />
        </ReportProvider>
    );
}
