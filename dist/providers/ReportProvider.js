import { jsx as _jsx, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect } from "react";
import { getDefaultFields, setActiveReportMessages } from "../i18n/index.js";
import { useReportState } from "../hooks/useReportState.js";
import { resolveReportEnabled } from "../utils/env.js";
import { resolveReportProject } from "../utils/reportProject.js";
import { resolveReportTeam } from "../utils/reportTeam.js";
import { resolveReportUi } from "../utils/reportUi.js";
import { resolveReportVisibility } from "../utils/reportVisibility.js";
import { ReportContext } from "./reportContext.js";
function ReportProviderEnabled({ projectId, environment, appVersion, appearance, fields, authors, shortcut, identify, onList, onCreate, onUpdate, onDelete, onEvent, onReply, routeKey, showFeedbackList, visibleShortcutKeys, locale, messages, children, }) {
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
    return _jsx(ReportContext.Provider, { value: value, children: children });
}
export function ReportProvider({ project, projectId, environment, appVersion, ui, appearance, showFeedbackList, visibleShortcutKeys, shortcut, visibility, enabled, devOnly, routeKey, pathname, team, identify, authors, fields, onList, onCreate, onUpdate, onDelete, onEvent, onReply, children, }) {
    const resolvedProject = resolveReportProject({ project, projectId, environment, appVersion });
    const resolvedUi = resolveReportUi({ ui, appearance, showFeedbackList, visibleShortcutKeys, shortcut });
    const resolvedVisibility = resolveReportVisibility({ visibility, enabled, devOnly, routeKey, pathname });
    const resolvedTeam = resolveReportTeam({ team, identify, authors });
    const resolvedFields = fields ?? getDefaultFields(resolvedUi.messages);
    if (!resolveReportEnabled(resolvedVisibility)) {
        return _jsx(_Fragment, { children: children });
    }
    return (_jsx(ReportProviderEnabled, { projectId: resolvedProject.projectId, environment: resolvedProject.environment, appVersion: resolvedProject.appVersion, appearance: resolvedUi.appearance, showFeedbackList: resolvedUi.showFeedbackList, visibleShortcutKeys: resolvedUi.visibleShortcutKeys, shortcut: resolvedUi.shortcut, fields: resolvedFields, authors: resolvedTeam.reviewers, identify: resolvedTeam.user, onList: onList, onCreate: onCreate, onUpdate: onUpdate, onDelete: onDelete, onEvent: onEvent, onReply: onReply, routeKey: resolvedVisibility.routeKey, locale: resolvedUi.locale, messages: resolvedUi.messages, children: children }));
}
//# sourceMappingURL=ReportProvider.js.map