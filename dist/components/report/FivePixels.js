"use client";
import { jsx as _jsx } from "react/jsx-runtime";
import { DEFAULT_FIELDS } from "@/constants/report.js";
import { ReportProvider } from "@/providers/ReportProvider.js";
import { resolveReportEnabled } from "@/utils/env.js";
import { resolveReportVisibility } from "@/utils/reportVisibility.js";
import { ReportView } from "./ReportView.js";
export function FivePixels({ project, ui, visibility, team, fields = DEFAULT_FIELDS, onList, onListAll, onNavigate, onRevealTarget, onCreate, onUpdate, onDelete, onEvent, onReply, github, }) {
    const resolvedVisibility = resolveReportVisibility({ visibility });
    if (!resolveReportEnabled(resolvedVisibility)) {
        return null;
    }
    return (_jsx(ReportProvider, { project: project, ui: ui, visibility: visibility, team: team, fields: fields, onList: onList, onListAll: onListAll, onNavigate: onNavigate, onRevealTarget: onRevealTarget, onCreate: onCreate, onUpdate: onUpdate, onDelete: onDelete, onEvent: onEvent, onReply: onReply, github: github, children: _jsx(ReportView, {}) }));
}
//# sourceMappingURL=FivePixels.js.map