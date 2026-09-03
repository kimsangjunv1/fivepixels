import { jsx as _jsx, Fragment as _Fragment } from "react/jsx-runtime";
import { getDefaultFields } from "../../shared/i18n/index.js";
import { useReportState } from "../../shared/hooks/report/useReportState.js";
import { resolveReportEnabled } from "../../shared/utils/shared/env.js";
import { resolveReportProject } from "../../shared/utils/report/reportProject.js";
import { resolveFivePixelsRequire } from "../../shared/utils/report/resolveRequire.js";
import { resolveReportTeam } from "../../shared/utils/report/reportTeam.js";
import { resolveReportUi } from "../../shared/utils/report/reportUi.js";
import { resolveReportVisibility } from "../../shared/utils/report/reportVisibility.js";
import { ReportContext, ReportDataContext, ReportPreferencesContext, ReportSessionContext, useReportContextSlices, } from "./reportContext.js";
function ReportProviderEnabled({ projectId, environment, appVersion, panelAppearance, tooltipAppearance, questionThreadDefault, threadLayoutDefault, replyHistory, fields, authors, requireReviewerKey, shortcut, identify, adapter, onNavigate, onRevealTarget, onEvent, onReply, github, routeKey, showFeedbackList, visibleShortcutKeys, locale, messageOverrides, pixelsMode, sync, requireAuth, networkMonitor, children, }) {
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
        shortcut,
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
        visibleShortcutKeys,
        initialLocale: locale,
        messageOverrides,
        networkMonitor,
    });
    const { preferences, session, data } = useReportContextSlices(value);
    return (_jsx(ReportContext.Provider, { value: value, children: _jsx(ReportPreferencesContext.Provider, { value: preferences, children: _jsx(ReportSessionContext.Provider, { value: session, children: _jsx(ReportDataContext.Provider, { value: data, children: children }) }) }) }));
}
export function ReportProvider({ project, ui, visibility, team, mode = "default", sync = "local", require: requireProp, requireAuth, adapter, fields, onNavigate, onRevealTarget, onEvent, onReply, github, networkMonitor = true, children, }) {
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
        return _jsx(_Fragment, { children: children });
    }
    return (_jsx(ReportProviderEnabled, { projectId: resolvedProject.projectId, environment: resolvedProject.environment, appVersion: resolvedProject.appVersion, panelAppearance: resolvedUi.panelAppearance, tooltipAppearance: resolvedUi.tooltipAppearance, showFeedbackList: resolvedUi.showFeedbackList, visibleShortcutKeys: resolvedUi.visibleShortcutKeys, questionThreadDefault: resolvedUi.questionThreadDefault, threadLayoutDefault: resolvedUi.threadLayoutDefault, replyHistory: resolvedUi.replyHistory, shortcut: resolvedUi.shortcut, fields: resolvedFields, authors: resolvedTeam.reviewers, requireReviewerKey: resolvedTeam.requireReviewerKey, identify: resolvedTeam.user, adapter: adapter, onNavigate: onNavigate, onRevealTarget: onRevealTarget, onEvent: onEvent, onReply: onReply, github: github, routeKey: resolvedVisibility.routeKey, locale: resolvedUi.locale, messageOverrides: ui?.messages, pixelsMode: mode, sync: sync, requireAuth: resolvedRequire.authLogin, networkMonitor: networkMonitor, children: children }));
}
//# sourceMappingURL=ReportProvider.js.map