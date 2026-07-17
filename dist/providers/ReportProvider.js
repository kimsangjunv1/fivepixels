import { jsx as _jsx, Fragment as _Fragment } from "react/jsx-runtime";
import { getDefaultFields } from "../i18n/index.js";
import { useReportState } from "../hooks/report/useReportState.js";
import { resolveReportEnabled } from "../utils/shared/env.js";
import { resolveReportProject } from "../utils/report/reportProject.js";
import { resolveReportTeam } from "../utils/report/reportTeam.js";
import { resolveReportUi } from "../utils/report/reportUi.js";
import { resolveReportVisibility } from "../utils/report/reportVisibility.js";
import { ReportContext, ReportDataContext, ReportPreferencesContext, ReportSessionContext, useReportContextSlices, } from "./reportContext.js";
function ReportProviderEnabled({ projectId, environment, appVersion, panelAppearance, tooltipAppearance, questionThreadDefault, replyHistory, fields, authors, requireReviewerKey, shortcut, identify, onList, onListAll, onPanelBootstrap, onActivitySummary, onListReplies, onNavigate, onRevealTarget, onCreate, onCreateReply, onUpdate, onDelete, onEvent, onReply, github, routeKey, showFeedbackList, visibleShortcutKeys, locale, messageOverrides, pixelsMode, children, }) {
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
    return (_jsx(ReportContext.Provider, { value: value, children: _jsx(ReportPreferencesContext.Provider, { value: preferences, children: _jsx(ReportSessionContext.Provider, { value: session, children: _jsx(ReportDataContext.Provider, { value: data, children: children }) }) }) }));
}
export function ReportProvider({ project, ui, visibility, team, mode = "default", fields, onList, onListAll, onPanelBootstrap, onActivitySummary, onListReplies, onNavigate, onRevealTarget, onCreate, onCreateReply, onUpdate, onDelete, onEvent, onReply, github, children, }) {
    const resolvedProject = resolveReportProject({ project });
    const resolvedUi = resolveReportUi({ ui });
    const resolvedVisibility = resolveReportVisibility({ visibility });
    const resolvedTeam = resolveReportTeam({ team });
    const resolvedFields = fields ?? getDefaultFields(resolvedUi.messages);
    if (!resolveReportEnabled(resolvedVisibility)) {
        return _jsx(_Fragment, { children: children });
    }
    return (_jsx(ReportProviderEnabled, { projectId: resolvedProject.projectId, environment: resolvedProject.environment, appVersion: resolvedProject.appVersion, panelAppearance: resolvedUi.panelAppearance, tooltipAppearance: resolvedUi.tooltipAppearance, showFeedbackList: resolvedUi.showFeedbackList, visibleShortcutKeys: resolvedUi.visibleShortcutKeys, questionThreadDefault: resolvedUi.questionThreadDefault, replyHistory: resolvedUi.replyHistory, shortcut: resolvedUi.shortcut, fields: resolvedFields, authors: resolvedTeam.reviewers, requireReviewerKey: resolvedTeam.requireReviewerKey, identify: resolvedTeam.user, onList: onList, onListAll: onListAll, onPanelBootstrap: onPanelBootstrap, onActivitySummary: onActivitySummary, onListReplies: onListReplies, onNavigate: onNavigate, onRevealTarget: onRevealTarget, onCreate: onCreate, onCreateReply: onCreateReply, onUpdate: onUpdate, onDelete: onDelete, onEvent: onEvent, onReply: onReply, github: github, routeKey: resolvedVisibility.routeKey, locale: resolvedUi.locale, messageOverrides: ui?.messages, pixelsMode: mode, children: children }));
}
//# sourceMappingURL=ReportProvider.js.map