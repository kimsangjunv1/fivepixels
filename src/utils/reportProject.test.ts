import { describe, expect, it } from "vitest";
import { resolveReportProject } from "./reportProject.js";

describe("resolveReportProject", () => {
    it("prefers project object values over legacy flat props", () => {
        expect(
            resolveReportProject({
                project: { id: "from-project", env: "stage", version: "2.0.0" },
                projectId: "legacy-id",
                environment: "legacy-env",
                appVersion: "1.0.0",
            }),
        ).toEqual({
            projectId: "from-project",
            environment: "stage",
            appVersion: "2.0.0",
        });
    });

    it("falls back to legacy flat props", () => {
        expect(
            resolveReportProject({
                projectId: "legacy-id",
                environment: "dev",
                appVersion: "1.0.0",
            }),
        ).toEqual({
            projectId: "legacy-id",
            environment: "dev",
            appVersion: "1.0.0",
        });
    });
});
