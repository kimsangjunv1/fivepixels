export const PROBE_GRID_TRACK_MIN = 1;
export const PROBE_GRID_TRACK_MAX = 12;
export const FLEX_JUSTIFY_VALUES = ["flex-start", "center", "flex-end", "space-between"];
export const FLEX_ALIGN_VALUES = ["flex-start", "center", "flex-end"];
export function getPickProbeLayoutMode(element) {
    const display = window.getComputedStyle(element).display;
    if (display === "flex" || display === "inline-flex") {
        return "flex";
    }
    if (display === "grid" || display === "inline-grid") {
        return "grid";
    }
    return null;
}
export function isColumnFlexDirection(direction) {
    return direction.includes("column");
}
export function isFlexReversed(direction) {
    return direction.includes("reverse");
}
export function getFlexAxis(direction) {
    return isColumnFlexDirection(direction) ? "column" : "row";
}
export function buildFlexDirection(axis, reversed) {
    if (axis === "row") {
        return reversed ? "row-reverse" : "row";
    }
    return reversed ? "column-reverse" : "column";
}
export function toggleFlexReverse(direction) {
    const axis = getFlexAxis(direction);
    return buildFlexDirection(axis, !isFlexReversed(direction));
}
export function parseGridTrackCount(template) {
    const trimmed = template.trim();
    if (!trimmed || trimmed === "none") {
        return PROBE_GRID_TRACK_MIN;
    }
    const repeatMatch = trimmed.match(/^repeat\(\s*(\d+)\s*,/i);
    if (repeatMatch?.[1]) {
        return clampGridTrackCount(Number.parseInt(repeatMatch[1], 10));
    }
    return clampGridTrackCount(trimmed.split(/\s+/).filter(Boolean).length);
}
export function clampGridTrackCount(value) {
    if (!Number.isFinite(value)) {
        return PROBE_GRID_TRACK_MIN;
    }
    return Math.min(PROBE_GRID_TRACK_MAX, Math.max(PROBE_GRID_TRACK_MIN, Math.round(value)));
}
export function formatGridTrackCount(count) {
    return `repeat(${clampGridTrackCount(count)}, minmax(0, 1fr))`;
}
export function parseProbeGap(value) {
    const trimmed = value.trim();
    if (!trimmed || trimmed === "normal") {
        return "0px";
    }
    return trimmed;
}
export function captureProbeGap(style) {
    const gap = style.gap || style.rowGap || style.columnGap;
    return parseProbeGap(gap);
}
export function stepProbeGap(value, delta) {
    const match = value.trim().match(/^(-?\d+(?:\.\d+)?)px$/i);
    if (!match?.[1]) {
        return `${Math.max(0, delta)}px`;
    }
    const next = Math.max(0, Number.parseFloat(match[1]) + delta);
    return `${next}px`;
}
export function stepGridTrackCount(value, delta) {
    const current = Number.parseInt(value, 10);
    return String(clampGridTrackCount((Number.isFinite(current) ? current : PROBE_GRID_TRACK_MIN) + delta));
}
export function inferLayoutModeFromProbeValues(values) {
    if (values.gridColumnCount || values.gridRowCount) {
        return "grid";
    }
    if (values.flexDirection || values.justifyContent) {
        return "flex";
    }
    return null;
}
//# sourceMappingURL=probeLayout.js.map