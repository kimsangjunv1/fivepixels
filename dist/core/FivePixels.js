"use client";
import { jsx as _jsx } from "react/jsx-runtime";
import { DEFAULT_FIELDS } from "../shared/constants/report.js";
import { ReportProvider } from "../shared/providers/ReportProvider.js";
import { resolveReportEnabled } from "../shared/utils/shared/env.js";
import { resolveReportVisibility } from "../shared/utils/report/reportVisibility.js";
import { isInsidePreviewGuestFrame } from "../surfaces/preview/previewGuestFrame.js";
import { ReportView } from "./ReportView.js";
export function FivePixels({ project, ui, visibility, team, mode = "default", sync = "local", require: requireProp, requireAuth, adapter, fields = DEFAULT_FIELDS, onNavigate, onRevealTarget, onEvent, onReply, github, networkMonitor, }) {
    const resolvedVisibility = resolveReportVisibility({ visibility });
    if (!resolveReportEnabled(resolvedVisibility)) {
        return null;
    }
    if (isInsidePreviewGuestFrame()) {
        return null;
    }
    return (_jsx(ReportProvider, { project: project, ui: ui, visibility: visibility, team: team, mode: mode, sync: sync, require: requireProp, requireAuth: requireAuth, adapter: adapter, fields: fields, onNavigate: onNavigate, onRevealTarget: onRevealTarget, onEvent: onEvent, onReply: onReply, github: github, networkMonitor: networkMonitor, children: _jsx(ReportView, {}) }));
}
//# sourceMappingURL=FivePixels.js.map