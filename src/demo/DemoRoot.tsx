"use client";

import { useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { ThemeScope } from "@/core/ThemeScope.js";
import type { ResolvedAppearance } from "@/shared/types/report-ui.js";

type DemoRootProps = {
    appearance: ResolvedAppearance;
    width: number;
    height: number;
    interactive: boolean;
    className: string;
    style?: CSSProperties;
    ariaLabel?: string;
    children: ReactNode;
};

export function DemoRoot({ appearance, width, height, interactive, className, style, ariaLabel, children }: DemoRootProps) {
    const hostRef = useRef<HTMLDivElement | null>(null);
    const [mount, setMount] = useState<HTMLElement | null>(null);

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
        void import("@/shared/styles/reportStylesheet.js").then(({ REPORT_STYLESHEET }) => {
            if (!cancelled) {
                styleElement.textContent = REPORT_STYLESHEET;
            }
        });

        return () => {
            cancelled = true;
            setMount(null);
            shadowRoot.replaceChildren();
        };
    }, []);

    return (
        <div
            ref={hostRef}
            className={className}
            role="group"
            aria-label={ariaLabel}
            style={{
                display: "block",
                width: "100%",
                maxWidth: width,
                height,
                overflow: "visible",
                pointerEvents: interactive ? "auto" : "none",
                ...style,
            }}
        >
            {mount
                ? createPortal(
                      <ThemeScope
                          appearance={appearance}
                          className="relative block h-full w-full overflow-visible"
                      >
                          {children}
                      </ThemeScope>,
                      mount,
                  )
                : null}
        </div>
    );
}
