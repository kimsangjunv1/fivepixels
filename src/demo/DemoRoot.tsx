"use client";

import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { ThemeScope } from "@/core/ThemeScope.js";
import type { ResolvedAppearance } from "@/shared/types/report-ui.js";
import type { DemoInteraction } from "./types.js";

type DemoRootProps = {
    appearance: ResolvedAppearance;
    width: number;
    height: number;
    interaction: DemoInteraction;
    interactive: boolean;
    className: string;
    style?: CSSProperties;
    ariaLabel?: string;
    children: ReactNode;
};

const SHOWCASE_BLOCKED_EVENTS = ["click", "auxclick", "dblclick", "pointerdown", "mousedown", "mouseup", "touchstart", "touchend"] as const;

export function DemoRoot({ appearance, width, height, interaction, interactive, className, style, ariaLabel, children }: DemoRootProps) {
    const hostRef = useRef<HTMLDivElement | null>(null);
    const [mount, setMount] = useState<HTMLElement | null>(null);
    const allowPointers = interactive !== false;
    const lockInput = allowPointers && interaction === "showcase";

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

    useEffect(() => {
        if (!mount || !lockInput) {
            return;
        }

        const block = (event: Event) => {
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

    return (
        <div
            ref={hostRef}
            className={className}
            role="group"
            aria-label={ariaLabel}
            data-fivepixels-demo-interaction={interaction}
            style={{
                display: "block",
                width,
                maxWidth: "100%",
                height,
                marginInline: "auto",
                overflow: "visible",
                pointerEvents: allowPointers ? "auto" : "none",
                ...style,
            }}
        >
            {mount
                ? createPortal(
                      <ThemeScope appearance={appearance} className="relative block h-full w-full overflow-visible">
                          {children}
                      </ThemeScope>,
                      mount,
                  )
                : null}
        </div>
    );
}
