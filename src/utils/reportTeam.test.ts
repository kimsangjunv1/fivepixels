import { describe, expect, it } from "vitest";
import { buildPresentationViewers, formatPresentationViewerLabel, resolveSessionActor } from "@/utils/reportTeam.js";

describe("reportTeam", () => {
    it("builds presentation viewers from user and reviewers without duplicates", () => {
        const viewers = buildPresentationViewers(
            { id: "demo-user", name: "Alex", privateKey: "stpk2.demo-user" },
            [
                { id: "1", name: "김상준", department: "FrontEnd 2실", privateKey: "stpk2.reviewer-1" },
                { id: "2", name: "Sophia", department: "QA" },
            ],
        );

        expect(viewers).toHaveLength(3);
        expect(viewers[0]).toEqual({ id: "demo-user", name: "Alex", isCreator: true, privateKey: "stpk2.demo-user" });
        expect(viewers[1]).toEqual({ id: "1", name: "김상준", department: "FrontEnd 2실", privateKey: "stpk2.reviewer-1" });
        expect(viewers[2]).toEqual({ id: "2", name: "Sophia", department: "QA" });
        expect(formatPresentationViewerLabel(viewers[1]!)).toBe("김상준, FrontEnd 2실");
    });

    it("resolves session actor from key-matched identify or presentation viewer", () => {
        const viewers = buildPresentationViewers(
            { id: "demo-user", name: "Alex" },
            [{ id: "1", name: "김상준", department: "FrontEnd 2실" }],
        );

        expect(
            resolveSessionActor({
                isPresentationMode: false,
                presentationViewers: viewers,
                presentationViewerId: null,
                activeIdentify: { id: "1", name: "김상준" },
            }),
        ).toEqual({ id: "1", name: "김상준" });

        expect(
            resolveSessionActor({
                isPresentationMode: true,
                presentationViewers: viewers,
                presentationViewerId: "demo-user",
                activeIdentify: { id: "1", name: "김상준" },
            }),
        ).toEqual({ id: "demo-user", name: "Alex" });
    });
});
