import type { ReportAuthor, ReportIdentify, ReportTeam } from "@/types/report.js";
import { formatAssigneeLabel } from "@/utils/reportCases.js";

export type ResolvedReportTeam = {
    user?: ReportIdentify;
    reviewers: ReportAuthor[];
    requireReviewerKey: boolean;
};

export type PresentationViewer = {
    id: string;
    name: string;
    department?: string;
    isCreator?: boolean;
};

export type ResolveReportTeamOptions = {
    team?: ReportTeam;
};

export function resolveReportTeam({ team }: ResolveReportTeamOptions): ResolvedReportTeam {
    return {
        user: team?.user,
        reviewers: team?.reviewers ?? [],
        requireReviewerKey: team?.requireReviewerKey ?? false,
    };
}

export function buildPresentationViewers(user: ReportIdentify | undefined, reviewers: ReportAuthor[]): PresentationViewer[] {
    const byId = new Map<string, PresentationViewer>();

    if (user?.id && user.name.trim()) {
        byId.set(user.id, {
            id: user.id,
            name: user.name.trim(),
            isCreator: true,
        });
    }

    for (const reviewer of reviewers) {
        const name = reviewer.name.trim();

        if (!reviewer.id || !name) {
            continue;
        }

        const existing = byId.get(reviewer.id);

        if (existing) {
            byId.set(reviewer.id, {
                ...existing,
                department: reviewer.department?.trim() || existing.department,
            });
            continue;
        }

        byId.set(reviewer.id, {
            id: reviewer.id,
            name,
            department: reviewer.department?.trim() || undefined,
        });
    }

    return Array.from(byId.values());
}

export function formatPresentationViewerLabel(viewer: PresentationViewer): string {
    return formatAssigneeLabel(viewer.name, viewer.department);
}

export type SessionActor = {
    id: string;
    name: string;
};

export function resolveSessionActor(options: {
    isPresentationMode: boolean;
    presentationViewers: PresentationViewer[];
    presentationViewerId: string | null;
    activeIdentify: ReportIdentify | undefined;
}): SessionActor | null {
    if (options.isPresentationMode) {
        const viewer =
            options.presentationViewers.find((item) => item.id === options.presentationViewerId) ?? options.presentationViewers[0];

        if (!viewer?.name.trim()) {
            return null;
        }

        return {
            id: viewer.id,
            name: viewer.name.trim(),
        };
    }

    const name = options.activeIdentify?.name?.trim();

    if (!options.activeIdentify?.id || !name) {
        return null;
    }

    return {
        id: options.activeIdentify.id,
        name,
    };
}
