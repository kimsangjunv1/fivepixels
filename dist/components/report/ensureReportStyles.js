import { REPORT_STYLESHEET } from "./reportStylesheet.js";
const STYLE_ELEMENT_ID = "stitchable-report-styles";
function applyReportStyles(stylesheet) {
    if (typeof document === "undefined") {
        return;
    }
    let style = document.getElementById(STYLE_ELEMENT_ID);
    if (!style) {
        style = document.createElement("style");
        style.id = STYLE_ELEMENT_ID;
        document.head.append(style);
    }
    style.textContent = stylesheet;
}
export function ensureReportStyles() {
    applyReportStyles(REPORT_STYLESHEET);
}
const hot = import.meta.hot;
hot?.accept("./reportStylesheet.js", (module) => {
    if (!module) {
        return;
    }
    applyReportStyles(module.REPORT_STYLESHEET);
});
//# sourceMappingURL=ensureReportStyles.js.map