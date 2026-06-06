import { TARGET_SELECTOR } from "../constants/report.js";
import { escapeAttribute } from "./dom.js";
export const LOCATE_PULSE_DURATION_MS = 2400;
export function getFeedbackTargetElement(report) {
    const selector = `${TARGET_SELECTOR}[data-report-id="${escapeAttribute(report.report_id)}"][data-report-type="${report.report_type}"]`;
    return document.querySelector(selector);
}
export function scrollToFeedbackTarget(report) {
    const targetElement = getFeedbackTargetElement(report);
    if (targetElement) {
        targetElement.scrollIntoView({ block: "center", inline: "nearest", behavior: "smooth" });
        return { foundElement: true, targetElement };
    }
    window.scrollTo({ top: report.scroll_y, behavior: "smooth" });
    return { foundElement: false, targetElement: null };
}
//# sourceMappingURL=locateFeedback.js.map