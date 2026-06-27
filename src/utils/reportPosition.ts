import type { ReportPosition, ReportPositionAnchor, ReportPositionRatio, ReportPositionViewport } from "@/types/report.js";

export function getDocumentY(position: ReportPosition): number {
    return position.scrollY + position.viewport.y * position.viewport.height;
}

export function createReportPosition(
    overrides: {
        target?: ReportPositionRatio | null;
        viewport?: Partial<ReportPositionViewport>;
        scrollY?: number;
        anchor?: ReportPositionAnchor | null;
    } = {},
): ReportPosition {
    return {
        target: overrides.target ?? { x: 0.25, y: 0.75 },
        viewport: {
            x: 0.5,
            y: 0.5,
            width: 1024,
            height: 768,
            ...overrides.viewport,
        },
        scrollY: overrides.scrollY ?? 0,
        anchor: overrides.anchor ?? null,
    };
}
