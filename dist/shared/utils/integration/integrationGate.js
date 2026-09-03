import { resolveIntegrationLock } from "./integrationFeatures.js";
export function buildIntegrationCapabilities(input) {
    return {
        ...input,
        persistenceMissingHandlers: input.persistenceMissingHandlers ?? [],
    };
}
export function getIntegrationLock(feature, caps) {
    return resolveIntegrationLock(feature, caps);
}
//# sourceMappingURL=integrationGate.js.map