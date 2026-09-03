import type { ReportPosition, ReportPositionAnchor, ReportPositionRatio, ReportPositionViewport, ReportTargetType } from "@/shared/types/report.js";

function isFiniteNumber(value: unknown): value is number {
    return typeof value === "number" && Number.isFinite(value);
}

function getFallbackViewportSize() {
    if (typeof window === "undefined") {
        return { width: 1, height: 1 };
    }

    return {
        width: window.innerWidth > 0 ? window.innerWidth : 1,
        height: window.innerHeight > 0 ? window.innerHeight : 1,
    };
}

function getFallbackScrollY() {
    if (typeof window === "undefined") {
        return 0;
    }

    return Number.isFinite(window.scrollY) ? window.scrollY : 0;
}

function normalizePositionRatio(value: unknown): ReportPositionRatio | null {
    if (value === null || value === undefined) {
        return null;
    }

    if (!value || typeof value !== "object" || Array.isArray(value)) {
        return null;
    }

    const ratio = value as Record<string, unknown>;

    if (!isFiniteNumber(ratio.x) || !isFiniteNumber(ratio.y)) {
        return null;
    }

    return {
        x: ratio.x,
        y: ratio.y,
    };
}

function normalizePositionViewport(value: unknown): ReportPositionViewport {
    const fallbackSize = getFallbackViewportSize();

    if (!value || typeof value !== "object" || Array.isArray(value)) {
        return {
            x: 0.5,
            y: 0.5,
            width: fallbackSize.width,
            height: fallbackSize.height,
        };
    }

    const viewport = value as Record<string, unknown>;

    return {
        x: isFiniteNumber(viewport.x) ? viewport.x : 0.5,
        y: isFiniteNumber(viewport.y) ? viewport.y : 0.5,
        width: isFiniteNumber(viewport.width) && viewport.width > 0 ? viewport.width : fallbackSize.width,
        height: isFiniteNumber(viewport.height) && viewport.height > 0 ? viewport.height : fallbackSize.height,
    };
}

function normalizePositionAnchor(value: unknown): ReportPositionAnchor | null {
    if (value === null || value === undefined) {
        return null;
    }

    if (!value || typeof value !== "object" || Array.isArray(value)) {
        return null;
    }

    const anchor = value as Record<string, unknown>;
    const reportId = typeof anchor.reportId === "string" && anchor.reportId ? anchor.reportId : typeof anchor.report_id === "string" ? anchor.report_id : "";
    const reportType = anchor.reportType ?? anchor.report_type;

    if (!reportId) {
        return null;
    }

    if (reportType !== "group" && reportType !== "item") {
        return null;
    }

    if (!isFiniteNumber(anchor.x) || !isFiniteNumber(anchor.y)) {
        return null;
    }

    return {
        reportId,
        reportType: reportType as ReportTargetType,
        x: anchor.x,
        y: anchor.y,
    };
}

function normalizeViewPath(value: unknown) {
    if (!Array.isArray(value)) {
        return [];
    }

    return value.flatMap((item) => (typeof item === "string" && item.trim() ? [item.trim()] : []));
}

/** Coerce missing/partial API position payloads into a render-safe ReportPosition. */
export function normalizeReportPosition(value: unknown): ReportPosition {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
        return {
            target: null,
            viewport: normalizePositionViewport(undefined),
            scrollY: getFallbackScrollY(),
            anchor: null,
        };
    }

    const position = value as Record<string, unknown>;
    const viewPath = normalizeViewPath(position.viewPath ?? position.view_path);
    const scrollY = isFiniteNumber(position.scrollY)
        ? position.scrollY
        : isFiniteNumber(position.scroll_y)
          ? position.scroll_y
          : getFallbackScrollY();

    return {
        target: normalizePositionRatio(position.target),
        viewport: normalizePositionViewport(position.viewport),
        scrollY,
        anchor: normalizePositionAnchor(position.anchor),
        ...(viewPath.length > 0 ? { viewPath } : {}),
    };
}

export function getDocumentY(position: ReportPosition): number {
    return position.scrollY + position.viewport.y * position.viewport.height;
}

export function createReportPosition(
    overrides: {
        target?: ReportPositionRatio | null;
        viewport?: Partial<ReportPositionViewport>;
        scrollY?: number;
        anchor?: ReportPositionAnchor | null;
        viewPath?: string[];
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
        ...(overrides.viewPath?.length ? { viewPath: overrides.viewPath } : {}),
    };
}
