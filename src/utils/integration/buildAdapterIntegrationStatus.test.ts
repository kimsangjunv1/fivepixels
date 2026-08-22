import { describe, expect, it } from "vitest";
import { buildAdapterIntegrationStatus } from "./buildAdapterIntegrationStatus.js";
import type { IntegrationCapabilities } from "./integrationFeatures.js";

const baseCapabilities = (overrides: Partial<IntegrationCapabilities> = {}): IntegrationCapabilities => ({
    sync: "api",
    persistenceMode: "unavailable",
    persistenceMissingHandlers: ["adapter.markers.list", "adapter.feedback.create"],
    listAll: false,
    delete: false,
    listReplies: false,
    createReply: false,
    activitySummary: false,
    panelBootstrap: false,
    githubConfigured: false,
    githubIssue: false,
    apiLogin: false,
    apiRegister: false,
    artemisLogin: false,
    teamRequest: false,
    teamManage: false,
    dataTransfer: false,
    ...overrides,
});

describe("buildAdapterIntegrationStatus", () => {
    it("returns null for local sync", () => {
        expect(buildAdapterIntegrationStatus(undefined, "local", baseCapabilities({ sync: "local" }))).toBeNull();
    });

    it("counts connected handlers for api sync", () => {
        const status = buildAdapterIntegrationStatus(
            {
                auth: { login: async () => ({ id: "1", name: "Kim" }) },
                markers: { list: async () => [] },
                feedback: {
                    create: async () => ({}) as never,
                    getForUi: async () => ({}) as never,
                    update: async () => ({}) as never,
                },
            },
            "api",
            baseCapabilities({ persistenceMode: "API", apiLogin: true }),
        );

        expect(status).not.toBeNull();
        expect(status?.connectedCount).toBeGreaterThanOrEqual(5);
        expect(status?.handlers.some((item) => item.id === "adapter.feedback.getForUi" && item.connected)).toBe(true);
        expect(status?.isRequiredComplete).toBe(true);
    });

    it("marks required handlers as incomplete when adapter is missing", () => {
        const status = buildAdapterIntegrationStatus(undefined, "api", baseCapabilities());

        expect(status?.isRequiredComplete).toBe(false);
        expect(status?.requiredConnectedCount).toBeLessThan(status?.requiredTotalCount ?? 0);
    });
});
