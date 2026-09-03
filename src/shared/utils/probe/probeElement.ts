import type { ReportTargetType } from "@/shared/types/report.js";
import { getFeedbackTargetSelector } from "../marker/targetDom.js";
import { findElementByTargetSelector } from "../marker/targetSelector.js";
import { isHtmlElement, queryPageSelector } from "../overlay/pageDocumentBridge.js";

export function findElementByProbeKey(elementKey: string) {
    if (elementKey.startsWith("id:")) {
        const [, reportId, reportType] = elementKey.split(":");

        if (!reportId || !reportType) {
            return null;
        }

        const element = queryPageSelector(getFeedbackTargetSelector(reportId, reportType as ReportTargetType));
        return isHtmlElement(element) ? element : null;
    }

    if (elementKey.startsWith("selector:")) {
        return findElementByTargetSelector(elementKey.slice("selector:".length));
    }

    return null;
}
