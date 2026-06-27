"use client";

import { DEFAULT_FIELDS } from "@/constants/report.js";
import { ReportProvider } from "@/providers/ReportProvider.js";
import { resolveReportEnabled } from "@/utils/env.js";
import { resolveReportVisibility } from "@/utils/reportVisibility.js";
import type {
    CreateReportFeedbackPayload,
    CreateReplyPayload,
    ReportEvent,
    ReportFeedback,
    ReportField,
    ReportGitHubConfig,
    ReportListAllParams,
    ReportListAllResult,
    ReportProject,
    ReportReply,
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
    onListReplies?: (commentId: string) => Promise<ReportReply[]>;
    onNavigate?: (pathname: string) => void | Promise<void>;
    onRevealTarget?: (report: ReportFeedback) => boolean | Promise<boolean>;
    onCreate?: (payload: CreateReportFeedbackPayload) => Promise<ReportFeedback>;
    onCreateReply?: (commentId: string, payload: CreateReplyPayload) => Promise<ReportReply>;
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
    onListReplies,
    onNavigate,
    onRevealTarget,
    onCreate,
    onCreateReply,
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
            onListReplies={onListReplies}
            onNavigate={onNavigate}
            onRevealTarget={onRevealTarget}
            onCreate={onCreate}
            onCreateReply={onCreateReply}
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
