const CORE_PERSISTENCE_HANDLERS = ["onList", "onCreate", "onUpdate"];
const TEAM_MANAGE_HANDLERS = [
    "onListReviewerRequests",
    "onResolveReviewerRequest",
    "onRegisterReviewer",
    "onUpdateReviewer",
];
function persistenceUnavailable(caps) {
    return caps.persistenceMode === "unavailable";
}
function corePersistenceMissing(caps) {
    if (caps.persistenceMissingHandlers.length > 0) {
        return caps.persistenceMissingHandlers;
    }
    return [...CORE_PERSISTENCE_HANDLERS];
}
export function resolveIntegrationLock(feature, caps) {
    switch (feature) {
        case "feedbackPersistence":
            if (!persistenceUnavailable(caps)) {
                return { locked: false, missingHandlers: [] };
            }
            return { locked: true, missingHandlers: corePersistenceMissing(caps) };
        case "listAll":
            if (persistenceUnavailable(caps)) {
                return { locked: true, missingHandlers: [...corePersistenceMissing(caps), "onListAll"] };
            }
            if (caps.persistenceMode !== "API" || caps.listAll) {
                return { locked: false, missingHandlers: [] };
            }
            return { locked: true, missingHandlers: ["onListAll"] };
        case "deleteFeedback":
            if (persistenceUnavailable(caps)) {
                return { locked: true, missingHandlers: [...corePersistenceMissing(caps), "onDelete"] };
            }
            if (caps.persistenceMode !== "API" || caps.delete) {
                return { locked: false, missingHandlers: [] };
            }
            return { locked: true, missingHandlers: ["onDelete"] };
        case "githubIssue":
            if (!caps.githubConfigured || caps.githubIssue) {
                return { locked: false, missingHandlers: [] };
            }
            return { locked: true, missingHandlers: ["github.onCreate"] };
        case "teamManage":
            if (caps.persistenceMode !== "API") {
                return { locked: true, missingHandlers: [...CORE_PERSISTENCE_HANDLERS, ...TEAM_MANAGE_HANDLERS] };
            }
            if (caps.teamManage) {
                return { locked: false, missingHandlers: [] };
            }
            return { locked: true, missingHandlers: [...TEAM_MANAGE_HANDLERS] };
        case "teamRequest":
            if (caps.persistenceMode !== "API") {
                return { locked: true, missingHandlers: [...CORE_PERSISTENCE_HANDLERS, "onCreateReviewerRequest"] };
            }
            if (caps.teamRequest) {
                return { locked: false, missingHandlers: [] };
            }
            return { locked: true, missingHandlers: ["onCreateReviewerRequest"] };
        case "dataTransfer":
            if (caps.dataTransfer) {
                return { locked: false, missingHandlers: [] };
            }
            return { locked: true, missingHandlers: [] };
        case "apiLogin":
            if (caps.sync !== "api" || caps.apiLogin) {
                return { locked: false, missingHandlers: [] };
            }
            return { locked: true, missingHandlers: ["onApiLogin"] };
        case "apiRegister":
            if (caps.sync !== "api" || caps.apiRegister) {
                return { locked: false, missingHandlers: [] };
            }
            return { locked: true, missingHandlers: ["onApiRegister"] };
        case "artemisLogin":
            if (caps.sync !== "artemis" || caps.artemisLogin) {
                return { locked: false, missingHandlers: [] };
            }
            return { locked: true, missingHandlers: ["onArtemisLogin"] };
        case "activitySummary":
            if (caps.activitySummary) {
                return { locked: false, missingHandlers: [] };
            }
            if (persistenceUnavailable(caps)) {
                return { locked: true, missingHandlers: [...corePersistenceMissing(caps), "onActivitySummary"] };
            }
            if (caps.persistenceMode !== "API") {
                return { locked: false, missingHandlers: [] };
            }
            return { locked: true, missingHandlers: ["onActivitySummary"] };
        default:
            return { locked: false, missingHandlers: [] };
    }
}
export function formatIntegrationMissingHandlers(missingHandlers) {
    return missingHandlers.join(", ");
}
//# sourceMappingURL=integrationFeatures.js.map