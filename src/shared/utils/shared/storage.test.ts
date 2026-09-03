import { describe, expect, it, vi } from "vitest";
import { createReportFeedback } from "@/shared/utils/report/reportFixtures.js";
import type { FivePixelsAdapter } from "@/shared/types/adapter.js";
import type { CreateReportFeedbackPayload, ReportFeedback } from "@/shared/types/report.js";
import { hasCustomPersistenceAdapter, resolveStorageAdapter } from "./storage.js";

const sampleFeedback = createReportFeedback({
    id: "1",
    pathname: "/demo",
    message: "hello",
    created_at: "2026-01-01T00:00:00.000Z",
});

function createSampleAdapter(overrides: Partial<FivePixelsAdapter> = {}): FivePixelsAdapter {
    return {
        markers: {
            list: vi.fn(async () => [sampleFeedback]),
        },
        feedback: {
            create: vi.fn(async (payload: CreateReportFeedbackPayload) => ({
                ...payload,
                id: "created-id",
                created_at: "2026-01-02T00:00:00.000Z",
                replies: payload.replies ?? [],
            })),
            update: vi.fn(async (_id: string, payload: Partial<ReportFeedback>) => ({
                ...sampleFeedback,
                ...payload,
            })),
            delete: vi.fn(async () => undefined),
        },
        ...overrides,
    };
}

describe("resolveStorageAdapter", () => {
    it("uses localStorage when no adapter is provided", () => {
        const { usesLocalStorage, persistenceStatus } = resolveStorageAdapter({ projectId: "demo-app" });

        expect(usesLocalStorage).toBe(true);
        expect(persistenceStatus).toEqual({
            mode: "localStorage",
            missingHandlers: [],
            ignoredHandlers: [],
        });
    });

    it("does not fall back to localStorage when sync is api without adapter", async () => {
        const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
        const { usesLocalStorage, persistenceStatus, adapter } = resolveStorageAdapter({
            projectId: "demo-app",
            sync: "api",
        });

        expect(usesLocalStorage).toBe(false);
        expect(persistenceStatus.mode).toBe("unavailable");
        expect(persistenceStatus.missingHandlers).toEqual([
            "adapter.markers.list",
            "adapter.feedback.create",
            "adapter.feedback.update",
            "adapter.cases.update",
        ]);
        await expect(adapter.list({ pathname: "/demo" })).resolves.toEqual([]);
        await expect(adapter.create({} as CreateReportFeedbackPayload)).rejects.toThrow(/Persistence adapter is not configured/);
        expect(warn).toHaveBeenCalled();
        warn.mockRestore();
    });

    it("wraps a complete adapter as storage adapter", async () => {
        const adapterConfig = createSampleAdapter();
        expect(hasCustomPersistenceAdapter(adapterConfig)).toBe(true);

        const { adapter, usesLocalStorage, persistenceStatus } = resolveStorageAdapter({
            projectId: "demo-app",
            sync: "api",
            adapter: adapterConfig,
        });

        expect(usesLocalStorage).toBe(false);
        expect(persistenceStatus).toEqual({
            mode: "API",
            missingHandlers: [],
            ignoredHandlers: [],
        });
        await expect(adapter.list({ pathname: "/demo" })).resolves.toEqual([sampleFeedback]);
        expect(adapterConfig.markers?.list).toHaveBeenCalledWith({ pathname: "/demo" });
    });

    it("reports a conflict and falls back to localStorage when adapter is incomplete in local sync", () => {
        const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);

        const { usesLocalStorage, persistenceStatus } = resolveStorageAdapter({
            projectId: "demo-app",
            sync: "local",
            adapter: {
                markers: {
                    list: vi.fn(async () => [sampleFeedback]),
                },
            },
        });

        expect(usesLocalStorage).toBe(true);
        expect(persistenceStatus.mode).toBe("conflict");
        expect(warn).toHaveBeenCalled();
        warn.mockRestore();
    });
});
