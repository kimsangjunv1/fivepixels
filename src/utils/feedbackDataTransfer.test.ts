import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { getReportsStorageKey } from "../constants/storageKeys.js";
import { createReportPayload } from "./reportFixtures.js";
import { parseFeedbackImportJson, readAllFeedback, writeAllFeedback } from "./feedbackDataTransfer.js";

const scope = { projectId: "transfer-test", environment: "stage" };

describe("feedbackDataTransfer", () => {
    beforeEach(() => {
        window.localStorage.clear();
    });

    afterEach(() => {
        window.localStorage.clear();
    });

    it("reads and writes all feedback for a storage scope", () => {
        const payload = createReportPayload({ pathname: "/demo", message: "hello" });
        writeAllFeedback(scope, [{ ...payload, id: "1", created_at: "2026-01-01T00:00:00.000Z", replies: [] }]);

        const items = readAllFeedback(scope);
        expect(items).toHaveLength(1);
        expect(items[0]?.message).toBe("hello");
        expect(window.localStorage.getItem(getReportsStorageKey(scope.projectId, scope.environment))).toBeTruthy();
    });

    it("parses feedback import json arrays", () => {
        const json = JSON.stringify([{ ...createReportPayload(), id: "1", created_at: "2026-01-01T00:00:00.000Z", replies: [] }]);
        const parsed = parseFeedbackImportJson(json);

        expect(parsed).toHaveLength(1);
        expect(parsed[0]?.id).toBe("1");
    });

    it("rejects invalid import json", () => {
        expect(() => parseFeedbackImportJson("{}")).toThrow("피드백 배열");
        expect(() => parseFeedbackImportJson(JSON.stringify([{ id: "only-id" }]))).toThrow("pathname");
    });
});
