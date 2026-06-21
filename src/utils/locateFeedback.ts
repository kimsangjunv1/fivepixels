import type { ReportFeedback } from "@/types/report.js";
import { getFeedbackTargetSelector } from "./dom.js";

export const LOCATE_PULSE_DURATION_MS = 2400;

export function getFeedbackTargetElement(report: Pick<ReportFeedback, "report_id" | "report_type">) {
    const selector = getFeedbackTargetSelector(report.report_id, report.report_type);

    return document.querySelector<HTMLElement>(selector);
}

export function scrollToFeedbackTarget(report: Pick<ReportFeedback, "report_id" | "report_type" | "scroll_y">) {
    const targetElement = getFeedbackTargetElement(report);

    if (targetElement) {
        targetElement.scrollIntoView({ block: "center", inline: "nearest", behavior: "smooth" });
        return { foundElement: true as const, targetElement };
    }

    window.scrollTo({ top: report.scroll_y, behavior: "smooth" });
    return { foundElement: false as const, targetElement: null };
}
