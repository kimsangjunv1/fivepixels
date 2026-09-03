"use client";

import { DEFAULT_FIELDS } from "@/shared/constants/report.js";
import { ReportProvider } from "@/shared/providers/ReportProvider.js";
import { resolveReportEnabled } from "@/shared/utils/shared/env.js";
import { resolveReportVisibility } from "@/shared/utils/report/reportVisibility.js";
import type { FivePixelsProps } from "@/shared/types/publicApi.js";
import { isInsidePreviewGuestFrame } from "@/surfaces/preview/previewGuestFrame.js";
import { ReportView } from "./ReportView.js";

export type { FivePixelsProps, FivePixelsRequire, ResolvedFivePixelsRequire } from "@/shared/types/publicApi.js";
export type { FivePixelsAdapter } from "@/shared/types/adapter.js";

export function FivePixels({
    project,
    ui,
    visibility,
    team,
    mode = "default",
    sync = "local",
    require: requireProp,
    requireAuth,
    adapter,
    fields = DEFAULT_FIELDS,
    onNavigate,
    onRevealTarget,
    onEvent,
    onReply,
    github,
    networkMonitor,
}: FivePixelsProps) {
    const resolvedVisibility = resolveReportVisibility({ visibility });

    if (!resolveReportEnabled(resolvedVisibility)) {
        return null;
    }

    if (isInsidePreviewGuestFrame()) {
        return null;
    }

    return (
        <ReportProvider
            project={project}
            ui={ui}
            visibility={visibility}
            team={team}
            mode={mode}
            sync={sync}
            require={requireProp}
            requireAuth={requireAuth}
            adapter={adapter}
            fields={fields}
            onNavigate={onNavigate}
            onRevealTarget={onRevealTarget}
            onEvent={onEvent}
            onReply={onReply}
            github={github}
            networkMonitor={networkMonitor}
        >
            <ReportView />
        </ReportProvider>
    );
}
