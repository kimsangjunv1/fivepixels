import { escapeAttribute } from "../../utils/shared/dom.js";
import { getPageWindow, isHtmlElement, queryPageSelector, queryPageSelectorAll } from "../../utils/overlay/pageDocumentBridge.js";
import { waitForTargetRevealResync } from "./locateFeedback.js";
export const VIEW_ATTRIBUTE = "data-fp-view";
export const OPEN_ATTRIBUTE = "data-fp-open";
function getAttributeSelector(attribute, value) {
    return `[${attribute}="${escapeAttribute(value)}"]`;
}
function isViewOpen(element) {
    if (element.hidden || element.getAttribute("aria-hidden") === "true") {
        return false;
    }
    if ("checkVisibility" in element && typeof element.checkVisibility === "function") {
        if (!element.checkVisibility({ checkOpacity: true, checkVisibilityCSS: true })) {
            return false;
        }
    }
    else {
        const style = getPageWindow().getComputedStyle(element);
        if (style.display === "none" || style.visibility === "hidden" || Number.parseFloat(style.opacity) <= 0) {
            return false;
        }
    }
    const rect = element.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0;
}
function isTriggerEnabled(element) {
    return element.getAttribute("aria-disabled") !== "true" && !("disabled" in element && element.disabled === true);
}
export function getFeedbackViewPath(element) {
    const viewPath = [];
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
export async function restoreFeedbackViews(viewPath) {
    let triggered = false;
    for (const viewKey of viewPath ?? []) {
        const view = queryPageSelector(getAttributeSelector(VIEW_ATTRIBUTE, viewKey));
        if (isHtmlElement(view) && isViewOpen(view)) {
            continue;
        }
        const trigger = queryPageSelectorAll(getAttributeSelector(OPEN_ATTRIBUTE, viewKey)).find((element) => isHtmlElement(element) && isTriggerEnabled(element));
        if (!isHtmlElement(trigger)) {
            continue;
        }
        trigger.click();
        triggered = true;
        await waitForTargetRevealResync();
    }
    return triggered;
}
//# sourceMappingURL=viewRestore.js.map