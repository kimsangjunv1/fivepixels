import type { ReportTargetType } from "@/types/report.js";
import type { PickProbeCompareMode, PickProbeValues, ProbeOriginalSnapshot, SavedProbeDeletion, SavedProbeEntry } from "@/types/report-ui.js";
import { applyPickProbeCompareMode, applyPickProbeValues } from "./pickProbe.js";
import { getFeedbackTargetSelector, resolveReportType } from "./dom.js";
import { shouldInspectFontStyle } from "./pickTargetInspect.js";
import { findElementByTargetSelector, generateCssSelector } from "./targetSelector.js";

export type ProbeRestoreSnapshot = Pick<ProbeOriginalSnapshot, "style" | "innerHTML" | "textContent" | "inputValue">;

export function restoreProbeElementFromSnapshot(element: HTMLElement, snapshot: ProbeRestoreSnapshot) {
    if (snapshot.style === null) {
        element.removeAttribute("style");
    } else {
        element.setAttribute("style", snapshot.style);
    }

    if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement) {
        if (snapshot.inputValue !== null) {
            element.value = snapshot.inputValue;
        }

        return;
    }

    if (shouldInspectFontStyle(element)) {
        element.textContent = snapshot.textContent;
        return;
    }

    element.innerHTML = snapshot.innerHTML;
}

export function createProbeDeletionId() {
    return `probe-del-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

export function getPickProbeElementKey(element: HTMLElement) {
    const reportId = element.dataset.reportId?.trim();

    if (reportId) {
        return `id:${reportId}:${resolveReportType(element)}`;
    }

    return `selector:${generateCssSelector(element)}`;
}

export function findElementByProbeKey(elementKey: string) {
    if (elementKey.startsWith("id:")) {
        const [, reportId, reportType] = elementKey.split(":");

        if (!reportId || !reportType) {
            return null;
        }

        return document.querySelector<HTMLElement>(getFeedbackTargetSelector(reportId, reportType as ReportTargetType));
    }

    if (elementKey.startsWith("selector:")) {
        return findElementByTargetSelector(elementKey.slice("selector:".length));
    }

    return null;
}

export function captureProbeOriginalSnapshot(element: HTMLElement): ProbeOriginalSnapshot {
    const isTextInput = element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement;

    return {
        style: element.getAttribute("style"),
        innerHTML: element.innerHTML,
        textContent: element.textContent,
        inputValue: isTextInput ? element.value : null,
    };
}

export function captureSavedProbeDeletion(element: HTMLElement, elementKey: string): SavedProbeDeletion | null {
    const parent = element.parentElement;

    if (!parent) {
        return null;
    }

    const childIndex = Array.from(parent.children).indexOf(element);

    if (childIndex < 0) {
        return null;
    }

    return {
        id: createProbeDeletionId(),
        elementKey,
        outerHTML: element.outerHTML,
        parentSelector: generateCssSelector(parent),
        childIndex,
    };
}

export function restoreSavedProbeDeletion(entry: SavedProbeDeletion) {
    if (findElementByProbeKey(entry.elementKey)) {
        return null;
    }

    const parent = findElementByTargetSelector(entry.parentSelector);

    if (!parent) {
        return null;
    }

    const template = document.createElement("template");
    template.innerHTML = entry.outerHTML;
    const restored = template.content.firstElementChild;

    if (!(restored instanceof HTMLElement)) {
        return null;
    }

    const referenceChild = parent.children[entry.childIndex] ?? null;
    parent.insertBefore(restored, referenceChild);

    return restored;
}

export function restoreProbeElementOriginal(element: HTMLElement, entry: SavedProbeEntry) {
    if (entry.originalStyle === null) {
        element.removeAttribute("style");
    } else {
        element.setAttribute("style", entry.originalStyle);
    }

    if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement) {
        element.value = entry.originalInputValue ?? entry.baseline.textContent;
        return;
    }

    if (entry.originalInnerHTML !== null) {
        element.innerHTML = entry.originalInnerHTML;
        return;
    }

    if (entry.originalTextContent !== null) {
        element.textContent = entry.originalTextContent;
        return;
    }

    element.textContent = entry.baseline.textContent;
}

export function createSavedProbeEntry(
    elementKey: string,
    baseline: PickProbeValues,
    applied: PickProbeValues,
    originalStyle: string | null,
    originalTextContent: string | null,
    existing?: SavedProbeEntry,
    originalInnerHTML?: string | null,
    originalInputValue?: string | null,
): SavedProbeEntry {
    return {
        elementKey,
        baseline: existing?.baseline ?? baseline,
        applied,
        originalStyle: existing?.originalStyle ?? originalStyle,
        originalTextContent: existing?.originalTextContent ?? originalTextContent,
        originalInnerHTML: existing?.originalInnerHTML ?? originalInnerHTML ?? null,
        originalInputValue: existing?.originalInputValue ?? originalInputValue ?? null,
    };
}

export function commitProbeValuesToElement(element: HTMLElement, values: PickProbeValues) {
    applyPickProbeValues(element, values);
}

export function applySavedProbeEditsCompareMode(
    edits: Record<string, SavedProbeEntry>,
    mode: PickProbeCompareMode,
) {
    for (const entry of Object.values(edits)) {
        const element = findElementByProbeKey(entry.elementKey);

        if (element) {
            applyPickProbeCompareMode(element, mode, entry.baseline, entry.applied);
        }
    }
}
