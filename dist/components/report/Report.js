"use client";
import { jsx as _jsx } from "react/jsx-runtime";
import { DEFAULT_FIELDS } from "../../constants/report.js";
import { ReportProvider } from "../../providers/ReportProvider.js";
import { resolveReportEnabled } from "../../utils/env.js";
import { ReportView } from "./ReportView.js";
export function Report({ appearance = "system", devOnly = false, enabled = true, fields = DEFAULT_FIELDS, onEvent, onFeedbackCreate, onFeedbackDelete, onFeedbackReply, onFeedbackUpdate, pathname, showFeedbackList = true, storage = "local", visibleShortcutKeys = false, }) {
    if (!resolveReportEnabled({ enabled, devOnly })) {
        return null;
    }
    return (_jsx(ReportProvider, { appearance: appearance, fields: fields, onEvent: onEvent, onFeedbackCreate: onFeedbackCreate, onFeedbackDelete: onFeedbackDelete, onFeedbackReply: onFeedbackReply, onFeedbackUpdate: onFeedbackUpdate, pathname: pathname, showFeedbackList: showFeedbackList, storage: storage, visibleShortcutKeys: visibleShortcutKeys, children: _jsx(ReportView, {}) }));
}
//# sourceMappingURL=Report.js.map