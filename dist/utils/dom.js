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
function isStyleHidden(style) {
    if (style.display === "none" || style.visibility === "hidden") {
        return true;
    }
    if (Number.parseFloat(style.opacity) <= 0) {
        return true;
    }
    return false;
}
function intersectsViewport(rect) {
    if (rect.width <= 0 || rect.height <= 0) {
        return false;
    }
    return rect.right > 0 && rect.bottom > 0 && rect.left < window.innerWidth && rect.top < window.innerHeight;
}
export function hasFixedPositionAncestor(element) {
    let node = element.parentElement;
    while (node && node !== document.documentElement) {
        if (window.getComputedStyle(node).position === "fixed") {
            return true;
        }
        node = node.parentElement;
    }
    return false;
}
export function isFeedbackTargetVisible(element) {
    if ("checkVisibility" in element && typeof element.checkVisibility === "function") {
        if (!element.checkVisibility({ checkOpacity: true, checkVisibilityCSS: true })) {
            return false;
        }
    }
    else {
        let node = element;
        while (node && node !== document.documentElement) {
            if (isStyleHidden(window.getComputedStyle(node))) {
                return false;
            }
            node = node.parentElement;
        }
    }
    const rect = element.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) {
        return false;
    }
    if (!intersectsViewport(rect)) {
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
const SCROLL_CLAMP_ATTR = "data-fivepixels-scroll-clamp";
export function getScrollContainerClampId(scrollContainer) {
    const existing = scrollContainer.getAttribute(SCROLL_CLAMP_ATTR);
    if (existing) {
        return existing;
    }
    const id = `scroll-clamp-${Math.random().toString(36).slice(2, 10)}`;
    scrollContainer.setAttribute(SCROLL_CLAMP_ATTR, id);
    return id;
}
export function getScrollContainerByClampId(containerId) {
    return document.querySelector(`[${SCROLL_CLAMP_ATTR}="${containerId}"]`);
}
export function scrollContainerTowardEdge(containerId, edge) {
    const container = getScrollContainerByClampId(containerId);
    if (!container) {
        return;
    }
    const scrollAmount = Math.max(Math.min(container.clientHeight, container.clientWidth) * 0.6, 120);
    switch (edge) {
        case "top":
            container.scrollBy({ top: -scrollAmount, behavior: "smooth" });
            break;
        case "bottom":
            container.scrollBy({ top: scrollAmount, behavior: "smooth" });
            break;
        case "left":
            container.scrollBy({ left: -scrollAmount, behavior: "smooth" });
            break;
        case "right":
            container.scrollBy({ left: scrollAmount, behavior: "smooth" });
            break;
    }
}
export function getSelectableTargets() {
    return Array.from(document.querySelectorAll(TARGET_SELECTOR))
        .map((element) => toSnapshot(element))
        .filter((snapshot) => snapshot !== null);
}
function getElementsFromPoint(clientX, clientY) {
    if (typeof document.elementsFromPoint === "function") {
        return document.elementsFromPoint(clientX, clientY).filter((node) => node instanceof HTMLElement);
    }
    if (typeof document.elementFromPoint === "function") {
        const hitElement = document.elementFromPoint(clientX, clientY);
        return hitElement instanceof HTMLElement ? [hitElement] : [];
    }
    return [];
}
function isAriaHiddenSubtree(element) {
    let node = element;
    while (node && node !== document.documentElement) {
        if (node.getAttribute("aria-hidden") === "true") {
            return true;
        }
        node = node.parentElement;
    }
    return false;
}
function isSelectableFeedbackTarget(target) {
    if (!isFeedbackTargetVisible(target)) {
        return false;
    }
    if (isAriaHiddenSubtree(target)) {
        return false;
    }
    return true;
}
function isPointerEventBlockingLayer(element) {
    const style = window.getComputedStyle(element);
    if (style.pointerEvents === "none" || isStyleHidden(style)) {
        return false;
    }
    if (style.position !== "fixed" && style.position !== "sticky") {
        return false;
    }
    const rect = element.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0;
}
export function findTargetByPoint(overlay, clientX, clientY) {
    if (!overlay) {
        return null;
    }
    const previousPointerEvents = overlay.style.pointerEvents;
    overlay.style.pointerEvents = "none";
    const elements = getElementsFromPoint(clientX, clientY);
    overlay.style.pointerEvents = previousPointerEvents;
    const seen = new Set();
    for (const element of elements) {
        const target = findTargetElement(element);
        if (!target) {
            if (isPointerEventBlockingLayer(element)) {
                return null;
            }
            continue;
        }
        if (seen.has(target)) {
            continue;
        }
        seen.add(target);
        if (!isSelectableFeedbackTarget(target)) {
            continue;
        }
        return target;
    }
    return null;
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