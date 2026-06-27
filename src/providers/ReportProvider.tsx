import type { ReactNode } from "react";
import { getDefaultFields } from "@/i18n/index.js";
import type { DeepPartialReportMessages, ReportLocale } from "@/i18n/types.js";
import { useReportState } from "@/hooks/useReportState.js";
import type {
    CreateReportFeedbackPayload,
    CreateReplyPayload,
    ReportEvent,
    ReportFeedback,
    ReportField,
    ReportAuthor,
    ReportGitHubConfig,
    ReportIdentify,
    ReportListAllParams,
    ReportListAllResult,
    ReportProject,
    ReportReply,
    ReportTeam,
    ReportUi,
    ReportVisibility,
    UpdateReportFeedbackPayload,
} from "@/types/report.js";
import { resolveReportEnabled } from "@/utils/env.js";
import { resolveReportProject } from "@/utils/reportProject.js";
import { resolveReportTeam } from "@/utils/reportTeam.js";
import { resolveReportUi } from "@/utils/reportUi.js";
import { resolveReportVisibility } from "@/utils/reportVisibility.js";
import { ReportContext } from "./reportContext.js";

export type ReportProviderProps = {
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
    children: ReactNode;
};

type ReportProviderEnabledProps = Omit<ReportProviderProps, "project" | "ui" | "visibility" | "team"> & {
    projectId: string;
    environment?: string;
    appVersion?: string;
    appearance: NonNullable<ReportUi["appearance"]>;
    showFeedbackList: boolean;
    visibleShortcutKeys: boolean;
    shortcut?: string;
    fields: ReportField[];
    routeKey?: string;
    identify?: ReportIdentify;
    authors: ReportAuthor[];
    requireReviewerKey: boolean;
    locale: ReportLocale;
    messageOverrides?: DeepPartialReportMessages;
};

function ReportProviderEnabled({
    projectId,
    environment,
    appVersion,
    appearance,
    fields,
    authors,
    requireReviewerKey,
    shortcut,
    identify,
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
    routeKey,
    showFeedbackList,
    visibleShortcutKeys,
    locale,
    messageOverrides,
    children,
}: ReportProviderEnabledProps) {
    const value = useReportState({
        projectId,
        environment,
        appVersion,
        appearance,
        fields,
        authors,
        requireReviewerKey,
        shortcut,
        identify,
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
        routeKey,
        showFeedbackList,
        visibleShortcutKeys,
        initialLocale: locale,
        messageOverrides,
    });

    return <ReportContext.Provider value={value}>{children}</ReportContext.Provider>;
}

export function ReportProvider({
    project,
    ui,
    visibility,
    team,
    fields,
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
    children,
}: ReportProviderProps) {
    const resolvedProject = resolveReportProject({ project });
    const resolvedUi = resolveReportUi({ ui });
    const resolvedVisibility = resolveReportVisibility({ visibility });
    const resolvedTeam = resolveReportTeam({ team });
    const resolvedFields = fields ?? getDefaultFields(resolvedUi.messages);

    if (!resolveReportEnabled(resolvedVisibility)) {
        return <>{children}</>;
    }

    return (
        <ReportProviderEnabled
            projectId={resolvedProject.projectId}
            environment={resolvedProject.environment}
            appVersion={resolvedProject.appVersion}
            appearance={resolvedUi.appearance}
            showFeedbackList={resolvedUi.showFeedbackList}
            visibleShortcutKeys={resolvedUi.visibleShortcutKeys}
            shortcut={resolvedUi.shortcut}
            fields={resolvedFields}
            authors={resolvedTeam.reviewers}
            requireReviewerKey={resolvedTeam.requireReviewerKey}
            identify={resolvedTeam.user}
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
            routeKey={resolvedVisibility.routeKey}
            locale={resolvedUi.locale}
            messageOverrides={ui?.messages}
        >
            {children}
        </ReportProviderEnabled>
    );
}
