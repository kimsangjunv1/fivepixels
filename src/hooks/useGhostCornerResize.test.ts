import { describe, expect, it } from "vitest";
import { resolveGhostCornerRect, resolveGhostEdgeRect } from "@/hooks/useGhostCornerResize.js";
import { getResizeHandlesForPlacement } from "@/utils/panel/resizeHandles.js";

const identityClamp = (width: number, height: number) => ({ width, height });

describe("resolveGhostCornerRect", () => {
    const baseSession = {
        startX: 100,
        startY: 100,
        startWidth: 320,
        startHeight: 400,
        visualLeft: 50,
        visualTop: 60,
        handleCorner: "bottom-right" as const,
    };

    it("grows from the bottom-right handle while keeping the top-left fixed", () => {
        const rect = resolveGhostCornerRect(baseSession, 130, 120, identityClamp);

        expect(rect).toEqual({
            left: 50,
            top: 60,
            width: 350,
            height: 420,
        });
    });

    it("grows from the bottom-left handle while keeping the top-right fixed", () => {
        const rect = resolveGhostCornerRect(
            {
                ...baseSession,
                handleCorner: "bottom-left",
            },
            70,
            120,
            identityClamp,
        );

        expect(rect).toEqual({
            left: 20,
            top: 60,
            width: 350,
            height: 420,
        });
    });

    it("grows from the top-right handle while keeping the bottom-left fixed", () => {
        const rect = resolveGhostCornerRect(
            {
                ...baseSession,
                handleCorner: "top-right",
            },
            130,
            80,
            identityClamp,
        );

        expect(rect).toEqual({
            left: 50,
            top: 40,
            width: 350,
            height: 420,
        });
    });

    it("clamps the resolved size", () => {
        const rect = resolveGhostCornerRect(baseSession, 500, 500, (width, height) => ({
            width: Math.min(width, 360),
            height: Math.min(height, 420),
        }));

        expect(rect.width).toBe(360);
        expect(rect.height).toBe(420);
        expect(rect.left).toBe(50);
        expect(rect.top).toBe(60);
    });
});

describe("resolveGhostEdgeRect", () => {
    const baseSession = {
        startX: 100,
        startY: 100,
        startWidth: 320,
        startHeight: 400,
        visualLeft: 50,
        visualTop: 60,
        handleEdge: "right" as const,
    };

    it("grows width from the right edge while keeping the left fixed", () => {
        const rect = resolveGhostEdgeRect(baseSession, 130, 100, identityClamp);

        expect(rect).toEqual({
            left: 50,
            top: 60,
            width: 350,
            height: 400,
        });
    });

    it("grows height from the bottom edge while keeping the top fixed", () => {
        const rect = resolveGhostEdgeRect(
            {
                ...baseSession,
                handleEdge: "bottom",
            },
            100,
            120,
            identityClamp,
        );

        expect(rect).toEqual({
            left: 50,
            top: 60,
            width: 320,
            height: 420,
        });
    });

    it("grows from the top edge while keeping the bottom fixed", () => {
        const rect = resolveGhostEdgeRect(
            {
                ...baseSession,
                handleEdge: "top",
            },
            100,
            80,
            identityClamp,
        );

        expect(rect).toEqual({
            left: 50,
            top: 40,
            width: 320,
            height: 420,
        });
    });
});

describe("getResizeHandlesForPlacement", () => {
    it("exposes right and bottom handles for a top-left panel", () => {
        expect(getResizeHandlesForPlacement("top-left")).toEqual({
            edges: ["right", "bottom"],
            corner: "bottom-right",
        });
    });

    it("exposes right and top handles for a bottom-left panel", () => {
        expect(getResizeHandlesForPlacement("bottom-left")).toEqual({
            edges: ["right", "top"],
            corner: "top-right",
        });
    });

    it("exposes left and top handles for a bottom-right panel", () => {
        expect(getResizeHandlesForPlacement("bottom-right")).toEqual({
            edges: ["left", "top"],
            corner: "top-left",
        });
    });

    it("exposes left and bottom handles for a top-right panel", () => {
        expect(getResizeHandlesForPlacement("top-right")).toEqual({
            edges: ["left", "bottom"],
            corner: "bottom-left",
        });
    });
});
