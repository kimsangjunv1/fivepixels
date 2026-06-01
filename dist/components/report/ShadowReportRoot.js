import { useLayoutEffect, useState } from "react";
import { createPortal } from "react-dom";
import { REPORT_STYLESHEET } from "../../styles/reportStylesheet.js";
const HOST_ID = "stitchable-root";
const STYLE_ELEMENT_ID = "stitchable-report-styles";
const MOUNT_ATTR = "data-stitchable-mount";
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
        style.textContent = REPORT_STYLESHEET;
        shadowRoot.append(style);
        const mount = document.createElement("div");
        mount.setAttribute(MOUNT_ATTR, "");
        mount.className = "";
        shadowRoot.append(mount);
    }
    const mount = shadowRoot.querySelector(`[${MOUNT_ATTR}]`);
    if (!mount) {
        throw new Error("Stitchable shadow mount element is missing.");
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
export function ShadowReportRoot({ appearance, children }) {
    const [mount, setMount] = useState(null);
    useLayoutEffect(() => {
        const host = getOrCreateShadowHost();
        applyReportStyles(host.shadowRoot, REPORT_STYLESHEET);
        setMount(host.mount);
        return () => {
            setMount(null);
        };
    }, []);
    useLayoutEffect(() => {
        if (!mount) {
            return;
        }
        mount.setAttribute("data-stitchable-theme", appearance);
    }, [appearance, mount]);
    if (!mount) {
        return null;
    }
    return createPortal(children, mount);
}
//# sourceMappingURL=ShadowReportRoot.js.map