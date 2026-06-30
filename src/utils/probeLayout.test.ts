import { describe, expect, it } from "vitest";
import { EMPTY_PROBE_LAYOUT_VALUES, applyPickProbeValues, capturePickProbeValues, getProposedChanges } from "./pickProbe.js";
import {
    buildFlexDirection,
    formatGridTrackCount,
    parseGridTrackCount,
    stepGridTrackCount,
    stepProbeGap,
    toggleFlexReverse,
} from "./probeLayout.js";

const probeColors = {
    textColor: "#111111",
    backgroundColor: "#ffffff",
    borderColor: "#cccccc",
};

const baseProbeValues = {
    textContent: "",
    fontSize: "",
    padding: "0px",
    margin: "0px",
    lineHeight: "",
    ...probeColors,
    ...EMPTY_PROBE_LAYOUT_VALUES,
};

describe("probeLayout", () => {
    it("parses and formats grid track counts", () => {
        expect(parseGridTrackCount("repeat(3, minmax(0, 1fr))")).toBe(3);
        expect(formatGridTrackCount(4)).toBe("repeat(4, minmax(0, 1fr))");
        expect(stepGridTrackCount("2", 1)).toBe("3");
        expect(stepGridTrackCount("1", -1)).toBe("1");
    });

    it("builds and toggles flex direction", () => {
        expect(buildFlexDirection("row", false)).toBe("row");
        expect(buildFlexDirection("column", true)).toBe("column-reverse");
        expect(toggleFlexReverse("row")).toBe("row-reverse");
        expect(toggleFlexReverse("row-reverse")).toBe("row");
    });

    it("steps gap values in pixels", () => {
        expect(stepProbeGap("8px", 1)).toBe("9px");
        expect(stepProbeGap("0px", -1)).toBe("0px");
    });
});

describe("pickProbe layout", () => {
    it("captures and applies flex layout values", () => {
        document.body.innerHTML = `<div id="flex-root" style="display:flex;justify-content:center;align-items:flex-end;flex-direction:column;gap:12px;padding:8px;margin:4px"><span>child</span></div>`;
        const element = document.getElementById("flex-root") as HTMLElement;
        const captured = capturePickProbeValues(element);

        expect(captured.justifyContent).toBe("center");
        expect(captured.alignItems).toBe("flex-end");
        expect(captured.flexDirection).toBe("column");
        expect(captured.gap).toBe("12px");

        applyPickProbeValues(element, {
            ...captured,
            justifyContent: "flex-start",
            gap: "20px",
        });

        const style = window.getComputedStyle(element);
        expect(style.justifyContent).toBe("flex-start");
        expect(style.gap).toBe("20px");
    });

    it("captures and applies grid layout values", () => {
        document.body.innerHTML = `<div id="grid-root" style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));grid-template-rows:repeat(3,minmax(0,1fr));gap:16px;padding:8px;margin:4px"><span>child</span></div>`;
        const element = document.getElementById("grid-root") as HTMLElement;
        const captured = capturePickProbeValues(element);

        expect(captured.gridColumnCount).toBe("2");
        expect(captured.gridRowCount).toBe("3");
        expect(captured.gap).toBe("16px");

        applyPickProbeValues(element, {
            ...captured,
            gridColumnCount: "4",
            gridRowCount: "2",
        });

        const style = window.getComputedStyle(element);
        expect(style.gridTemplateColumns).toBe(formatGridTrackCount(4));
        expect(style.gridTemplateRows).toBe(formatGridTrackCount(2));
    });

    it("includes layout fields in proposed changes for flex elements", () => {
        const baseline = {
            ...baseProbeValues,
            justifyContent: "flex-start",
            alignItems: "center",
            flexDirection: "row",
            gap: "8px",
        };
        const current = {
            ...baseline,
            justifyContent: "space-between",
            gap: "12px",
        };

        const changes = getProposedChanges(baseline, current, false, "flex");

        expect(changes).toEqual([
            { key: "justifyContent", before: "flex-start", after: "space-between" },
            { key: "gap", before: "8px", after: "12px" },
        ]);
    });
});
