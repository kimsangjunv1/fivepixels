"use client";
import { jsx as _jsx } from "react/jsx-runtime";
import { DEFAULT_FIELDS } from "../../constants/report.js";
import { ReportProvider } from "../../providers/ReportProvider.js";
import { resolveReportEnabled } from "../../utils/env.js";
import { ReportView } from "./ReportView.js";
export function Report({ projectId, environment, appVersion, appearance = "system", storage = "local", storageAdapter, fields = DEFAULT_FIELDS, authors, shortcut, identify, onEvent, onCreate, onDelete, onReply, onUpdate, devOnly = false, enabled = true, pathname, showFeedbackList = true, visibleShortcutKeys = false, }) {
    if (!resolveReportEnabled({ enabled, devOnly })) {
        return null;
    }
    return (_jsx(ReportProvider, { projectId: projectId, environment: environment, appVersion: appVersion, appearance: appearance, fields: fields, authors: authors, shortcut: shortcut, identify: identify, onEvent: onEvent, onCreate: onCreate, onDelete: onDelete, onReply: onReply, onUpdate: onUpdate, pathname: pathname, showFeedbackList: showFeedbackList, storage: storage, storageAdapter: storageAdapter, visibleShortcutKeys: visibleShortcutKeys, children: _jsx(ReportView, {}) }));
}
//# sourceMappingURL=Report.js.map