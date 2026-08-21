import { escapeAttribute, isFeedbackTargetVisible } from "@/utils/shared/dom.js";
import type { ReportFeedback } from "@/types/report.js";
import { getPageWindow, isHtmlElement, queryPageSelector, queryPageSelectorAll } from "@/utils/overlay/pageDocumentBridge.js";
import { waitForTargetRevealResync } from "./locateFeedback.js";

export const VIEW_ATTRIBUTE = "data-fp-view";
export const OPEN_ATTRIBUTE = "data-fp-open";

function getAttributeSelector(attribute: string, value: string) {
    return `[${attribute}="${escapeAttribute(value)}"]`;
}

function isViewOpen(element: HTMLElement) {
    if (element.hidden || element.getAttribute("aria-hidden") === "true") {
        return false;
    }

    if ("checkVisibility" in element && typeof element.checkVisibility === "function") {
        if (!element.checkVisibility({ checkOpacity: true, checkVisibilityCSS: true })) {
            return false;
        }
    } else {
        const style = getPageWindow().getComputedStyle(element);

        if (style.display === "none" || style.visibility === "hidden" || Number.parseFloat(style.opacity) <= 0) {
            return false;
        }
    }

    const rect = element.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0;
}

function isTriggerEnabled(element: HTMLElement) {
    return element.getAttribute("aria-disabled") !== "true" && !("disabled" in element && element.disabled === true);
}

export function getFeedbackViewTrigger(viewPath: string[] | undefined, options: { visibleOnly?: boolean } = {}) {
    for (const viewKey of viewPath ?? []) {
        const view = queryPageSelector(getAttributeSelector(VIEW_ATTRIBUTE, viewKey));

        if (isHtmlElement(view) && isViewOpen(view)) {
            continue;
        }

        const triggers = queryPageSelectorAll(getAttributeSelector(OPEN_ATTRIBUTE, viewKey)).filter(
            (element): element is HTMLElement => isHtmlElement(element) && isTriggerEnabled(element),
        );
        const trigger = triggers.find(isFeedbackTargetVisible) ?? (options.visibleOnly ? null : triggers[0]);

        if (trigger) {
            return { element: trigger, viewKey };
        }
    }

    return null;
}

export function getActiveFeedbackViewKeys() {
    const visibleViews = queryPageSelectorAll(`[${VIEW_ATTRIBUTE}]`).filter(
        (element): element is HTMLElement =>
            isHtmlElement(element) && Boolean(element.getAttribute(VIEW_ATTRIBUTE)?.trim()) && isFeedbackTargetVisible(element),
    );
    const deepestVisibleViews = visibleViews.filter(
        (view) => !visibleViews.some((candidate) => candidate !== view && view.contains(candidate)),
    );

    return Array.from(new Set(deepestVisibleViews.flatMap((view) => {
        const viewKey = view.getAttribute(VIEW_ATTRIBUTE)?.trim();
        return viewKey ? [viewKey] : [];
    })));
}

export function filterFeedbackForActiveViews(reports: ReportFeedback[], activeViewKeys: string[]) {
    if (activeViewKeys.length === 0) {
        return reports;
    }

    const activeViewKeySet = new Set(activeViewKeys);
    return reports.filter((report) => report.position.viewPath?.some((viewKey) => activeViewKeySet.has(viewKey)));
}

export function getFeedbackViewPath(element: HTMLElement | null) {
    const viewPath: string[] = [];
    let current = element;

    while (current) {
        const viewKey = current.getAttribute(VIEW_ATTRIBUTE)?.trim();

        if (viewKey && !viewPath.includes(viewKey)) {
            viewPath.unshift(viewKey);
        }

        current = current.parentElement;
    }

    return viewPath;
}

export async function restoreFeedbackViews(viewPath: string[] | undefined) {
    let triggered = false;

    for (const viewKey of viewPath ?? []) {
        const view = queryPageSelector(getAttributeSelector(VIEW_ATTRIBUTE, viewKey));

        if (isHtmlElement(view) && isViewOpen(view)) {
            continue;
        }

        const trigger = getFeedbackViewTrigger([viewKey])?.element;

        if (!isHtmlElement(trigger)) {
            continue;
        }

        trigger.click();
        triggered = true;
        await waitForTargetRevealResync();
    }

    return triggered;
}
