import { getFeedbackTargetSelector, isFeedbackTargetVisible } from "./dom.js";
export { isFeedbackTargetVisible } from "./dom.js";
export const LOCATE_PULSE_DURATION_MS = 2400;
export const TARGET_REVEAL_RESYNC_DELAY_MS = 50;
export function getFeedbackTargetElement(report) {
    const selector = getFeedbackTargetSelector(report.report_id, report.report_type);
    return document.querySelector(selector);
}
export function getFeedbackAnchorElement(report) {
    if (!report.anchor_report_id || !report.anchor_report_type) {
        return null;
    }
    const selector = getFeedbackTargetSelector(report.anchor_report_id, report.anchor_report_type);
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
    window.scrollTo({ top: report.scroll_y, behavior: "smooth" });
    return { foundElement: false, targetElement: null };
}
//# sourceMappingURL=locateFeedback.js.map