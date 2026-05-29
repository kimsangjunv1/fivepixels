export function escapeAttribute(value) {
    return value.split("\\").join("\\\\").split('"').join('\\"');
}
export function toSnapshot(element) {
    if (!element) {
        return null;
    }
    const reportId = element.dataset.reportId?.trim();
    const reportType = element.dataset.reportType;
    if (!reportId || (reportType !== "group" && reportType !== "item")) {
        return null;
    }
    return {
        id: reportId,
        type: reportType,
        rect: element.getBoundingClientRect(),
    };
}
export function findTargetElement(baseElement) {
    if (!baseElement) {
        return null;
    }
    const itemTarget = baseElement.closest('[data-report-type="item"][data-report-id]');
    if (itemTarget) {
        return itemTarget;
    }
    return baseElement.closest('[data-report-type="group"][data-report-id]');
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