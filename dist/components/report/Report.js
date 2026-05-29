"use client";
import { jsx as _jsx } from "react/jsx-runtime";
import { DEFAULT_FIELDS } from "../../constants/report.js";
import { ReportProvider } from "../../providers/ReportProvider.js";
import { ReportView } from "./ReportView.js";
export function Report({ appearance = "system", fields = DEFAULT_FIELDS, pathname, showFeedbackList = true, storage = "local", }) {
    return (_jsx(ReportProvider, { appearance: appearance, fields: fields, pathname: pathname, showFeedbackList: showFeedbackList, storage: storage, children: _jsx(ReportView, {}) }));
}
//# sourceMappingURL=Report.js.map