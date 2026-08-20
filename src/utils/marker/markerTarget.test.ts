import { describe, expect, it, vi } from "vitest";
import { createReportFeedback } from "../report/reportFixtures.js";
import { createReportPosition } from "../report/reportPosition.js";
import { markerToTargetSnapshot } from "./markerTarget.js";

describe("markerToTargetSnapshot", () => {
    it("returns null when marker rect is missing", () => {
        expect(
            markerToTargetSnapshot({
                id: "marker-1",
                left: 10,
                top: 20,
                rect: null,
                detached: true,
                detachedKind: "hidden",
                clampedEdge: null,
                clampBounds: null,
                clampContainerId: null,
                report: createReportFeedback(),
            }),
        ).toBeNull();
    });

    it("marks tagged and untagged reports", () => {
        const rect = {
            left: 10,
            top: 20,
            width: 100,
            height: 40,
            right: 110,
            bottom: 60,
            x: 10,
            y: 20,
            toJSON: () => ({}),
        } as DOMRect;

        const tagged = markerToTargetSnapshot({
            id: "marker-tagged",
            left: 10,
            top: 20,
            rect,
            detached: false,
            detachedKind: null,
            clampedEdge: null,
            clampBounds: null,
            clampContainerId: null,
            report: createReportFeedback({ report_id: "hero-cta", report_type: "item" }),
        });

        const untagged = markerToTargetSnapshot({
            id: "marker-untagged",
            left: 10,
            top: 20,
            rect,
            detached: false,
            detachedKind: null,
            clampedEdge: null,
            clampBounds: null,
            clampContainerId: null,
            report: createReportFeedback({
                report_id: "fp-pick-abc",
                report_type: "item",
                target_selector: "button[data-testid='checkout']",
            }),
        });

        expect(tagged?.isTagged).toBe(true);
        expect(untagged?.isTagged).toBe(false);
        expect(untagged?.targetSelector).toBe("button[data-testid='checkout']");
    });

    it("uses the data-fp-open trigger as the highlight target for grouped modal feedback", () => {
        document.body.innerHTML = '<button data-fp-open="demo-modal-login">Login</button>';
        const trigger = document.querySelector<HTMLElement>("button")!;
        const rect = new DOMRect(20, 30, 120, 40);
        vi.spyOn(trigger, "getBoundingClientRect").mockReturnValue(rect);
        const snapshot = markerToTargetSnapshot({
            id: "marker-modal",
            left: 60,
            top: 40,
            rect,
            detached: true,
            detachedKind: "modal",
            clampedEdge: null,
            clampBounds: null,
            clampContainerId: null,
            viewTriggerKey: "demo-modal-login",
            aggregateCount: 3,
            report: createReportFeedback({ position: createReportPosition({ viewPath: ["demo-modal-login"] }) }),
        });

        expect(snapshot?.rect).toEqual(rect);
        expect(snapshot?.fpOpenAttribute).toBe("demo-modal-login");
    });
});
