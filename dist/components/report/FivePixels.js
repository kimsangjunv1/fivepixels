"use client";
import { jsx as _jsx } from "react/jsx-runtime";
import { DEFAULT_FIELDS } from "../../constants/report.js";
import { ReportProvider } from "../../providers/ReportProvider.js";
import { resolveReportEnabled } from "../../utils/shared/env.js";
import { resolveReportVisibility } from "../../utils/report/reportVisibility.js";
import { isInsideDevicePreviewFrame } from "../../utils/overlay/devicePreviewFrame.js";
import { ReportView } from "./ReportView.js";
export function FivePixels({ project, ui, visibility, team, mode = "default", sync = "local", adapter, fields = DEFAULT_FIELDS, onNavigate, onRevealTarget, onEvent, onReply, github, }) {
    const resolvedVisibility = resolveReportVisibility({ visibility });
    if (!resolveReportEnabled(resolvedVisibility)) {
        return null;
    }
    if (isInsideDevicePreviewFrame()) {
        return null;
    }
    return (_jsx(ReportProvider, { project: project, ui: ui, visibility: visibility, team: team, mode: mode, sync: sync, adapter: adapter, fields: fields, onNavigate: onNavigate, onRevealTarget: onRevealTarget, onEvent: onEvent, onReply: onReply, github: github, children: _jsx(ReportView, {}) }));
}
//# sourceMappingURL=FivePixels.js.map