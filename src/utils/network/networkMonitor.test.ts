import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
    clearNetworkMonitorEntries,
    getNetworkMonitorSnapshot,
    installNetworkMonitor,
    resetNetworkMonitorForTests,
    uninstallNetworkMonitor,
} from "./networkMonitor.js";

describe("networkMonitor", () => {
    beforeEach(() => {
        resetNetworkMonitorForTests();
        vi.stubGlobal(
            "fetch",
            vi.fn(async () =>
                new Response(JSON.stringify({ ok: true }), {
                    status: 200,
                    headers: { "Content-Type": "application/json" },
                }),
            ),
        );
    });

    afterEach(() => {
        uninstallNetworkMonitor();
        resetNetworkMonitorForTests();
        vi.unstubAllGlobals();
    });

    it("records successful fetch requests", async () => {
        installNetworkMonitor();

        await window.fetch("/api/users?page=1", { method: "GET" });

        const snapshot = getNetworkMonitorSnapshot();
        expect(snapshot.entries).toHaveLength(1);
        expect(snapshot.entries[0]?.method).toBe("GET");
        expect(snapshot.entries[0]?.pathname).toBe("/api/users");
        expect(snapshot.entries[0]?.queryParams.page).toBe("1");
        expect(snapshot.entries[0]?.ok).toBe(true);
        expect(snapshot.entries[0]?.status).toBe(200);
    });

    it("records failed fetch requests and exposes an alert", async () => {
        vi.stubGlobal(
            "fetch",
            vi.fn(async () =>
                new Response(JSON.stringify({ message: "fail" }), {
                    status: 500,
                    statusText: "Internal Server Error",
                    headers: { "Content-Type": "application/json" },
                }),
            ),
        );

        installNetworkMonitor();

        await window.fetch("/api/save", {
            method: "POST",
            body: JSON.stringify({ name: "demo" }),
            headers: { "Content-Type": "application/json" },
        });

        const snapshot = getNetworkMonitorSnapshot();
        expect(snapshot.entries[0]?.ok).toBe(false);
        expect(snapshot.entries[0]?.status).toBe(500);
        expect(snapshot.entries[0]?.requestBody).toContain("demo");
        expect(snapshot.entries[0]?.responseBody).toContain("fail");
        expect(snapshot.activeFailureAlert?.id).toBe(snapshot.entries[0]?.id);
    });

    it("records network failures", async () => {
        vi.stubGlobal(
            "fetch",
            vi.fn(async () => {
                throw new TypeError("Failed to fetch");
            }),
        );

        installNetworkMonitor();

        await expect(window.fetch("/api/offline")).rejects.toThrow("Failed to fetch");

        const snapshot = getNetworkMonitorSnapshot();
        expect(snapshot.entries[0]?.failureKind).toBe("network");
        expect(snapshot.entries[0]?.errorMessage).toContain("Failed to fetch");
    });

    it("keeps only the latest 100 entries", async () => {
        installNetworkMonitor();

        for (let index = 0; index < 105; index += 1) {
            await window.fetch(`/api/item-${index}`);
        }

        expect(getNetworkMonitorSnapshot().entries).toHaveLength(100);
        expect(getNetworkMonitorSnapshot().entries[0]?.url).toContain("item-104");
    });

    it("clears entries on demand", async () => {
        installNetworkMonitor();
        await window.fetch("/api/ping");
        clearNetworkMonitorEntries();
        expect(getNetworkMonitorSnapshot().entries).toHaveLength(0);
    });

    it("returns a stable snapshot reference until entries change", async () => {
        installNetworkMonitor();
        await window.fetch("/api/stable");

        const first = getNetworkMonitorSnapshot();
        const second = getNetworkMonitorSnapshot();
        expect(second).toBe(first);

        await window.fetch("/api/stable-2");
        expect(getNetworkMonitorSnapshot()).not.toBe(first);
    });
});
