import { describe, expect, it } from "vitest";
import { normalizeMarkersListItem, normalizeMarkersListItems } from "./normalizeMarkersListItem.js";

const SAMPLE_MARKERS_LIST = [
    {
        id: "01a04dc4-a5f2-7af6-8944-908c239cc4ed",
        report_id: "fp-pick-67m820",
        report_type: "item",
        target_selector: "#notice > div > section > section > section > section > section:nth-of-type(2) > div:nth-of-type(4)",
        status: "open",
        position: {
            target: {
                x: 0.3270871933851387,
                y: 0.9118209562563581,
            },
            viewport: {
                x: 0.524390243902439,
                y: 0.2864963503649635,
                width: 1066,
                height: 1096,
            },
            scroll_y: 43.75,
            anchor: null,
        },
        version: 0,
        cases: [
            {
                status: "open",
                version: 0,
            },
        ],
    },
    {
        id: "01a04953-0cee-7908-9e67-0afcd204c7ba",
        report_id: "fp-pick-67m84l",
        report_type: "item",
        target_selector: "#notice > div > section > section > section > section > section:nth-of-type(2) > div:nth-of-type(7)",
        status: "OPEN",
        position: {
            target: {
                x: 0.29735350239207986,
                y: 0.10461851475076298,
            },
            viewport: {
                x: 0.5046904315196998,
                y: 0.42244525547445255,
                width: 1066,
                height: 1096,
            },
            scrollY: 0,
            anchor: null,
        },
        version: 0,
        cases: [
            {
                status: "OPEN",
                version: 0,
            },
        ],
    },
];

describe("normalizeMarkersListItem", () => {
    it("normalizes abbreviated snake_case marker list payloads for rendering", () => {
        const [first, second] = normalizeMarkersListItems(SAMPLE_MARKERS_LIST, { pathname: "/notice" });

        expect(first).toMatchObject({
            id: "01a04dc4-a5f2-7af6-8944-908c239cc4ed",
            pathname: "/notice",
            report_id: "fp-pick-67m820",
            report_type: "item",
            target_selector: "#notice > div > section > section > section > section > section:nth-of-type(2) > div:nth-of-type(4)",
            status: "open",
            field_values: {},
            position: {
                target: { x: 0.3270871933851387, y: 0.9118209562563581 },
                viewport: { x: 0.524390243902439, y: 0.2864963503649635, width: 1066, height: 1096 },
                scrollY: 43.75,
                anchor: null,
            },
        });
        expect(first?.cases).toHaveLength(1);
        expect(first?.cases[0]).toMatchObject({
            text: "",
            status: "open",
        });
        expect(first?.cases[0]?.id).toBeTruthy();

        expect(second).toMatchObject({
            id: "01a04953-0cee-7908-9e67-0afcd204c7ba",
            report_id: "fp-pick-67m84l",
            status: "open",
            position: {
                scrollY: 0,
                target: { x: 0.29735350239207986, y: 0.10461851475076298 },
            },
        });
        expect(second?.cases[0]?.status).toBe("open");
    });

    it("returns null when id or target binding is missing", () => {
        expect(normalizeMarkersListItem({ report_id: "x", report_type: "item" })).toBeNull();
        expect(normalizeMarkersListItem({ id: "fb-1", report_type: "item" })).toBeNull();
    });

    it("accepts snake_case anchor fields", () => {
        const normalized = normalizeMarkersListItem({
            id: "fb-1",
            report_id: "missing",
            report_type: "item",
            target_selector: "#box",
            position: {
                target: null,
                viewport: { x: 0.5, y: 0.5, width: 800, height: 600 },
                scroll_y: 10,
                anchor: { report_id: "hero", report_type: "group", x: 0.2, y: 0.8 },
            },
        });

        expect(normalized?.position.anchor).toEqual({
            reportId: "hero",
            reportType: "group",
            x: 0.2,
            y: 0.8,
        });
    });
});
