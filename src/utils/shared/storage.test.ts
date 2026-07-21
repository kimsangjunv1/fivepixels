import { describe, expect, it, vi } from "vitest";
import { createReportFeedback } from "@/utils/report/reportFixtures.js";
import type { CreateReportFeedbackPayload, ReportFeedback } from "@/types/report.js";
import { hasCustomPersistenceHandlers, resolveStorageAdapter } from "./storage.js";

const sampleFeedback = createReportFeedback({
    id: "1",
    pathname: "/demo",
    message: "hello",
    created_at: "2026-01-01T00:00:00.000Z",
});

describe("resolveStorageAdapter", () => {
    it("uses localStorage when no custom handlers are provided", () => {
        const { usesLocalStorage, persistenceStatus } = resolveStorageAdapter({ projectId: "demo-app" });

        expect(usesLocalStorage).toBe(true);
        expect(persistenceStatus).toEqual({
            mode: "localStorage",
            missingHandlers: [],
            ignoredHandlers: [],
        });
    });

    it("wraps custom handlers as an adapter", async () => {
        const onList = vi.fn(async () => [sampleFeedback]);
        const onCreate = vi.fn(async (payload: CreateReportFeedbackPayload) => ({
            ...payload,
            id: "created-id",
            created_at: "2026-01-02T00:00:00.000Z",
            replies: payload.replies ?? [],
        }));
        const onUpdate = vi.fn(async (_id: string, payload: Partial<ReportFeedback>) => ({
            ...sampleFeedback,
            ...payload,
        }));
        const onDelete = vi.fn(async () => undefined);
        const onListAll = vi.fn(async () => ({ items: [sampleFeedback] }));

        expect(hasCustomPersistenceHandlers({ onList, onCreate, onUpdate })).toBe(true);

        const { adapter, usesLocalStorage, persistenceStatus } = resolveStorageAdapter({
            projectId: "demo-app",
            onList,
            onListAll,
            onCreate,
            onUpdate,
            onDelete,
        });

        expect(usesLocalStorage).toBe(false);
        expect(persistenceStatus).toEqual({
            mode: "API",
            missingHandlers: [],
            ignoredHandlers: [],
        });
        await expect(adapter.list({ pathname: "/demo" })).resolves.toEqual([sampleFeedback]);
        expect(onList).toHaveBeenCalledWith({ pathname: "/demo" });
        await expect(adapter.listAll?.({ limit: 100 })).resolves.toEqual({ items: [sampleFeedback] });
        expect(onListAll).toHaveBeenCalledWith({ limit: 100 });
    });

    it("reports a conflict and falls back to localStorage when required handlers are missing", () => {
        const onList = vi.fn(async () => [sampleFeedback]);
        const onCreate = vi.fn(async (payload: CreateReportFeedbackPayload) => ({
            ...payload,
            id: "created-id",
            created_at: "2026-01-02T00:00:00.000Z",
            replies: payload.replies ?? [],
        }));
        const onDelete = vi.fn(async () => undefined);
        const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);

        const { usesLocalStorage, persistenceStatus } = resolveStorageAdapter({
            projectId: "demo-app",
            onList,
            onCreate,
            onDelete,
        });

        expect(usesLocalStorage).toBe(true);
        expect(persistenceStatus).toEqual({
            mode: "conflict",
            missingHandlers: ["onUpdate"],
            ignoredHandlers: ["onList", "onCreate", "onDelete"],
        });
        expect(warn).toHaveBeenCalledWith(
            "[fivepixels] Custom persistence requires onList, onCreate, and onUpdate together. Falling back to localStorage.",
        );

        warn.mockRestore();
    });
});
