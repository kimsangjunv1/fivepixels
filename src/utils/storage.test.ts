import { describe, expect, it, vi } from "vitest";
import type { CreateReportFeedbackPayload, ReportFeedback } from "@/types/report.js";
import { hasCustomPersistenceHandlers, resolveStorageAdapter } from "./storage.js";

const sampleFeedback = {
    id: "1",
    pathname: "/demo",
    report_id: "hero",
    report_type: "group" as const,
    message: "hello",
    status: "open" as const,
    field_values: {},
    replies: [],
    x_ratio: 0.5,
    y_ratio: 0.5,
    element_x_ratio: null,
    element_y_ratio: null,
    scroll_y: 0,
    document_y: 0,
    viewport_width: 1000,
    viewport_height: 800,
    design_width: 1000,
    design_height: 800,
    created_at: "2026-01-01T00:00:00.000Z",
};

describe("resolveStorageAdapter", () => {
    it("uses localStorage when no custom handlers are provided", () => {
        const { usesLocalStorage } = resolveStorageAdapter({ projectId: "demo-app" });

        expect(usesLocalStorage).toBe(true);
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

        const { adapter, usesLocalStorage } = resolveStorageAdapter({
            projectId: "demo-app",
            onList,
            onListAll,
            onCreate,
            onUpdate,
            onDelete,
        });

        expect(usesLocalStorage).toBe(false);
        await expect(adapter.list({ pathname: "/demo" })).resolves.toEqual([sampleFeedback]);
        expect(onList).toHaveBeenCalledWith({ pathname: "/demo" });
        await expect(adapter.listAll?.({ limit: 100 })).resolves.toEqual({ items: [sampleFeedback] });
        expect(onListAll).toHaveBeenCalledWith({ limit: 100 });
    });
});
