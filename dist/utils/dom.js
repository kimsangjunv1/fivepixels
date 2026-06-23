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
export function isFeedbackTargetVisible(element) {
    if ("checkVisibility" in element && typeof element.checkVisibility === "function") {
        if (!element.checkVisibility({ checkOpacity: true, checkVisibilityCSS: true })) {
            return false;
        }
    }
    const rect = element.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) {
        return false;
    }
    const style = window.getComputedStyle(element);
    if (style.display === "none" || style.visibility === "hidden") {
        return false;
    }
    if (Number.parseFloat(style.opacity) <= 0) {
        return false;
    }
    return true;
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
export function resolveFeedbackDocumentAnchor(targetElement) {
    let node = targetElement.parentElement;
    while (node && node !== document.documentElement) {
        const reportId = node.dataset.reportId?.trim();
        if (reportId && window.getComputedStyle(node).position !== "fixed") {
            return toSnapshot(node);
        }
        node = node.parentElement;
    }
    return null;
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
function isScrollableOverflow(value) {
    return value === "auto" || value === "scroll" || value === "overlay";
}
export function getNearestScrollContainer(element) {
    let node = element.parentElement;
    while (node && node !== document.documentElement) {
        const style = window.getComputedStyle(node);
        const canScrollY = isScrollableOverflow(style.overflowY) && node.scrollHeight > node.clientHeight + 1;
        const canScrollX = isScrollableOverflow(style.overflowX) && node.scrollWidth > node.clientWidth + 1;
        if (canScrollY || canScrollX) {
            return node;
        }
        node = node.parentElement;
    }
    return null;
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
const REPORT_HOST_ID = "fivepixels-root";
const REPORT_MOUNT_ATTR = "data-fivepixels-mount";
const REPORT_TOOLTIP_LAYER_ATTR = "data-fivepixels-tooltip-layer";
export function getReportPortalRoot() {
    const mount = document.getElementById(REPORT_HOST_ID)?.shadowRoot?.querySelector(`[${REPORT_MOUNT_ATTR}]`);
    if (mount instanceof HTMLElement) {
        return mount;
    }
    return document.body;
}
export function ensureReportTooltipLayer() {
    const shadowRoot = document.getElementById(REPORT_HOST_ID)?.shadowRoot;
    if (!shadowRoot) {
        return document.body;
    }
    let layer = shadowRoot.querySelector(`[${REPORT_TOOLTIP_LAYER_ATTR}]`);
    if (!(layer instanceof HTMLElement)) {
        const newLayer = document.createElement("div");
        newLayer.setAttribute(REPORT_TOOLTIP_LAYER_ATTR, "");
        newLayer.style.cssText = "position:fixed;inset:0;z-index:2147483647;pointer-events:none;overflow:visible;";
        shadowRoot.append(newLayer);
        return newLayer;
    }
    if (layer !== shadowRoot.lastElementChild) {
        shadowRoot.append(layer);
    }
    return layer;
}
export function getReportTooltipRoot() {
    return ensureReportTooltipLayer();
}
//# sourceMappingURL=dom.js.map