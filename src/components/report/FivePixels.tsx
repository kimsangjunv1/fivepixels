"use client";

import { DEFAULT_FIELDS } from "@/constants/report.js";
import { ReportProvider } from "@/providers/ReportProvider.js";
import { resolveReportEnabled } from "@/utils/shared/env.js";
import { resolveReportVisibility } from "@/utils/report/reportVisibility.js";
import type { FivePixelsProps } from "@/types/publicApi.js";
import { ReportView } from "./ReportView.js";

export type { FivePixelsProps } from "@/types/publicApi.js";

export function FivePixels({
    project,
    ui,
    visibility,
    team,
    mode = "default",
    fields = DEFAULT_FIELDS,
    onList,
    onListAll,
    onPanelBootstrap,
    onActivitySummary,
    onListReplies,
    onNavigate,
    onRevealTarget,
    onCreate,
    onCreateReply,
    onUpdate,
    onDelete,
    onEvent,
    onReply,
    github,
}: FivePixelsProps) {
    const resolvedVisibility = resolveReportVisibility({ visibility });

    if (!resolveReportEnabled(resolvedVisibility)) {
        return null;
    }

    return (
        <ReportProvider
            project={project}
            ui={ui}
            visibility={visibility}
            team={team}
            mode={mode}
            fields={fields}
            onList={onList}
            onListAll={onListAll}
            onPanelBootstrap={onPanelBootstrap}
            onActivitySummary={onActivitySummary}
            onListReplies={onListReplies}
            onNavigate={onNavigate}
            onRevealTarget={onRevealTarget}
            onCreate={onCreate}
            onCreateReply={onCreateReply}
            onUpdate={onUpdate}
            onDelete={onDelete}
            onEvent={onEvent}
            onReply={onReply}
            github={github}
        >
            <ReportView />
        </ReportProvider>
    );
}
