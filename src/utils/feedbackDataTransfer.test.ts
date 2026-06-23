import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { ko } from "@/i18n/ko.js";
import { setActiveReportMessages } from "@/i18n/index.js";
import { getReportsStorageKey } from "@/constants/storageKeys.js";
import { createReportPayload } from "./reportFixtures.js";
import {
    isImportProjectCompatible,
    parseFeedbackCommandJson,
    parseFeedbackImportJson,
    parseFeedbackStorageEnvelope,
    serializeFeedbackExport,
    serializeFeedbackItem,
    serializeFeedbackStorageEnvelope,
} from "./feedbackTransferSchema.js";
import { findFeedbackInsertConflicts, insertFeedbackItems, parseFeedbackImportJson as parseFromTransfer, readAllFeedback, upsertFeedbackItems, writeAllFeedback } from "./feedbackDataTransfer.js";

const scope = { projectId: "transfer-test", environment: "stage", appVersion: "1.0.0" };

describe("feedbackTransferSchema", () => {
    beforeEach(() => {
        setActiveReportMessages(ko);
    });

    it("serializes export payload with project metadata", () => {
        const payload = createReportPayload({ pathname: "/demo", message: "hello" });
        const json = serializeFeedbackExport({ id: scope.projectId, env: scope.environment, version: scope.appVersion }, [
            { ...payload, id: "1", created_at: "2026-01-01T00:00:00.000Z", replies: [] },
        ]);

        const parsed = parseFeedbackImportJson(json);

        expect(parsed.project).toEqual({ id: scope.projectId, env: scope.environment, version: scope.appVersion });
        expect(parsed.exportedAt).toBeTruthy();
        expect(parsed.items).toHaveLength(1);
    });

    it("parses legacy feedback arrays", () => {
        const json = JSON.stringify([{ ...createReportPayload(), id: "1", created_at: "2026-01-01T00:00:00.000Z", replies: [] }]);
        const parsed = parseFeedbackImportJson(json);

        expect(parsed.project).toBeUndefined();
        expect(parsed.items).toHaveLength(1);
    });

    it("compares project id and version for import compatibility", () => {
        expect(isImportProjectCompatible(scope, { id: scope.projectId, version: scope.appVersion })).toBe(true);
        expect(isImportProjectCompatible(scope, { id: "other", version: scope.appVersion })).toBe(false);
        expect(isImportProjectCompatible(scope, { id: scope.projectId, version: "9.9.9" })).toBe(false);
        expect(isImportProjectCompatible(scope, undefined)).toBe(false);
    });

    it("serializes and parses localStorage envelopes", () => {
        const payload = createReportPayload({ pathname: "/demo", message: "stored" });
        const raw = serializeFeedbackStorageEnvelope({ id: scope.projectId, env: scope.environment, version: scope.appVersion }, [
            { ...payload, id: "1", created_at: "2026-01-01T00:00:00.000Z", replies: [] },
        ]);

        const envelope = parseFeedbackStorageEnvelope(raw);

        expect(envelope?.project).toEqual({ id: scope.projectId, env: scope.environment, version: scope.appVersion });
        expect(envelope?.updatedAt).toBeTruthy();
        expect(envelope?.items).toHaveLength(1);
    });

    it("parses a single feedback object for command insert", () => {
        const item = { ...createReportPayload(), id: "1", created_at: "2026-01-01T00:00:00.000Z", replies: [] };
        const parsed = parseFeedbackCommandJson(serializeFeedbackItem(item));

        expect(parsed.items).toHaveLength(1);
        expect(parsed.items[0]?.id).toBe("1");
    });
});

describe("feedbackDataTransfer", () => {
    beforeEach(() => {
        setActiveReportMessages(ko);
        window.localStorage.clear();
    });

    afterEach(() => {
        window.localStorage.clear();
    });

    it("reads and writes all feedback for a storage scope with project metadata", () => {
        const payload = createReportPayload({ pathname: "/demo", message: "hello" });
        writeAllFeedback(scope, [{ ...payload, id: "1", created_at: "2026-01-01T00:00:00.000Z", replies: [] }]);

        const items = readAllFeedback(scope);
        expect(items).toHaveLength(1);
        expect(items[0]?.message).toBe("hello");

        const raw = window.localStorage.getItem(getReportsStorageKey(scope.projectId, scope.environment, scope.appVersion));
        const envelope = parseFeedbackStorageEnvelope(raw ?? "");

        expect(envelope?.project).toEqual({ id: scope.projectId, env: scope.environment, version: scope.appVersion });
    });

    it("parses feedback import json payloads", () => {
        const json = JSON.stringify([{ ...createReportPayload(), id: "1", created_at: "2026-01-01T00:00:00.000Z", replies: [] }]);
        const parsed = parseFromTransfer(json);

        expect(parsed.items).toHaveLength(1);
        expect(parsed.items[0]?.id).toBe("1");
    });

    it("rejects invalid import json", () => {
        expect(() => parseFromTransfer("{}")).toThrow("피드백 배열");
        expect(() => parseFromTransfer(JSON.stringify([{ id: "only-id" }]))).toThrow("pathname");
    });

    it("inserts feedback items without replacing existing data", () => {
        const first = { ...createReportPayload({ message: "first" }), id: "1", created_at: "2026-01-01T00:00:00.000Z", replies: [] };
        const second = { ...createReportPayload({ message: "second" }), id: "2", created_at: "2026-01-02T00:00:00.000Z", replies: [] };

        writeAllFeedback(scope, [first]);
        const result = insertFeedbackItems(scope, [second]);

        expect(result.inserted).toBe(1);
        expect(result.replaced).toBe(0);

        const items = readAllFeedback(scope);
        expect(items).toHaveLength(2);
        expect(items.map((item) => item.message)).toEqual(["first", "second"]);
    });

    it("finds conflicts when inserting duplicate feedback ids", () => {
        const first = { ...createReportPayload({ message: "first" }), id: "dup", created_at: "2026-01-01T00:00:00.000Z", replies: [] };
        const duplicate = { ...createReportPayload({ message: "duplicate" }), id: "dup", created_at: "2026-01-02T00:00:00.000Z", replies: [] };

        writeAllFeedback(scope, [first]);
        const conflicts = findFeedbackInsertConflicts(scope, [duplicate]);

        expect(conflicts).toHaveLength(1);
        expect(conflicts[0]?.existing.message).toBe("first");
        expect(conflicts[0]?.incoming.message).toBe("duplicate");
        expect(() => insertFeedbackItems(scope, [duplicate])).toThrow("이미 등록된 id");
    });

    it("replaces existing feedback when upserting duplicate ids", () => {
        const first = { ...createReportPayload({ message: "first" }), id: "dup", created_at: "2026-01-01T00:00:00.000Z", replies: [] };
        const duplicate = { ...createReportPayload({ message: "duplicate" }), id: "dup", created_at: "2026-01-02T00:00:00.000Z", replies: [] };

        writeAllFeedback(scope, [first]);
        const result = upsertFeedbackItems(scope, [duplicate]);

        expect(result.inserted).toBe(0);
        expect(result.replaced).toBe(1);

        const items = readAllFeedback(scope);
        expect(items).toHaveLength(1);
        expect(items[0]?.id).toBe("dup");
        expect(items[0]?.message).toBe("duplicate");
    });
});
