import type { ReportFeedback } from "@/types/report.js";
import { getFeedbackTargetSelector, isFeedbackTargetVisible } from "./dom.js";

export { isFeedbackTargetVisible } from "./dom.js";

export const LOCATE_PULSE_DURATION_MS = 2400;
export const TARGET_REVEAL_RESYNC_DELAY_MS = 50;

export function getFeedbackTargetElement(report: Pick<ReportFeedback, "report_id" | "report_type">) {
    const selector = getFeedbackTargetSelector(report.report_id, report.report_type);

    return document.querySelector<HTMLElement>(selector);
}

export function getFeedbackAnchorElement(report: Pick<ReportFeedback, "anchor_report_id" | "anchor_report_type">) {
    if (!report.anchor_report_id || !report.anchor_report_type) {
        return null;
    }

    const selector = getFeedbackTargetSelector(report.anchor_report_id, report.anchor_report_type);

    return document.querySelector<HTMLElement>(selector);
}

export function isFeedbackTargetDetached(report: Pick<ReportFeedback, "report_id" | "report_type">) {
    const targetElement = getFeedbackTargetElement(report);

    if (!targetElement) {
        return true;
    }

    return !isFeedbackTargetVisible(targetElement);
}

export function waitForTargetRevealResync() {
    return new Promise<void>((resolve) => {
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                window.setTimeout(() => resolve(), TARGET_REVEAL_RESYNC_DELAY_MS);
            });
        });
    });
}

export function scrollToFeedbackTarget(report: Pick<ReportFeedback, "report_id" | "report_type" | "scroll_y" | "anchor_report_id" | "anchor_report_type">) {
    const targetElement = getFeedbackTargetElement(report);

    if (targetElement) {
        targetElement.scrollIntoView({ block: "center", inline: "nearest", behavior: "smooth" });
        return { foundElement: true as const, targetElement };
    }

    const anchorElement = getFeedbackAnchorElement(report);

    if (anchorElement) {
        anchorElement.scrollIntoView({ block: "center", inline: "nearest", behavior: "smooth" });
        return { foundElement: true as const, targetElement: anchorElement };
    }

    window.scrollTo({ top: report.scroll_y, behavior: "smooth" });
    return { foundElement: false as const, targetElement: null };
}
