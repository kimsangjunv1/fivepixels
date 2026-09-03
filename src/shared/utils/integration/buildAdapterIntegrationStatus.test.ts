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

    it("counts connected handlers for api sync with requireAuth", () => {
        const status = buildAdapterIntegrationStatus(
            {
                auth: {
                    login: async () => ({ id: "1", name: "Kim" }),
                    signup: async () => undefined,
                    logout: async () => undefined,
                    refresh: async () => undefined,
                },
                markers: { list: async () => [] },
                feedback: {
                    create: async () => ({}) as never,
                    getForUi: async () => ({}) as never,
                    update: async () => ({}) as never,
                },
            },
            "api",
            baseCapabilities({ persistenceMode: "API", apiLogin: true, apiRegister: true }),
            undefined,
            true,
        );

        expect(status).not.toBeNull();
        expect(status?.connectedCount).toBeGreaterThanOrEqual(8);
        expect(status?.handlers.some((item) => item.id === "adapter.feedback.getForUi" && item.connected)).toBe(true);
        expect(status?.handlers.filter((item) => item.group === "auth" && item.required).map((item) => item.id)).toEqual(["adapter.auth.login"]);
        expect(status?.isRequiredComplete).toBe(true);
    });

    it("hides auth handlers when requireAuth is false", () => {
        const status = buildAdapterIntegrationStatus(
            {
                markers: { list: async () => [] },
                feedback: {
                    create: async () => ({}) as never,
                    update: async () => ({}) as never,
                },
            },
            "api",
            baseCapabilities({ persistenceMode: "API" }),
            undefined,
            false,
        );

        expect(status?.handlers.some((item) => item.group === "auth")).toBe(false);
        expect(status?.features.some((item) => item.id === "apiLogin")).toBe(false);
        expect(status?.isRequiredComplete).toBe(true);
    });

    it("marks auth incomplete when login is missing and requireAuth is true", () => {
        const status = buildAdapterIntegrationStatus(
            {
                markers: { list: async () => [] },
                feedback: {
                    create: async () => ({}) as never,
                    update: async () => ({}) as never,
                },
            },
            "api",
            baseCapabilities({ persistenceMode: "API" }),
            undefined,
            true,
        );

        expect(status?.isRequiredComplete).toBe(false);
        expect(status?.handlers.some((item) => item.id === "adapter.auth.login" && item.required && !item.connected)).toBe(true);
    });

    it("marks required handlers as incomplete when adapter is missing", () => {
        const status = buildAdapterIntegrationStatus(undefined, "api", baseCapabilities(), undefined, true);

        expect(status?.isRequiredComplete).toBe(false);
        expect(status?.requiredConnectedCount).toBeLessThan(status?.requiredTotalCount ?? 0);
    });
});
