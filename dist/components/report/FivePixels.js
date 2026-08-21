"use client";
import { jsx as _jsx } from "react/jsx-runtime";
import { DEFAULT_FIELDS } from "../../constants/report.js";
import { ReportProvider } from "../../providers/ReportProvider.js";
import { resolveReportEnabled } from "../../utils/shared/env.js";
import { resolveReportVisibility } from "../../utils/report/reportVisibility.js";
import { isInsideDevicePreviewFrame } from "../../utils/overlay/devicePreviewFrame.js";
import { ReportView } from "./ReportView.js";
export function FivePixels({ project, ui, visibility, team, mode = "default", fields = DEFAULT_FIELDS, onList, onListAll, onPanelBootstrap, onActivitySummary, onListReplies, onNavigate, onRevealTarget, onCreate, onCreateReply, onUpdate, onDelete, onListReviewers, onListReviewerRequests, onCreateReviewerRequest, onResolveReviewerRequest, onRegisterReviewer, onUpdateReviewer, onApiLogin, onApiRegister, onArtemisLogin, onEvent, onReply, github, }) {
    const resolvedVisibility = resolveReportVisibility({ visibility });
    if (!resolveReportEnabled(resolvedVisibility)) {
        return null;
    }
    // Parent owns the panel/overlays; guest iframe only renders the page so media queries match the device.
    if (isInsideDevicePreviewFrame()) {
        return null;
    }
    return (_jsx(ReportProvider, { project: project, ui: ui, visibility: visibility, team: team, mode: mode, fields: fields, onList: onList, onListAll: onListAll, onPanelBootstrap: onPanelBootstrap, onActivitySummary: onActivitySummary, onListReplies: onListReplies, onNavigate: onNavigate, onRevealTarget: onRevealTarget, onCreate: onCreate, onCreateReply: onCreateReply, onUpdate: onUpdate, onDelete: onDelete, onListReviewers: onListReviewers, onListReviewerRequests: onListReviewerRequests, onCreateReviewerRequest: onCreateReviewerRequest, onResolveReviewerRequest: onResolveReviewerRequest, onRegisterReviewer: onRegisterReviewer, onUpdateReviewer: onUpdateReviewer, onApiLogin: onApiLogin, onApiRegister: onApiRegister, onArtemisLogin: onArtemisLogin, onEvent: onEvent, onReply: onReply, github: github, children: _jsx(ReportView, {}) }));
}
//# sourceMappingURL=FivePixels.js.map