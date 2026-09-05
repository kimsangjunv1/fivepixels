"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ThemeScope } from "../core/ThemeScope.js";
import { ReportOverlayRootProvider } from "../shared/providers/ReportOverlayRootContext.js";
const SHOWCASE_BLOCKED_EVENTS = ["click", "auxclick", "dblclick", "pointerdown", "mousedown", "mouseup", "touchstart", "touchend"];
export function DemoRoot({ appearance, width, height, interaction, inputLocked, interactive, className, style, ariaLabel, children }) {
    const hostRef = useRef(null);
    const [mount, setMount] = useState(null);
    const [overlayRoot, setOverlayRoot] = useState(null);
    const allowPointers = interactive !== false;
    const lockInput = allowPointers && inputLocked;
    useLayoutEffect(() => {
        const host = hostRef.current;
        if (!host) {
            return;
        }
        const shadowRoot = host.shadowRoot ?? host.attachShadow({ mode: "open" });
        const styleElement = document.createElement("style");
        const mountElement = document.createElement("div");
        styleElement.dataset.fivepixelsDemoStyles = "";
        mountElement.dataset.fivepixelsMount = "";
        mountElement.style.cssText = "position:relative;inset:auto;width:100%;height:100%;overflow:visible;pointer-events:auto;";
        shadowRoot.replaceChildren(styleElement, mountElement);
        setMount(mountElement);
        let cancelled = false;
        void import("../shared/styles/reportStylesheet.js").then(({ REPORT_STYLESHEET }) => {
            if (!cancelled) {
                styleElement.textContent = REPORT_STYLESHEET;
            }
        });
        return () => {
            cancelled = true;
            setMount(null);
            setOverlayRoot(null);
            shadowRoot.replaceChildren();
        };
    }, []);
    useEffect(() => {
        if (!mount || !lockInput) {
            return;
        }
        const block = (event) => {
            event.preventDefault();
            event.stopPropagation();
        };
        for (const type of SHOWCASE_BLOCKED_EVENTS) {
            mount.addEventListener(type, block, true);
        }
        return () => {
            for (const type of SHOWCASE_BLOCKED_EVENTS) {
                mount.removeEventListener(type, block, true);
            }
        };
    }, [lockInput, mount]);
    return (_jsx("div", { ref: hostRef, className: className, role: "group", "aria-label": ariaLabel, "data-fivepixels-demo-interaction": interaction, "data-fivepixels-demo-input-locked": lockInput ? "true" : "false", style: {
            display: "block",
            width,
            maxWidth: "100%",
            height,
            marginInline: "auto",
            overflow: "visible",
            pointerEvents: allowPointers ? "auto" : "none",
            ...style,
        }, children: mount
            ? createPortal(_jsx(ThemeScope, { appearance: appearance, className: "relative block h-full w-full overflow-visible", children: _jsxs(ReportOverlayRootProvider, { root: overlayRoot, children: [children, _jsx("div", { ref: setOverlayRoot, "data-fivepixels-tooltip-layer": "", className: "pointer-events-none absolute inset-0 z-[2147483646] overflow-visible", "aria-hidden": "true" })] }) }), mount)
            : null }));
}
//# sourceMappingURL=DemoRoot.js.map