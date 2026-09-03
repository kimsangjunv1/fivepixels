import type { ReportTargetType } from "@/shared/types/report.js";
import { getPageViewportSize, getPageWindow } from "../overlay/pageDocumentBridge.js";

function getElementWindow(element: Element) {
    return element.ownerDocument.defaultView ?? getPageWindow();
}

function isStyleHidden(style: CSSStyleDeclaration) {
    return style.display === "none" || style.visibility === "hidden" || Number.parseFloat(style.opacity) <= 0;
}

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

export function isFeedbackTargetVisible(element: HTMLElement) {
    if ("checkVisibility" in element && typeof element.checkVisibility === "function") {
        if (!element.checkVisibility({ checkOpacity: true, checkVisibilityCSS: true })) {
            return false;
        }
    } else {
        let node: HTMLElement | null = element;

        while (node && node !== node.ownerDocument.documentElement) {
            if (isStyleHidden(getElementWindow(node).getComputedStyle(node))) {
                return false;
            }

            node = node.parentElement;
        }
    }

    const rect = element.getBoundingClientRect();

    if (rect.width <= 0 || rect.height <= 0) {
        return false;
    }

    const viewport = getPageViewportSize();
    return rect.right > 0 && rect.bottom > 0 && rect.left < viewport.width && rect.top < viewport.height;
}
