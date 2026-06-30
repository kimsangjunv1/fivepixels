import { applyPickProbeCompareMode, applyPickProbeValues } from "./pickProbe.js";
import { getFeedbackTargetSelector, resolveReportType } from "./dom.js";
import { findElementByTargetSelector, generateCssSelector } from "./targetSelector.js";
export function getPickProbeElementKey(element) {
    const reportId = element.dataset.reportId?.trim();
    if (reportId) {
        return `id:${reportId}:${resolveReportType(element)}`;
    }
    return `selector:${generateCssSelector(element)}`;
}
export function findElementByProbeKey(elementKey) {
    if (elementKey.startsWith("id:")) {
        const [, reportId, reportType] = elementKey.split(":");
        if (!reportId || !reportType) {
            return null;
        }
        return document.querySelector(getFeedbackTargetSelector(reportId, reportType));
    }
    if (elementKey.startsWith("selector:")) {
        return findElementByTargetSelector(elementKey.slice("selector:".length));
    }
    return null;
}
export function captureProbeOriginalSnapshot(element) {
    const isTextInput = element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement;
    return {
        style: element.getAttribute("style"),
        innerHTML: element.innerHTML,
        textContent: element.textContent,
        inputValue: isTextInput ? element.value : null,
    };
}
export function restoreProbeElementOriginal(element, entry) {
    if (entry.originalStyle === null) {
        element.removeAttribute("style");
    }
    else {
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
export function createSavedProbeEntry(elementKey, baseline, applied, originalStyle, originalTextContent, existing, originalInnerHTML, originalInputValue) {
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
export function commitProbeValuesToElement(element, values) {
    applyPickProbeValues(element, values);
}
export function applySavedProbeEditsCompareMode(edits, mode) {
    for (const entry of Object.values(edits)) {
        const element = findElementByProbeKey(entry.elementKey);
        if (element) {
            applyPickProbeCompareMode(element, mode, entry.baseline, entry.applied);
        }
    }
}
//# sourceMappingURL=pickProbeSession.js.map