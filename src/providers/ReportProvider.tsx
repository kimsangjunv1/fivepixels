import { getDefaultFields } from "@/i18n/index.js";
import type { DeepPartialReportMessages, ReportLocale } from "@/i18n/types.js";
import { useReportState } from "@/hooks/report/useReportState.js";
import type { ReportProviderProps } from "@/types/publicApi.js";
import type {
    ReportAuthor,
    ReportField,
    FivePixelsMode,
    ReportIdentify,
    ReportUi,
} from "@/types/report.js";
import { resolveReportEnabled } from "@/utils/shared/env.js";
import { resolveReportProject } from "@/utils/report/reportProject.js";
import { resolveReportTeam } from "@/utils/report/reportTeam.js";
import { resolveReportUi, type ResolvedReportUi } from "@/utils/report/reportUi.js";
import { resolveReportVisibility } from "@/utils/report/reportVisibility.js";
import {
    ReportContext,
    ReportDataContext,
    ReportPreferencesContext,
    ReportSessionContext,
    useReportContextSlices,
} from "./reportContext.js";

export type { ReportProviderProps } from "@/types/publicApi.js";

type ReportProviderEnabledProps = Omit<ReportProviderProps, "project" | "ui" | "visibility" | "team"> & {
    projectId: string;
    environment?: string;
    appVersion?: string;
    panelAppearance: NonNullable<ReportUi["panelAppearance"]>;
    tooltipAppearance: NonNullable<ReportUi["tooltipAppearance"]>;
    showFeedbackList: boolean;
    visibleShortcutKeys: boolean;
    questionThreadDefault: NonNullable<ReportUi["questionThreadDefault"]>;
    replyHistory: NonNullable<ResolvedReportUi["replyHistory"]>;
    shortcut?: string;
    fields: ReportField[];
    routeKey?: string;
    identify?: ReportIdentify;
    authors: ReportAuthor[];
    requireReviewerKey: boolean;
    locale: ReportLocale;
    messageOverrides?: DeepPartialReportMessages;
    pixelsMode: FivePixelsMode;
};

function ReportProviderEnabled({
    projectId,
    environment,
    appVersion,
    panelAppearance,
    tooltipAppearance,
    questionThreadDefault,
    replyHistory,
    fields,
    authors,
    requireReviewerKey,
    shortcut,
    identify,
    onList,
    onListAll,
    onPanelBootstrap,
    onActivitySummary,
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
    pixelsMode,
    children,
}: ReportProviderEnabledProps) {
    const value = useReportState({
        projectId,
        environment,
        appVersion,
        panelAppearance,
        tooltipAppearance,
        questionThreadDefault,
        replyHistory,
        fields,
        authors,
        requireReviewerKey,
        shortcut,
        identify,
        pixelsMode,
        onList,
        onListAll,
        onPanelBootstrap,
        onActivitySummary,
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
    fields,
    onList,
    onListAll,
    onPanelBootstrap,
    onActivitySummary,
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
            panelAppearance={resolvedUi.panelAppearance}
            tooltipAppearance={resolvedUi.tooltipAppearance}
            showFeedbackList={resolvedUi.showFeedbackList}
            visibleShortcutKeys={resolvedUi.visibleShortcutKeys}
            questionThreadDefault={resolvedUi.questionThreadDefault}
            replyHistory={resolvedUi.replyHistory}
            shortcut={resolvedUi.shortcut}
            fields={resolvedFields}
            authors={resolvedTeam.reviewers}
            requireReviewerKey={resolvedTeam.requireReviewerKey}
            identify={resolvedTeam.user}
            onList={onList}
            onListAll={onListAll}
            onPanelBootstrap={onPanelBootstrap}
            onActivitySummary={onActivitySummary}
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
            pixelsMode={mode}
        >
            {children}
        </ReportProviderEnabled>
    );
}
