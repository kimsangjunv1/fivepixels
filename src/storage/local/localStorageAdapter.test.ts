import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { getReportsStorageKey } from "../../constants/storageKeys.js";
import { createReportPayload } from "../../utils/reportFixtures.js";
import { createLocalStorageReportAdapter } from "./localStorageAdapter.js";

const PROJECT_ID = "test-project";
const ENVIRONMENT = "stage";
const PATHNAME = "/demo";

describe("createLocalStorageReportAdapter", () => {
    const storageKey = getReportsStorageKey(PROJECT_ID, ENVIRONMENT);

    beforeEach(() => {
        window.localStorage.clear();
    });

    afterEach(() => {
        window.localStorage.clear();
    });

    it("creates, lists, updates, and removes feedback for a pathname", async () => {
        const adapter = createLocalStorageReportAdapter({ projectId: PROJECT_ID, environment: ENVIRONMENT });

        const created = await adapter.create(createReportPayload({ pathname: PATHNAME }));
        expect(created.id).toBeTruthy();
        expect(created.status).toBe("open");

        const listed = await adapter.list({ pathname: PATHNAME });
        expect(listed).toHaveLength(1);
        expect(listed[0]?.id).toBe(created.id);

        const updated = await adapter.update(created.id, { status: "resolved", message: "수정됨" });
        expect(updated.status).toBe("resolved");
        expect(updated.message).toBe("수정됨");

        await adapter.remove?.(created.id);

        expect(await adapter.list({ pathname: PATHNAME })).toHaveLength(0);
        expect(window.localStorage.getItem(storageKey)).toContain("[]");
    });

    it("isolates records by pathname and environment", async () => {
        const adapter = createLocalStorageReportAdapter({ projectId: PROJECT_ID, environment: ENVIRONMENT });

        await adapter.create(createReportPayload({ pathname: "/a", message: "A" }));
        await adapter.create(createReportPayload({ pathname: "/b", message: "B" }));

        expect(await adapter.list({ pathname: "/a" })).toHaveLength(1);
        expect(await adapter.list({ pathname: "/b" })).toHaveLength(1);

        const otherEnvironmentAdapter = createLocalStorageReportAdapter({
            projectId: PROJECT_ID,
            environment: "production",
        });

        expect(await otherEnvironmentAdapter.list({ pathname: "/a" })).toHaveLength(0);
    });

    it("isolates records by appVersion", async () => {
        const adapter = createLocalStorageReportAdapter({
            projectId: PROJECT_ID,
            environment: ENVIRONMENT,
            appVersion: "1.0.0",
        });

        await adapter.create(createReportPayload({ pathname: PATHNAME, message: "v1" }));

        const otherVersionAdapter = createLocalStorageReportAdapter({
            projectId: PROJECT_ID,
            environment: ENVIRONMENT,
            appVersion: "1.0.1",
        });

        expect(await adapter.list({ pathname: PATHNAME })).toHaveLength(1);
        expect(await otherVersionAdapter.list({ pathname: PATHNAME })).toHaveLength(0);
    });

    it("normalizes invalid stored field_values and replies", async () => {
        const adapter = createLocalStorageReportAdapter({ projectId: PROJECT_ID });
        const created = await adapter.create(createReportPayload());

        window.localStorage.setItem(
            getReportsStorageKey(PROJECT_ID),
            JSON.stringify([
                {
                    ...created,
                    status: "invalid",
                    field_values: { ok: "yes", bad: 1, also: null },
                    replies: [{ id: "r1", message: "reply", created_at: "2026-05-31T00:00:00.000Z" }, { id: "bad" }],
                },
            ]),
        );

        const [item] = await adapter.list({ pathname: created.pathname });

        expect(item?.status).toBe("open");
        expect(item?.field_values).toEqual({ ok: "yes" });
        expect(item?.replies).toHaveLength(1);
    });
});
