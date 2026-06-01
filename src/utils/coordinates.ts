import { DOT_SIZE, TARGET_SELECTOR } from "../constants/report.js";
import type { ReportFeedback } from "../types/report.js";
import type { Marker } from "../types/report-ui.js";
import { escapeAttribute } from "./dom.js";

export function clampRatio(value: number) {
    if (Number.isNaN(value)) {
        return 0;
    }

    return Math.min(1, Math.max(0, value));
}

export function getMarkerFromReport(report: ReportFeedback, currentScrollY: number): Marker {
    const selector = `${TARGET_SELECTOR}[data-report-id="${escapeAttribute(report.report_id)}"][data-report-type="${report.report_type}"]`;
    const targetElement = document.querySelector<HTMLElement>(selector);
    const pointLeft = window.innerWidth * report.x_ratio - DOT_SIZE / 2;
    const pointTop = report.document_y - currentScrollY - DOT_SIZE / 2;

    if (targetElement) {
        const rect = targetElement.getBoundingClientRect();

        return {
            id: report.id,
            report,
            left: rect.left + rect.width * (report.element_x_ratio ?? report.x_ratio) - DOT_SIZE / 2,
            top: rect.top + rect.height * (report.element_y_ratio ?? report.y_ratio) - DOT_SIZE / 2,
            rect,
        };
    }

    return {
        id: report.id,
        report,
        left: pointLeft,
        top: pointTop,
        rect: null,
    };
}

export function resolveTooltipAnchor(markers: Marker[], reportId: string | null) {
    if (!reportId) {
        return null;
    }

    return markers.find((marker) => marker.report.id === reportId) ?? null;
}

const TOOLTIP_PREVIEW_WIDTH = 260;
const TOOLTIP_EXPANDED_WIDTH = 280;
const TOOLTIP_PREVIEW_OFFSET = 104;
const TOOLTIP_EXPANDED_OFFSET = 232;
const TOOLTIP_MARGIN = 16;

export function getTooltipPosition(anchor: Pick<Marker, "left" | "top">, expanded: boolean) {
    const width = expanded ? TOOLTIP_EXPANDED_WIDTH : TOOLTIP_PREVIEW_WIDTH;
    const heightOffset = expanded ? TOOLTIP_EXPANDED_OFFSET : TOOLTIP_PREVIEW_OFFSET;
    const preferredLeft = anchor.left - 12;
    const left = Math.min(Math.max(preferredLeft, TOOLTIP_MARGIN), window.innerWidth - width - TOOLTIP_MARGIN);
    const top = Math.max(anchor.top - heightOffset, TOOLTIP_MARGIN);

    return { left, top, width };
}
