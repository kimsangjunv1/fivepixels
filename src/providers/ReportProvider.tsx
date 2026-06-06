import type { ReactNode } from "react";
import { useEffect } from "react";
import { getDefaultFields, setActiveReportMessages } from "../i18n/index.js";
import type { ReportLocale, ReportMessages } from "../i18n/types.js";
import { useReportState } from "../hooks/useReportState.js";
import type {
    CreateReportFeedbackPayload,
    ReportEvent,
    ReportFeedback,
    ReportField,
    ReportAuthor,
    ReportIdentify,
    ReportProject,
    ReportTeam,
    ReportUi,
    ReportVisibility,
    UpdateReportFeedbackPayload,
} from "../types/report.js";
import { resolveReportEnabled } from "../utils/env.js";
import { resolveReportProject } from "../utils/reportProject.js";
import { resolveReportTeam } from "../utils/reportTeam.js";
import { resolveReportUi } from "../utils/reportUi.js";
import { resolveReportVisibility } from "../utils/reportVisibility.js";
import { ReportContext } from "./reportContext.js";

export type ReportProviderProps = {
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
    onList?: (params: { pathname: string }) => Promise<ReportFeedback[]>;
    onCreate?: (payload: CreateReportFeedbackPayload) => Promise<ReportFeedback>;
    onUpdate?: (id: string, payload: UpdateReportFeedbackPayload) => Promise<ReportFeedback>;
    onDelete?: (id: string) => Promise<void>;
    onEvent?: (event: ReportEvent) => void | Promise<void>;
    onReply?: (params: { feedbackId: string; message: string }) => void | Promise<void>;
    children: ReactNode;
};

type ReportProviderEnabledProps = Omit<
    ReportProviderProps,
    | "project"
    | "projectId"
    | "environment"
    | "appVersion"
    | "ui"
    | "appearance"
    | "showFeedbackList"
    | "visibleShortcutKeys"
    | "shortcut"
    | "visibility"
    | "enabled"
    | "devOnly"
    | "routeKey"
    | "pathname"
    | "team"
    | "identify"
    | "authors"
> & {
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
    locale: ReportLocale;
    messages: ReportMessages;
};

function ReportProviderEnabled({
    projectId,
    environment,
    appVersion,
    appearance,
    fields,
    authors,
    shortcut,
    identify,
    onList,
    onCreate,
    onUpdate,
    onDelete,
    onEvent,
    onReply,
    routeKey,
    showFeedbackList,
    visibleShortcutKeys,
    locale,
    messages,
    children,
}: ReportProviderEnabledProps) {
    useEffect(() => {
        setActiveReportMessages(messages);
    }, [messages]);

    const value = useReportState({
        projectId,
        environment,
        appVersion,
        appearance,
        fields,
        authors,
        shortcut,
        identify,
        onList,
        onCreate,
        onUpdate,
        onDelete,
        onEvent,
        onReply,
        routeKey,
        showFeedbackList,
        visibleShortcutKeys,
        locale,
        messages,
    });

    return <ReportContext.Provider value={value}>{children}</ReportContext.Provider>;
}

export function ReportProvider({
    project,
    projectId,
    environment,
    appVersion,
    ui,
    appearance,
    showFeedbackList,
    visibleShortcutKeys,
    shortcut,
    visibility,
    enabled,
    devOnly,
    routeKey,
    pathname,
    team,
    identify,
    authors,
    fields,
    onList,
    onCreate,
    onUpdate,
    onDelete,
    onEvent,
    onReply,
    children,
}: ReportProviderProps) {
    const resolvedProject = resolveReportProject({ project, projectId, environment, appVersion });
    const resolvedUi = resolveReportUi({ ui, appearance, showFeedbackList, visibleShortcutKeys, shortcut });
    const resolvedVisibility = resolveReportVisibility({ visibility, enabled, devOnly, routeKey, pathname });
    const resolvedTeam = resolveReportTeam({ team, identify, authors });
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
            identify={resolvedTeam.user}
            onList={onList}
            onCreate={onCreate}
            onUpdate={onUpdate}
            onDelete={onDelete}
            onEvent={onEvent}
            onReply={onReply}
            routeKey={resolvedVisibility.routeKey}
            locale={resolvedUi.locale}
            messages={resolvedUi.messages}
        >
            {children}
        </ReportProviderEnabled>
    );
}
