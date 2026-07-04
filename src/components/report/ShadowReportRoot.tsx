import { useLayoutEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import type { ResolvedAppearance } from "@/types/report-ui.js";
import { ensureReportTooltipLayer, syncReportTooltipLayerTheme } from "@/utils/dom.js";

const HOST_ID = "fivepixels-root";
const STYLE_ELEMENT_ID = "fivepixels-report-styles";
const MOUNT_ATTR = "data-fivepixels-mount";

type ShadowHost = {
    mount: HTMLElement;
    shadowRoot: ShadowRoot;
};

function getOrCreateShadowHost(): ShadowHost {
    let host = document.getElementById(HOST_ID) as HTMLDivElement | null;

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

    const mount = shadowRoot.querySelector(`[${MOUNT_ATTR}]`) as HTMLElement | null;

    if (!mount) {
        throw new Error("Fivepixels shadow mount element is missing.");
    }

    return { mount, shadowRoot };
}

function applyReportStyles(shadowRoot: ShadowRoot, stylesheet: string) {
    let style = shadowRoot.getElementById(STYLE_ELEMENT_ID) as HTMLStyleElement | null;

    if (!style) {
        style = document.createElement("style");
        style.id = STYLE_ELEMENT_ID;
        shadowRoot.prepend(style);
    }

    style.textContent = stylesheet;
}

type ReportStylesheetModule = typeof import("../../styles/reportStylesheet.js");
type ViteHot = {
    accept(deps: string, callback: (module: ReportStylesheetModule) => void): void;
};

const hot = (import.meta as ImportMeta & { hot?: ViteHot }).hot;
hot?.accept("../../styles/reportStylesheet.js", (module) => {
    if (!module) {
        return;
    }

    const host = document.getElementById(HOST_ID)?.shadowRoot;
    if (host) {
        applyReportStyles(host, module.REPORT_STYLESHEET);
    }
});

type ShadowReportRootProps = {
    panelAppearance: ResolvedAppearance;
    children: ReactNode;
};

export function ShadowReportRoot({ panelAppearance, children }: ShadowReportRootProps) {
    const [mount, setMount] = useState<HTMLElement | null>(null);

    useLayoutEffect(() => {
        let cancelled = false;
        const host = getOrCreateShadowHost();
        ensureReportTooltipLayer();
        setMount(host.mount);

        void import("@/styles/reportStylesheet.js").then((module) => {
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
