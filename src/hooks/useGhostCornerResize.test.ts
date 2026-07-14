import { describe, expect, it } from "vitest";
import { resolveGhostCornerRect } from "@/hooks/useGhostCornerResize.js";

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
