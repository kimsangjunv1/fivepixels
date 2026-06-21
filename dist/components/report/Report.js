"use client";
import { jsx as _jsx } from "react/jsx-runtime";
import { DEFAULT_FIELDS } from "../../constants/report.js";
import { ReportProvider } from "../../providers/ReportProvider.js";
import { resolveReportEnabled } from "../../utils/env.js";
import { resolveReportVisibility } from "../../utils/reportVisibility.js";
import { ReportView } from "./ReportView.js";
export function Report({ project, projectId, environment, appVersion, ui, appearance, showFeedbackList, visibleShortcutKeys, shortcut, visibility, enabled, devOnly, routeKey, pathname, team, identify, authors, fields = DEFAULT_FIELDS, onList, onListAll, onNavigate, onCreate, onUpdate, onDelete, onEvent, onReply, github, }) {
    const resolvedVisibility = resolveReportVisibility({ visibility, enabled, devOnly, routeKey, pathname });
    if (!resolveReportEnabled(resolvedVisibility)) {
        return null;
    }
    return (_jsx(ReportProvider, { project: project, projectId: projectId, environment: environment, appVersion: appVersion, ui: ui, appearance: appearance, showFeedbackList: showFeedbackList, visibleShortcutKeys: visibleShortcutKeys, shortcut: shortcut, visibility: visibility, enabled: enabled, devOnly: devOnly, routeKey: routeKey, pathname: pathname, team: team, identify: identify, authors: authors, fields: fields, onList: onList, onListAll: onListAll, onNavigate: onNavigate, onCreate: onCreate, onUpdate: onUpdate, onDelete: onDelete, onEvent: onEvent, onReply: onReply, github: github, children: _jsx(ReportView, {}) }));
}
//# sourceMappingURL=Report.js.map