import { useLayoutEffect, useState } from "react";
import { createPortal } from "react-dom";
import { ensureReportTooltipLayer, syncReportTooltipLayerTheme } from "../../utils/dom.js";
const HOST_ID = "fivepixels-root";
const STYLE_ELEMENT_ID = "fivepixels-report-styles";
const MOUNT_ATTR = "data-fivepixels-mount";
function getOrCreateShadowHost() {
    let host = document.getElementById(HOST_ID);
    if (!host) {
        host = document.createElement("div");
        host.id = HOST_ID;
        host.style.cssText = "position:fixed;inset:0;z-index:2147483646;pointer-events:none;";
        document.body.append(host);
    }
    let shadowRoot = host.shadowRoot;
    if (!shadowRoot) {
        shadowRoot = host.attachShadow({ mode: "open" });
        const style = document.createElement("style");
        style.id = STYLE_ELEMENT_ID;
        shadowRoot.append(style);
        const mount = document.createElement("div");
        mount.setAttribute(MOUNT_ATTR, "");
        mount.className = "";
        shadowRoot.append(mount);
    }
    const mount = shadowRoot.querySelector(`[${MOUNT_ATTR}]`);
    if (!mount) {
        throw new Error("Fivepixels shadow mount element is missing.");
    }
    return { mount, shadowRoot };
}
function applyReportStyles(shadowRoot, stylesheet) {
    let style = shadowRoot.getElementById(STYLE_ELEMENT_ID);
    if (!style) {
        style = document.createElement("style");
        style.id = STYLE_ELEMENT_ID;
        shadowRoot.prepend(style);
    }
    style.textContent = stylesheet;
}
const hot = import.meta.hot;
hot?.accept("../../styles/reportStylesheet.js", (module) => {
    if (!module) {
        return;
    }
    const host = document.getElementById(HOST_ID)?.shadowRoot;
    if (host) {
        applyReportStyles(host, module.REPORT_STYLESHEET);
    }
});
export function ShadowReportRoot({ panelAppearance, children }) {
    const [mount, setMount] = useState(null);
    useLayoutEffect(() => {
        let cancelled = false;
        const host = getOrCreateShadowHost();
        ensureReportTooltipLayer();
        setMount(host.mount);
        void import("../../styles/reportStylesheet.js").then((module) => {
            if (cancelled) {
                return;
            }
            applyReportStyles(host.shadowRoot, module.REPORT_STYLESHEET);
        });
        return () => {
            cancelled = true;
            setMount(null);
        };
    }, []);
    useLayoutEffect(() => {
        syncReportTooltipLayerTheme(panelAppearance);
    }, [panelAppearance]);
    if (!mount) {
        return null;
    }
    return createPortal(children, mount);
}
//# sourceMappingURL=ShadowReportRoot.js.map