import { describe, expect, it } from "vitest";
import type { ReportStorageAdapter } from "../types/report.js";
import { deleteReport } from "./report.api.js";

describe("deleteReport", () => {
    it("throws when the adapter does not implement remove", async () => {
        const adapter: ReportStorageAdapter = {
            list: async () => [],
            create: async () => {
                throw new Error("not used");
            },
            update: async () => {
                throw new Error("not used");
            },
        };

        await expect(deleteReport(adapter, "missing-id")).rejects.toThrow(/삭제/);
    });

    it("calls remove when it is provided", async () => {
        const removed: string[] = [];
        const adapter: ReportStorageAdapter = {
            list: async () => [],
            create: async () => {
                throw new Error("not used");
            },
            update: async () => {
                throw new Error("not used");
            },
            remove: async (id) => {
                removed.push(id);
            },
        };

        await deleteReport(adapter, "report-1");
        expect(removed).toEqual(["report-1"]);
    });
});
