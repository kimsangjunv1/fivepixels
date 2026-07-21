import { formatAssigneeLabel } from "../../utils/report/reportCases.js";
export function resolveReportTeam({ team }) {
    return {
        user: team?.user,
        reviewers: team?.reviewers ?? [],
        requireReviewerKey: team?.requireReviewerKey ?? false,
    };
}
export function buildPresentationViewers(user, reviewers) {
    const byId = new Map();
    if (user?.id && user.name.trim()) {
        byId.set(user.id, {
            id: user.id,
            name: user.name.trim(),
            isCreator: true,
            privateKey: user.privateKey?.trim() || undefined,
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
                privateKey: reviewer.privateKey?.trim() || existing.privateKey,
            });
            continue;
        }
        byId.set(reviewer.id, {
            id: reviewer.id,
            name,
            department: reviewer.department?.trim() || undefined,
            privateKey: reviewer.privateKey?.trim() || undefined,
        });
    }
    return Array.from(byId.values());
}
export function formatPresentationViewerLabel(viewer) {
    return formatAssigneeLabel(viewer.name, viewer.department);
}
export function resolveSessionActor(options) {
    if (options.isPresentationMode) {
        const viewer = options.presentationViewers.find((item) => item.id === options.presentationViewerId) ?? options.presentationViewers[0];
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
//# sourceMappingURL=reportTeam.js.map