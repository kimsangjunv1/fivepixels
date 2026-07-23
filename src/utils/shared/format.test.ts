import { describe, expect, it } from "vitest";
import { formatTimeCompact } from "./format.js";

describe("formatTimeCompact", () => {
    it("formats Korean compact time as 오전/오후 HH:mm in local time", () => {
        const afternoon = new Date(2026, 6, 23, 13, 30, 0);
        const midnight = new Date(2026, 6, 23, 0, 5, 0);
        const noon = new Date(2026, 6, 23, 12, 0, 0);

        expect(formatTimeCompact(afternoon.toISOString(), "ko")).toBe("오후 01:30");
        expect(formatTimeCompact(midnight.toISOString(), "ko")).toBe("오전 12:05");
        expect(formatTimeCompact(noon.toISOString(), "ko")).toBe("오후 12:00");
    });
});
