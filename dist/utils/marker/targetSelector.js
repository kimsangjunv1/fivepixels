import { escapeAttribute, getFeedbackTargetSelector, isFeedbackTargetVisible, resolveReportType } from "../shared/dom.js";
const REPORT_HOST_ID = "fivepixels-root";
const AUTO_ID_PREFIX = "fp-pick-";
const NON_PICKABLE_TAGS = new Set(["HTML", "HEAD", "BODY", "SCRIPT", "STYLE", "NOSCRIPT", "SVG", "PATH"]);
function slugify(value) {
    return value
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 48);
}
function isGeneratedDomId(id) {
    return /^(react|radix|headlessui|mui|chakra|ember|ng-)/i.test(id) || /^:r[0-9a-z]+:$/i.test(id);
}
function hashSelector(selector) {
    let hash = 0;
    for (let index = 0; index < selector.length; index += 1) {
        hash = (hash * 31 + selector.charCodeAt(index)) >>> 0;
    }
    return hash.toString(36);
}
export function createAutoPickReportId(selector) {
    return `${AUTO_ID_PREFIX}${hashSelector(selector)}`;
}
export function isAutoPickReportId(reportId) {
    return reportId.startsWith(AUTO_ID_PREFIX);
}
export function generateSuggestedReportId(element) {
    const existing = element.dataset.reportId?.trim();
    if (existing) {
        return existing;
    }
    const testId = element.getAttribute("data-testid")?.trim();
    if (testId) {
        return slugify(testId);
    }
    const domId = element.id?.trim();
    if (domId && !isGeneratedDomId(domId)) {
        return slugify(domId);
    }
    const ariaLabel = element.getAttribute("aria-label")?.trim();
    if (ariaLabel) {
        return slugify(`${element.tagName.toLowerCase()}-${ariaLabel}`);
    }
    const text = element.textContent?.trim().replace(/\s+/g, " ").slice(0, 24);
    if (text) {
        return slugify(`${element.tagName.toLowerCase()}-${text}`);
    }
    return slugify(`${element.tagName.toLowerCase()}-element`);
}
export function buildReportIdAttributeSnippet(reportId, reportType = "item") {
    return `data-report-id="${reportId}" data-report-type="${reportType}"`;
}
function buildSelectorSegment(element) {
    const tag = element.tagName.toLowerCase();
    const parent = element.parentElement;
    if (!parent) {
        return tag;
    }
    const siblings = Array.from(parent.children).filter((child) => child instanceof HTMLElement && child.tagName === element.tagName);
    if (siblings.length <= 1) {
        return tag;
    }
    return `${tag}:nth-of-type(${siblings.indexOf(element) + 1})`;
}
export function generateCssSelector(element) {
    const reportId = element.dataset.reportId?.trim();
    if (reportId) {
        return getFeedbackTargetSelector(reportId, resolveReportType(element));
    }
    const path = [];
    let current = element;
    while (current && current !== document.documentElement) {
        const tag = current.tagName.toLowerCase();
        const domId = current.id?.trim();
        if (domId && !isGeneratedDomId(domId)) {
            path.unshift(`#${CSS.escape(domId)}`);
            break;
        }
        const testId = current.getAttribute("data-testid")?.trim();
        if (testId) {
            path.unshift(`${tag}[data-testid="${escapeAttribute(testId)}"]`);
            break;
        }
        path.unshift(buildSelectorSegment(current));
        current = current.parentElement;
    }
    return path.join(" > ");
}
export function findElementByTargetSelector(selector) {
    try {
        const element = document.querySelector(selector);
        return element instanceof HTMLElement ? element : null;
    }
    catch {
        return null;
    }
}
export function resolveTargetBinding(report) {
    if (report.target_selector) {
        const bySelector = findElementByTargetSelector(report.target_selector);
        if (bySelector && isFeedbackTargetVisible(bySelector)) {
            return { kind: "selector", element: bySelector };
        }
    }
    const byReportId = document.querySelector(getFeedbackTargetSelector(report.report_id, report.report_type));
    if (byReportId && isFeedbackTargetVisible(byReportId)) {
        return { kind: "report-id", element: byReportId };
    }
    return { kind: "coordinates", element: byReportId };
}
export function isPickableElement(element) {
    if (NON_PICKABLE_TAGS.has(element.tagName)) {
        return false;
    }
    if (element.id === REPORT_HOST_ID || element.closest(`#${REPORT_HOST_ID}`)) {
        return false;
    }
    const rect = element.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0;
}
//# sourceMappingURL=targetSelector.js.map