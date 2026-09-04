import { describe, expect, it } from "vitest";
import {
    PANEL_NOTIFICATION_GAP_PX,
    buildAnchorFromPanel,
    resolveNotificationExpandDirection,
} from "./useNotificationStackAnchor.js";

describe("notification stack anchor rules", () => {
    it("keeps a 0px gap constant", () => {
        expect(PANEL_NOTIFICATION_GAP_PX).toBe(0);
    });

    it("expands away from the panel by corner", () => {
        expect(resolveNotificationExpandDirection("bottom-left")).toBe("up");
        expect(resolveNotificationExpandDirection("bottom-right")).toBe("up");
        expect(resolveNotificationExpandDirection("top-left")).toBe("down");
        expect(resolveNotificationExpandDirection("top-right")).toBe("down");
    });

    it("places the tray below a top-docked panel with no gap", () => {
        const panel = {
            getBoundingClientRect: () => ({
                top: 16,
                right: 400,
                bottom: 220,
                left: 16,
                width: 384,
                height: 204,
                x: 16,
                y: 16,
                toJSON: () => ({}),
            }),
        } as HTMLElement;

        const anchor = buildAnchorFromPanel(panel, "top-left");

        expect(anchor.expandDirection).toBe("down");
        expect(anchor.style.top).toBe(220 + PANEL_NOTIFICATION_GAP_PX);
        expect(anchor.style.left).toBe(16);
    });

    it("places the tray above a bottom-docked panel with no gap", () => {
        const viewportHeight = window.innerHeight;
        const panelTop = viewportHeight - 220;
        const panel = {
            getBoundingClientRect: () => ({
                top: panelTop,
                right: 400,
                bottom: viewportHeight - 16,
                left: 16,
                width: 384,
                height: 204,
                x: 16,
                y: panelTop,
                toJSON: () => ({}),
            }),
        } as HTMLElement;

        const anchor = buildAnchorFromPanel(panel, "bottom-left");

        expect(anchor.expandDirection).toBe("up");
        expect(anchor.style.bottom).toBe(viewportHeight - panelTop + PANEL_NOTIFICATION_GAP_PX);
        expect(anchor.style.left).toBe(16);
    });

    it("tracks live rect so a moved top panel keeps no gap below", () => {
        const panel = {
            getBoundingClientRect: () => ({
                top: 16,
                right: window.innerWidth - 16,
                bottom: 180,
                left: window.innerWidth - 400,
                width: 384,
                height: 164,
                x: window.innerWidth - 400,
                y: 16,
                toJSON: () => ({}),
            }),
        } as HTMLElement;

        const anchor = buildAnchorFromPanel(panel, "top-right");

        expect(anchor.style.top).toBe(180 + PANEL_NOTIFICATION_GAP_PX);
        expect(anchor.style.right).toBe(16);
    });
});
