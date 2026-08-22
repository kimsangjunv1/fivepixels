import { describe, expect, it } from "vitest";
import { resolveIntegrationLock, type IntegrationCapabilities } from "./integrationFeatures.js";

const base = (overrides: Partial<IntegrationCapabilities> = {}): IntegrationCapabilities => ({
    sync: "local",
    persistenceMode: "localStorage",
    persistenceMissingHandlers: [],
    listAll: true,
    delete: true,
    listReplies: true,
    createReply: true,
    activitySummary: false,
    panelBootstrap: false,
    githubConfigured: false,
    githubIssue: false,
    apiLogin: false,
    apiRegister: false,
    artemisLogin: false,
    teamRequest: false,
    teamManage: false,
    dataTransfer: true,
    ...overrides,
});

describe("resolveIntegrationLock", () => {
    it("locks listAll only in API mode without onListAll", () => {
        expect(resolveIntegrationLock("listAll", base({ persistenceMode: "API", listAll: false }))).toEqual({
            locked: true,
            missingHandlers: ["onListAll"],
        });
        expect(resolveIntegrationLock("listAll", base({ persistenceMode: "localStorage", listAll: false })).locked).toBe(false);
        expect(resolveIntegrationLock("listAll", base({ persistenceMode: "API", listAll: true })).locked).toBe(false);
    });

    it("locks persistence features when remote sync has unavailable storage", () => {
        const caps = base({
            sync: "api",
            persistenceMode: "unavailable",
            persistenceMissingHandlers: ["onList", "onCreate", "onUpdate"],
            listAll: false,
            delete: false,
            dataTransfer: false,
        });
        expect(resolveIntegrationLock("feedbackPersistence", caps).missingHandlers).toEqual(["onList", "onCreate", "onUpdate"]);
        expect(resolveIntegrationLock("listAll", caps).locked).toBe(true);
        expect(resolveIntegrationLock("deleteFeedback", caps).locked).toBe(true);
    });

    it("locks delete only in API mode without onDelete", () => {
        expect(resolveIntegrationLock("deleteFeedback", base({ persistenceMode: "API", delete: false })).missingHandlers).toEqual(["onDelete"]);
        expect(resolveIntegrationLock("deleteFeedback", base({ persistenceMode: "API", delete: true })).locked).toBe(false);
    });

    it("locks github when configured without onCreate", () => {
        expect(resolveIntegrationLock("githubIssue", base({ githubConfigured: true, githubIssue: false }))).toEqual({
            locked: true,
            missingHandlers: ["github.onCreate"],
        });
        expect(resolveIntegrationLock("githubIssue", base({ githubConfigured: false })).locked).toBe(false);
    });

    it("locks dataTransfer in API mode without listing handlers", () => {
        expect(resolveIntegrationLock("dataTransfer", base({ dataTransfer: false }))).toEqual({
            locked: true,
            missingHandlers: [],
        });
    });

    it("locks api login when sync is api without handler", () => {
        expect(resolveIntegrationLock("apiLogin", base({ sync: "api", apiLogin: false })).missingHandlers).toEqual(["onApiLogin"]);
        expect(resolveIntegrationLock("apiLogin", base({ sync: "local", apiLogin: false })).locked).toBe(false);
    });
});
