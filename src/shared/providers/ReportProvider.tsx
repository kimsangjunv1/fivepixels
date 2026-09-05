import type { FivePixelsSync } from "@/shared/constants/loginMethod.js";
import { getDefaultFields } from "@/shared/i18n/index.js";
import type { DeepPartialReportMessages, ReportLocale } from "@/shared/i18n/types.js";
import { useReportState } from "@/shared/hooks/report/useReportState.js";
import type { ReportProviderProps } from "@/shared/types/publicApi.js";
import type { FivePixelsAdapter } from "@/shared/types/adapter.js";
import type {
    ReportAuthor,
    ReportField,
    FivePixelsMode,
    ReportIdentify,
    ReportUi,
} from "@/shared/types/report.js";
import { resolveReportEnabled } from "@/shared/utils/shared/env.js";
import { resolveReportProject } from "@/shared/utils/report/reportProject.js";
import { resolveFivePixelsRequire } from "@/shared/utils/report/resolveRequire.js";
import { resolveReportTeam } from "@/shared/utils/report/reportTeam.js";
import { resolveReportUi, type ResolvedReportUi } from "@/shared/utils/report/reportUi.js";
import { resolveReportVisibility } from "@/shared/utils/report/reportVisibility.js";
import {
    ReportContext,
    ReportDataContext,
    ReportPreferencesContext,
    ReportSessionContext,
    useReportContextSlices,
} from "./reportContext.js";

export type { ReportProviderProps } from "@/shared/types/publicApi.js";

type ReportProviderEnabledProps = Omit<ReportProviderProps, "project" | "ui" | "visibility" | "team" | "require" | "requireAuth"> & {
    projectId: string;
    environment?: string;
    appVersion?: string;
    panelAppearance: NonNullable<ReportUi["panelAppearance"]>;
    tooltipAppearance: NonNullable<ReportUi["tooltipAppearance"]>;
    showFeedbackList: boolean;
    questionThreadDefault: NonNullable<ReportUi["questionThreadDefault"]>;
    threadLayoutDefault: NonNullable<ReportUi["threadLayoutDefault"]>;
    replyHistory: NonNullable<ResolvedReportUi["replyHistory"]>;
    fields: ReportField[];
    routeKey?: string;
    identify?: ReportIdentify;
    authors: ReportAuthor[];
    requireReviewerKey: boolean;
    locale: ReportLocale;
    messageOverrides?: DeepPartialReportMessages;
    pixelsMode: FivePixelsMode;
    sync: FivePixelsSync;
    requireAuth: boolean;
    networkMonitor: boolean;
};

function ReportProviderEnabled({
    projectId,
    environment,
    appVersion,
    panelAppearance,
    tooltipAppearance,
    questionThreadDefault,
    threadLayoutDefault,
    replyHistory,
    fields,
    authors,
    requireReviewerKey,
    identify,
    adapter,
    onNavigate,
    onRevealTarget,
    onEvent,
    onReply,
    github,
    routeKey,
    showFeedbackList,
    locale,
    messageOverrides,
    pixelsMode,
    sync,
    requireAuth,
    networkMonitor,
    children,
}: ReportProviderEnabledProps) {
    const value = useReportState({
        projectId,
        environment,
        appVersion,
        panelAppearance,
        tooltipAppearance,
        questionThreadDefault,
        threadLayoutDefault,
        replyHistory,
        fields,
        authors,
        requireReviewerKey,
        identify,
        pixelsMode,
        sync,
        requireAuth,
        adapter,
        onNavigate,
        onRevealTarget,
        onEvent,
        onReply,
        github,
        routeKey,
        showFeedbackList,
        initialLocale: locale,
        messageOverrides,
        networkMonitor,
    });
    const { preferences, session, data } = useReportContextSlices(value);

    return (
        <ReportContext.Provider value={value}>
            <ReportPreferencesContext.Provider value={preferences}>
                <ReportSessionContext.Provider value={session}>
                    <ReportDataContext.Provider value={data}>{children}</ReportDataContext.Provider>
                </ReportSessionContext.Provider>
            </ReportPreferencesContext.Provider>
        </ReportContext.Provider>
    );
}

export function ReportProvider({
    project,
    ui,
    visibility,
    team,
    mode = "default",
    sync = "local",
    require: requireProp,
    requireAuth,
    adapter,
    fields,
    onNavigate,
    onRevealTarget,
    onEvent,
    onReply,
    github,
    networkMonitor = true,
    children,
}: ReportProviderProps) {
    const resolvedProject = resolveReportProject({ project });
    const resolvedUi = resolveReportUi({ ui });
    const resolvedVisibility = resolveReportVisibility({ visibility });
    const resolvedRequire = resolveFivePixelsRequire({
        sync,
        require: requireProp,
        requireAuth,
        teamRequireReviewerKey: team?.requireReviewerKey,
    });
    const resolvedTeam = resolveReportTeam({
        team,
        requireReviewerKey: resolvedRequire.reviewerKey,
    });
    const resolvedFields = fields ?? getDefaultFields(resolvedUi.messages);

    if (!resolveReportEnabled(resolvedVisibility)) {
        return <>{children}</>;
    }

    return (
        <ReportProviderEnabled
            projectId={resolvedProject.projectId}
            environment={resolvedProject.environment}
            appVersion={resolvedProject.appVersion}
            panelAppearance={resolvedUi.panelAppearance}
            tooltipAppearance={resolvedUi.tooltipAppearance}
            showFeedbackList={resolvedUi.showFeedbackList}
            questionThreadDefault={resolvedUi.questionThreadDefault}
            threadLayoutDefault={resolvedUi.threadLayoutDefault}
            replyHistory={resolvedUi.replyHistory}
            fields={resolvedFields}
            authors={resolvedTeam.reviewers}
            requireReviewerKey={resolvedTeam.requireReviewerKey}
            identify={resolvedTeam.user}
            adapter={adapter}
            onNavigate={onNavigate}
            onRevealTarget={onRevealTarget}
            onEvent={onEvent}
            onReply={onReply}
            github={github}
            routeKey={resolvedVisibility.routeKey}
            locale={resolvedUi.locale}
            messageOverrides={ui?.messages}
            pixelsMode={mode}
            sync={sync}
            requireAuth={resolvedRequire.authLogin}
            networkMonitor={networkMonitor}
        >
            {children}
        </ReportProviderEnabled>
    );
}
