import { REPORT_STYLESHEET } from "./reportStylesheet.js";

const STYLE_ELEMENT_ID = "stitchable-report-styles";

function applyReportStyles(stylesheet: string) {
    if (typeof document === "undefined") {
        return;
    }

    let style = document.getElementById(STYLE_ELEMENT_ID) as HTMLStyleElement | null;
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

type ReportStylesheetModule = typeof import("./reportStylesheet.js");
type ViteHot = {
    accept(deps: string, callback: (module: ReportStylesheetModule) => void): void;
};

const hot = (import.meta as ImportMeta & { hot?: ViteHot }).hot;
hot?.accept("./reportStylesheet.js", (module) => {
    if (!module) {
        return;
    }

    applyReportStyles(module.REPORT_STYLESHEET);
});
