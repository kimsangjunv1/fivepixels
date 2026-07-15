function isFiniteNumber(value) {
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
function normalizePositionRatio(value) {
    if (value === null || value === undefined) {
        return null;
    }
    if (!value || typeof value !== "object" || Array.isArray(value)) {
        return null;
    }
    const ratio = value;
    if (!isFiniteNumber(ratio.x) || !isFiniteNumber(ratio.y)) {
        return null;
    }
    return {
        x: ratio.x,
        y: ratio.y,
    };
}
function normalizePositionViewport(value) {
    const fallbackSize = getFallbackViewportSize();
    if (!value || typeof value !== "object" || Array.isArray(value)) {
        return {
            x: 0.5,
            y: 0.5,
            width: fallbackSize.width,
            height: fallbackSize.height,
        };
    }
    const viewport = value;
    return {
        x: isFiniteNumber(viewport.x) ? viewport.x : 0.5,
        y: isFiniteNumber(viewport.y) ? viewport.y : 0.5,
        width: isFiniteNumber(viewport.width) && viewport.width > 0 ? viewport.width : fallbackSize.width,
        height: isFiniteNumber(viewport.height) && viewport.height > 0 ? viewport.height : fallbackSize.height,
    };
}
function normalizePositionAnchor(value) {
    if (value === null || value === undefined) {
        return null;
    }
    if (!value || typeof value !== "object" || Array.isArray(value)) {
        return null;
    }
    const anchor = value;
    if (typeof anchor.reportId !== "string" || !anchor.reportId) {
        return null;
    }
    if (anchor.reportType !== "group" && anchor.reportType !== "item") {
        return null;
    }
    if (!isFiniteNumber(anchor.x) || !isFiniteNumber(anchor.y)) {
        return null;
    }
    return {
        reportId: anchor.reportId,
        reportType: anchor.reportType,
        x: anchor.x,
        y: anchor.y,
    };
}
/** Coerce missing/partial API position payloads into a render-safe ReportPosition. */
export function normalizeReportPosition(value) {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
        return {
            target: null,
            viewport: normalizePositionViewport(undefined),
            scrollY: getFallbackScrollY(),
            anchor: null,
        };
    }
    const position = value;
    return {
        target: normalizePositionRatio(position.target),
        viewport: normalizePositionViewport(position.viewport),
        scrollY: isFiniteNumber(position.scrollY) ? position.scrollY : getFallbackScrollY(),
        anchor: normalizePositionAnchor(position.anchor),
    };
}
export function getDocumentY(position) {
    return position.scrollY + position.viewport.y * position.viewport.height;
}
export function createReportPosition(overrides = {}) {
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
//# sourceMappingURL=reportPosition.js.map