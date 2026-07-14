import { describe, expect, it } from "vitest";
import { resolveReportProject } from "./reportProject.js";

describe("resolveReportProject", () => {
    it("resolves project object values", () => {
        expect(
            resolveReportProject({
                project: { id: "my-app", env: "stage", version: "2.0.0" },
            }),
        ).toEqual({
            projectId: "my-app",
            environment: "stage",
            appVersion: "2.0.0",
        });
    });

    it("falls back to default project id when project is omitted", () => {
        expect(resolveReportProject({})).toEqual({
            projectId: "my-app",
            environment: undefined,
            appVersion: undefined,
        });
    });
});
