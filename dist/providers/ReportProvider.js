import { jsx as _jsx, Fragment as _Fragment } from "react/jsx-runtime";
import { DEFAULT_FIELDS } from "../constants/report.js";
import { useReportState } from "../hooks/useReportState.js";
import { resolveReportEnabled } from "../utils/env.js";
import { resolveProjectId } from "../utils/projectId.js";
import { ReportContext } from "./reportContext.js";
function ReportProviderEnabled({ projectId, environment, appVersion, appearance = "system", storage = "local", storageAdapter, fields = DEFAULT_FIELDS, authors, shortcut, identify, onEvent, onCreate, onDelete, onReply, onUpdate, pathname, showFeedbackList = true, visibleShortcutKeys = false, children, }) {
    const value = useReportState({
        projectId,
        environment,
        appVersion,
        appearance,
        fields,
        authors,
        shortcut,
        identify,
        onEvent,
        onCreate,
        onDelete,
        onReply,
        onUpdate,
        pathname,
        showFeedbackList,
        storage,
        storageAdapter,
        visibleShortcutKeys,
    });
    return _jsx(ReportContext.Provider, { value: value, children: children });
}
export function ReportProvider({ projectId, environment, appVersion, appearance = "system", devOnly = false, enabled = true, storage = "local", storageAdapter, fields = DEFAULT_FIELDS, authors, shortcut, identify, onEvent, onCreate, onDelete, onReply, onUpdate, pathname, showFeedbackList = true, visibleShortcutKeys = false, children, }) {
    const resolvedProjectId = resolveProjectId(projectId);
    if (!resolveReportEnabled({ enabled, devOnly })) {
        return _jsx(_Fragment, { children: children });
    }
    return (_jsx(ReportProviderEnabled, { projectId: resolvedProjectId, environment: environment, appVersion: appVersion, appearance: appearance, fields: fields, authors: authors, shortcut: shortcut, identify: identify, onEvent: onEvent, onCreate: onCreate, onDelete: onDelete, onReply: onReply, onUpdate: onUpdate, pathname: pathname, showFeedbackList: showFeedbackList, storage: storage, storageAdapter: storageAdapter, visibleShortcutKeys: visibleShortcutKeys, children: children }));
}
//# sourceMappingURL=ReportProvider.js.map