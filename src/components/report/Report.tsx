"use client";

import { DEFAULT_FIELDS } from "../../constants/report.js";
import { ReportProvider } from "../../providers/ReportProvider.js";
import { resolveReportEnabled } from "../../utils/env.js";
import { resolveReportVisibility } from "../../utils/reportVisibility.js";
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
} from "../../types/report.js";
import { ReportView } from "./ReportView.js";

export type ReportProps = {
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
};

export function Report({
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
    fields = DEFAULT_FIELDS,
    onList,
    onCreate,
    onUpdate,
    onDelete,
    onEvent,
    onReply,
}: ReportProps) {
    const resolvedVisibility = resolveReportVisibility({ visibility, enabled, devOnly, routeKey, pathname });

    if (!resolveReportEnabled(resolvedVisibility)) {
        return null;
    }

    return (
        <ReportProvider
            project={project}
            projectId={projectId}
            environment={environment}
            appVersion={appVersion}
            ui={ui}
            appearance={appearance}
            showFeedbackList={showFeedbackList}
            visibleShortcutKeys={visibleShortcutKeys}
            shortcut={shortcut}
            visibility={visibility}
            enabled={enabled}
            devOnly={devOnly}
            routeKey={routeKey}
            pathname={pathname}
            team={team}
            identify={identify}
            authors={authors}
            fields={fields}
            onList={onList}
            onCreate={onCreate}
            onUpdate={onUpdate}
            onDelete={onDelete}
            onEvent={onEvent}
            onReply={onReply}
        >
            <ReportView />
        </ReportProvider>
    );
}
