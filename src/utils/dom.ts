import { TARGET_SELECTOR } from "@/constants/report.js";
import type { ReportTargetType } from "@/types/report.js";
import type { PickTargetFontStyle, TargetSnapshot } from "@/types/report-ui.js";
import { getPickTargetBoxStyle, getPickTargetFontStyle, getPickTargetReportIdAttribute, getPickTargetTagName } from "./pickTargetInspect.js";
import {
    createAutoPickReportId,
    generateCssSelector,
    generateSuggestedReportId,
    isPickableElement,
} from "./targetSelector.js";

export function escapeAttribute(value: string) {
    return value.split("\\").join("\\\\").split('"').join('\\"');
}

export function resolveReportType(element: HTMLElement): ReportTargetType {
    return element.dataset.reportType === "group" ? "group" : "item";
}

export function getFeedbackTargetSelector(reportId: string, reportType: ReportTargetType) {
    const escapedId = escapeAttribute(reportId);

    if (reportType === "group") {
        return `[data-report-id="${escapedId}"][data-report-type="group"]`;
    }

    return `[data-report-id="${escapedId}"]:not([data-report-type="group"])`;
}

function isStyleHidden(style: CSSStyleDeclaration) {
    if (style.display === "none" || style.visibility === "hidden") {
        return true;
    }

    if (Number.parseFloat(style.opacity) <= 0) {
        return true;
    }

    return false;
}

function intersectsViewport(rect: DOMRect) {
    if (rect.width <= 0 || rect.height <= 0) {
        return false;
    }

    return rect.right > 0 && rect.bottom > 0 && rect.left < window.innerWidth && rect.top < window.innerHeight;
}

export function hasFixedPositionAncestor(element: HTMLElement) {
    let node: HTMLElement | null = element.parentElement;

    while (node && node !== document.documentElement) {
        if (window.getComputedStyle(node).position === "fixed") {
            return true;
        }

        node = node.parentElement;
    }

    return false;
}

export function isFeedbackTargetVisible(element: HTMLElement) {
    if ("checkVisibility" in element && typeof element.checkVisibility === "function") {
        if (!element.checkVisibility({ checkOpacity: true, checkVisibilityCSS: true })) {
            return false;
        }
    } else {
        let node: HTMLElement | null = element;

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

function isSamePickTargetFontStyle(previous: PickTargetFontStyle | null | undefined, next: PickTargetFontStyle | null | undefined) {
    if (previous === next) {
        return true;
    }

    if (!previous || !next) {
        return !previous && !next;
    }

    return (
        previous.fontFamily === next.fontFamily &&
        previous.fontSize === next.fontSize &&
        previous.fontWeight === next.fontWeight &&
        previous.lineHeight === next.lineHeight
    );
}

function isSamePickTargetBoxStyle(
    previous: TargetSnapshot["boxStyle"],
    next: TargetSnapshot["boxStyle"],
) {
    if (previous === next) {
        return true;
    }

    if (!previous || !next) {
        return !previous && !next;
    }

    return (
        previous.padding === next.padding &&
        previous.margin === next.margin &&
        previous.display === next.display &&
        previous.borderRadius === next.borderRadius
    );
}

function enrichPickTargetInspect(element: HTMLElement, snapshot: TargetSnapshot): TargetSnapshot {
    return {
        ...snapshot,
        tagName: getPickTargetTagName(element),
        reportIdAttribute: getPickTargetReportIdAttribute(element),
        boxStyle: getPickTargetBoxStyle(element),
        fontStyle: getPickTargetFontStyle(element),
    };
}

export function isSameHoverTarget(previous: TargetSnapshot | null, next: TargetSnapshot | null) {
    if (previous === next) {
        return true;
    }

    if (!previous || !next) {
        return false;
    }

    if (previous.id !== next.id || previous.type !== next.type || previous.isTagged !== next.isTagged) {
        return false;
    }

    return (
        previous.rect.left === next.rect.left &&
        previous.rect.top === next.rect.top &&
        previous.rect.width === next.rect.width &&
        previous.rect.height === next.rect.height &&
        previous.tagName === next.tagName &&
        previous.reportIdAttribute === next.reportIdAttribute &&
        isSamePickTargetBoxStyle(previous.boxStyle, next.boxStyle) &&
        isSamePickTargetFontStyle(previous.fontStyle, next.fontStyle)
    );
}

export function hasDirectReportId(element: HTMLElement) {
    return Boolean(element.dataset.reportId?.trim());
}

export function toFeedbackHoverSnapshot(element: HTMLElement | null): TargetSnapshot | null {
    if (!element) {
        return null;
    }

    if (hasDirectReportId(element)) {
        const snapshot = toSnapshot(element);

        if (!snapshot) {
            return null;
        }

        return enrichPickTargetInspect(element, {
            ...snapshot,
            isTagged: true,
        });
    }

    const snapshot = toPickSnapshot(element);

    if (!snapshot) {
        return null;
    }

    return enrichPickTargetInspect(element, {
        ...snapshot,
        isTagged: false,
    });
}

export function toSnapshot(element: HTMLElement | null): TargetSnapshot | null {
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
        isTagged: true,
    };
}

export function resolveFeedbackDocumentAnchor(targetElement: HTMLElement): TargetSnapshot | null {
    let node: HTMLElement | null = targetElement.parentElement;

    while (node && node !== document.documentElement) {
        const reportId = node.dataset.reportId?.trim();

        if (reportId && window.getComputedStyle(node).position !== "fixed") {
            return toSnapshot(node);
        }

        node = node.parentElement;
    }

    return null;
}

export function findTargetElement(baseElement: HTMLElement | null) {
    if (!baseElement) {
        return null;
    }

    let groupFallback: HTMLElement | null = null;
    let node: HTMLElement | null = baseElement;

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

function isScrollableOverflow(value: string) {
    return value === "auto" || value === "scroll" || value === "overlay";
}

export function getNearestScrollContainer(element: HTMLElement): HTMLElement | null {
    let node: HTMLElement | null = element.parentElement;

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

export function getScrollContainerClampId(scrollContainer: HTMLElement): string {
    const existing = scrollContainer.getAttribute(SCROLL_CLAMP_ATTR);

    if (existing) {
        return existing;
    }

    const id = `scroll-clamp-${Math.random().toString(36).slice(2, 10)}`;
    scrollContainer.setAttribute(SCROLL_CLAMP_ATTR, id);
    return id;
}

export function getScrollContainerByClampId(containerId: string): HTMLElement | null {
    return document.querySelector<HTMLElement>(`[${SCROLL_CLAMP_ATTR}="${containerId}"]`);
}

export function scrollContainerTowardEdge(containerId: string, edge: "top" | "bottom" | "left" | "right") {
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
    return Array.from(document.querySelectorAll<HTMLElement>(TARGET_SELECTOR))
        .map((element) => toSnapshot(element))
        .filter((snapshot): snapshot is TargetSnapshot => snapshot !== null);
}

function getElementsFromPoint(clientX: number, clientY: number) {
    if (typeof document.elementsFromPoint === "function") {
        return document.elementsFromPoint(clientX, clientY).filter((node): node is HTMLElement => node instanceof HTMLElement);
    }

    if (typeof document.elementFromPoint === "function") {
        const hitElement = document.elementFromPoint(clientX, clientY);

        return hitElement instanceof HTMLElement ? [hitElement] : [];
    }

    return [];
}

function isAriaHiddenSubtree(element: HTMLElement) {
    let node: HTMLElement | null = element;

    while (node && node !== document.documentElement) {
        if (node.getAttribute("aria-hidden") === "true") {
            return true;
        }

        node = node.parentElement;
    }

    return false;
}

function isSelectableFeedbackTarget(target: HTMLElement) {
    if (!isFeedbackTargetVisible(target)) {
        return false;
    }

    if (isAriaHiddenSubtree(target)) {
        return false;
    }

    return true;
}

function isPointerEventBlockingLayer(element: HTMLElement) {
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

export function toPickSnapshot(element: HTMLElement | null): TargetSnapshot | null {
    if (!element) {
        return null;
    }

    const selector = generateCssSelector(element);
    const reportId = element.dataset.reportId?.trim();
    const suggestedReportId = generateSuggestedReportId(element);

    return {
        id: reportId ?? createAutoPickReportId(selector),
        type: reportId ? resolveReportType(element) : "item",
        rect: element.getBoundingClientRect(),
        isTagged: Boolean(reportId),
        targetSelector: selector,
        suggestedReportId,
    };
}

export function findPickTargetByPoint(overlay: HTMLDivElement | null, clientX: number, clientY: number) {
    if (!overlay) {
        return null;
    }

    const previousPointerEvents = overlay.style.pointerEvents;
    overlay.style.pointerEvents = "none";
    const elements = getElementsFromPoint(clientX, clientY);
    overlay.style.pointerEvents = previousPointerEvents;

    for (const element of elements) {
        if (!isPickableElement(element)) {
            if (isPointerEventBlockingLayer(element)) {
                return null;
            }

            continue;
        }

        if (!isSelectableFeedbackTarget(element)) {
            continue;
        }

        return element;
    }

    return null;
}

export function findTargetByPoint(overlay: HTMLDivElement | null, clientX: number, clientY: number) {
    if (!overlay) {
        return null;
    }

    const previousPointerEvents = overlay.style.pointerEvents;
    overlay.style.pointerEvents = "none";
    const elements = getElementsFromPoint(clientX, clientY);
    overlay.style.pointerEvents = previousPointerEvents;

    const seen = new Set<HTMLElement>();

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
const REPORT_THEME_SCOPE_ATTR = "data-fivepixels-theme-scope";
const REPORT_THEME_ATTR = "data-fivepixels-theme";

export function getReportPortalRoot(): HTMLElement {
    const mount = document.getElementById(REPORT_HOST_ID)?.shadowRoot?.querySelector(`[${REPORT_MOUNT_ATTR}]`);

    if (mount instanceof HTMLElement) {
        return mount;
    }

    return document.body;
}

export function getReportStyleInjectionRoot(): Document | ShadowRoot {
    return document.getElementById(REPORT_HOST_ID)?.shadowRoot ?? document;
}

export function ensureReportTooltipLayer(): HTMLElement {
    const shadowRoot = document.getElementById(REPORT_HOST_ID)?.shadowRoot;

    if (!shadowRoot) {
        return document.body;
    }

    let layer = shadowRoot.querySelector(`[${REPORT_TOOLTIP_LAYER_ATTR}]`);

    if (!(layer instanceof HTMLElement)) {
        const newLayer = document.createElement("div");
        newLayer.setAttribute(REPORT_TOOLTIP_LAYER_ATTR, "");
        newLayer.setAttribute(REPORT_THEME_SCOPE_ATTR, "");
        newLayer.style.cssText = "position:fixed;inset:0;z-index:2147483647;pointer-events:none;overflow:visible;";
        shadowRoot.append(newLayer);
        return newLayer;
    }

    if (layer !== shadowRoot.lastElementChild) {
        shadowRoot.append(layer);
    }

    return layer;
}

export function syncReportTooltipLayerTheme(appearance: "light" | "dark") {
    const layer = document.getElementById(REPORT_HOST_ID)?.shadowRoot?.querySelector(`[${REPORT_TOOLTIP_LAYER_ATTR}]`);

    if (!(layer instanceof HTMLElement)) {
        return;
    }

    layer.setAttribute(REPORT_THEME_SCOPE_ATTR, "");
    layer.setAttribute(REPORT_THEME_ATTR, appearance);
}

export function getReportTooltipRoot(): HTMLElement {
    return ensureReportTooltipLayer();
}
