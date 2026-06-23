import { TARGET_SELECTOR } from "@/constants/report.js";
import type { ReportTargetType } from "@/types/report.js";
import type { TargetSnapshot } from "@/types/report-ui.js";

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

export function isSameHoverTarget(previous: TargetSnapshot | null, next: TargetSnapshot | null) {
    if (previous === next) {
        return true;
    }

    if (!previous || !next) {
        return false;
    }

    return previous.id === next.id && previous.type === next.type;
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
    };
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

export function getSelectableTargets() {
    return Array.from(document.querySelectorAll<HTMLElement>(TARGET_SELECTOR))
        .map((element) => toSnapshot(element))
        .filter((snapshot): snapshot is TargetSnapshot => snapshot !== null);
}

export function findTargetByPoint(overlay: HTMLDivElement | null, clientX: number, clientY: number) {
    if (!overlay) {
        return null;
    }

    const previousPointerEvents = overlay.style.pointerEvents;
    overlay.style.pointerEvents = "none";
    const hitElement = document.elementFromPoint(clientX, clientY) as HTMLElement | null;
    overlay.style.pointerEvents = previousPointerEvents;

    return findTargetElement(hitElement);
}

const REPORT_HOST_ID = "fivepixels-root";
const REPORT_MOUNT_ATTR = "data-fivepixels-mount";
const REPORT_TOOLTIP_LAYER_ATTR = "data-fivepixels-tooltip-layer";

export function getReportPortalRoot(): HTMLElement {
    const mount = document.getElementById(REPORT_HOST_ID)?.shadowRoot?.querySelector(`[${REPORT_MOUNT_ATTR}]`);

    if (mount instanceof HTMLElement) {
        return mount;
    }

    return document.body;
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
        newLayer.style.cssText = "position:fixed;inset:0;z-index:2147483647;pointer-events:none;overflow:visible;";
        shadowRoot.append(newLayer);
        return newLayer;
    }

    if (layer !== shadowRoot.lastElementChild) {
        shadowRoot.append(layer);
    }

    return layer;
}

export function getReportTooltipRoot(): HTMLElement {
    return ensureReportTooltipLayer();
}
