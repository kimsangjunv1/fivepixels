import { resolveIntegrationLock } from "./integrationFeatures.js";
export function buildIntegrationCapabilities(input) {
    return {
        ...input,
        persistenceMissingHandlers: input.persistenceMissingHandlers ?? [],
    };
}
export function persistenceMissingHandlerNames(status) {
    if (status.mode === "unavailable" || status.mode === "conflict") {
        return [...status.missingHandlers];
    }
    return [];
}
export function getIntegrationLock(feature, caps) {
    return resolveIntegrationLock(feature, caps);
}
//# sourceMappingURL=integrationGate.js.map