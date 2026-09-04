import { getFeedbackTargetSelector } from "../marker/targetDom.js";
import { findElementByTargetSelector } from "../marker/targetSelector.js";
import { getPageDocument, isHtmlElement, queryPageSelector } from "../overlay/pageDocumentBridge.js";
/** Fallback for demo/report mounts that live inside open shadow roots. */
function queryInFivePixelsMounts(selector) {
    try {
        for (const host of getPageDocument().querySelectorAll("*")) {
            const shadowRoot = host.shadowRoot;
            if (!shadowRoot) {
                continue;
            }
            const mount = shadowRoot.querySelector("[data-fivepixels-mount]");
            if (!mount) {
                continue;
            }
            const match = mount.querySelector(selector);
            if (match) {
                return match;
            }
        }
    }
    catch {
        return null;
    }
    return null;
}
export function findElementByProbeKey(elementKey) {
    if (elementKey.startsWith("id:")) {
        const [, reportId, reportType] = elementKey.split(":");
        if (!reportId || !reportType) {
            return null;
        }
        const selector = getFeedbackTargetSelector(reportId, reportType);
        const element = queryPageSelector(selector) ?? queryInFivePixelsMounts(selector);
        return isHtmlElement(element) ? element : null;
    }
    if (elementKey.startsWith("selector:")) {
        const selector = elementKey.slice("selector:".length);
        const element = findElementByTargetSelector(selector) ?? queryInFivePixelsMounts(selector);
        return isHtmlElement(element) ? element : null;
    }
    return null;
}
//# sourceMappingURL=probeElement.js.map