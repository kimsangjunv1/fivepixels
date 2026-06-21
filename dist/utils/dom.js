import { TARGET_SELECTOR } from "../constants/report.js";
export function escapeAttribute(value) {
    return value.split("\\").join("\\\\").split('"').join('\\"');
}
export function resolveReportType(element) {
    return element.dataset.reportType === "group" ? "group" : "item";
}
export function getFeedbackTargetSelector(reportId, reportType) {
    const escapedId = escapeAttribute(reportId);
    if (reportType === "group") {
        return `[data-report-id="${escapedId}"][data-report-type="group"]`;
    }
    return `[data-report-id="${escapedId}"]:not([data-report-type="group"])`;
}
export function isSameHoverTarget(previous, next) {
    if (previous === next) {
        return true;
    }
    if (!previous || !next) {
        return false;
    }
    return previous.id === next.id && previous.type === next.type;
}
export function toSnapshot(element) {
    if (!element) {
        return null;
    }
    const reportId = element.dataset.reportId?.trim();
    if (!reportId) {
        return null;
    }
    return {
        id: reportId,
        type: resolveReportType(element),
        rect: element.getBoundingClientRect(),
    };
}
export function findTargetElement(baseElement) {
    if (!baseElement) {
        return null;
    }
    let groupFallback = null;
    let node = baseElement;
    while (node) {
        const reportId = node.dataset.reportId?.trim();
        if (reportId) {
            if (resolveReportType(node) === "item") {
                return node;
            }
            if (!groupFallback) {
                groupFallback = node;
            }
        }
        node = node.parentElement;
    }
    return groupFallback;
}
export function getSelectableTargets() {
    return Array.from(document.querySelectorAll(TARGET_SELECTOR))
        .map((element) => toSnapshot(element))
        .filter((snapshot) => snapshot !== null);
}
export function findTargetByPoint(overlay, clientX, clientY) {
    if (!overlay) {
        return null;
    }
    const previousPointerEvents = overlay.style.pointerEvents;
    overlay.style.pointerEvents = "none";
    const hitElement = document.elementFromPoint(clientX, clientY);
    overlay.style.pointerEvents = previousPointerEvents;
    return findTargetElement(hitElement);
}
//# sourceMappingURL=dom.js.map