import { jsx as _jsx, Fragment as _Fragment } from "react/jsx-runtime";
import { DEFAULT_FIELDS } from "../constants/report.js";
import { useReportState } from "../hooks/useReportState.js";
import { resolveReportEnabled } from "../utils/env.js";
import { ReportContext } from "./reportContext.js";
function ReportProviderEnabled({ appearance = "system", fields = DEFAULT_FIELDS, onEvent, onFeedbackCreate, onFeedbackDelete, onFeedbackReply, onFeedbackUpdate, pathname, showFeedbackList = true, storage = "local", visibleShortcutKeys = false, children, }) {
    const value = useReportState({
        appearance,
        fields,
        onEvent,
        onFeedbackCreate,
        onFeedbackDelete,
        onFeedbackReply,
        onFeedbackUpdate,
        pathname,
        showFeedbackList,
        storage,
        visibleShortcutKeys,
    });
    return _jsx(ReportContext.Provider, { value: value, children: children });
}
export function ReportProvider({ appearance = "system", devOnly = false, enabled = true, fields = DEFAULT_FIELDS, onEvent, onFeedbackCreate, onFeedbackDelete, onFeedbackReply, onFeedbackUpdate, pathname, showFeedbackList = true, storage = "local", visibleShortcutKeys = false, children, }) {
    if (!resolveReportEnabled({ enabled, devOnly })) {
        return _jsx(_Fragment, { children: children });
    }
    return (_jsx(ReportProviderEnabled, { appearance: appearance, fields: fields, onEvent: onEvent, onFeedbackCreate: onFeedbackCreate, onFeedbackDelete: onFeedbackDelete, onFeedbackReply: onFeedbackReply, onFeedbackUpdate: onFeedbackUpdate, pathname: pathname, showFeedbackList: showFeedbackList, storage: storage, visibleShortcutKeys: visibleShortcutKeys, children: children }));
}
//# sourceMappingURL=ReportProvider.js.map