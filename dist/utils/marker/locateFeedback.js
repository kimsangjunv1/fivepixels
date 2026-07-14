import { getFeedbackTargetSelector, isFeedbackTargetVisible } from "../shared/dom.js";
import { findElementByTargetSelector } from "./targetSelector.js";
export { isFeedbackTargetVisible } from "../shared/dom.js";
export const LOCATE_PULSE_DURATION_MS = 2400;
export const TARGET_REVEAL_RESYNC_DELAY_MS = 50;
export function getFeedbackTargetElement(report) {
    if (report.target_selector) {
        const bySelector = findElementByTargetSelector(report.target_selector);
        if (bySelector) {
            return bySelector;
        }
    }
    const selector = getFeedbackTargetSelector(report.report_id, report.report_type);
    return document.querySelector(selector);
}
export function getFeedbackAnchorElement(report) {
    const anchor = report.position.anchor;
    if (!anchor) {
        return null;
    }
    const selector = getFeedbackTargetSelector(anchor.reportId, anchor.reportType);
    return document.querySelector(selector);
}
export function isFeedbackTargetDetached(report) {
    const targetElement = getFeedbackTargetElement(report);
    if (!targetElement) {
        return true;
    }
    return !isFeedbackTargetVisible(targetElement);
}
export function waitForTargetRevealResync() {
    return new Promise((resolve) => {
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                window.setTimeout(() => resolve(), TARGET_REVEAL_RESYNC_DELAY_MS);
            });
        });
    });
}
export function scrollToFeedbackTarget(report) {
    const targetElement = getFeedbackTargetElement(report);
    if (targetElement) {
        targetElement.scrollIntoView({ block: "center", inline: "nearest", behavior: "smooth" });
        return { foundElement: true, targetElement };
    }
    const anchorElement = getFeedbackAnchorElement(report);
    if (anchorElement) {
        anchorElement.scrollIntoView({ block: "center", inline: "nearest", behavior: "smooth" });
        return { foundElement: true, targetElement: anchorElement };
    }
    window.scrollTo({ top: report.position.scrollY, behavior: "smooth" });
    return { foundElement: false, targetElement: null };
}
//# sourceMappingURL=locateFeedback.js.map