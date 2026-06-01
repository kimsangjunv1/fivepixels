import { TARGET_SELECTOR } from "../constants/report.js";
import type { ReportTargetType } from "../types/report.js";
import type { TargetSnapshot } from "../types/report-ui.js";

export function escapeAttribute(value: string) {
    return value.split("\\").join("\\\\").split('"').join('\\"');
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
    const reportType = element.dataset.reportType;

    if (!reportId || (reportType !== "group" && reportType !== "item")) {
        return null;
    }

    return {
        id: reportId,
        type: reportType as ReportTargetType,
        rect: element.getBoundingClientRect(),
    };
}

export function findTargetElement(baseElement: HTMLElement | null) {
    if (!baseElement) {
        return null;
    }

    const itemTarget = baseElement.closest<HTMLElement>('[data-report-type="item"][data-report-id]');

    if (itemTarget) {
        return itemTarget;
    }

    return baseElement.closest<HTMLElement>('[data-report-type="group"][data-report-id]');
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
