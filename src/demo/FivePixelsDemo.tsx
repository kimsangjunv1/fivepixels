"use client";

import { useState } from "react";
import type { ReportLocale } from "@/shared/i18n/types.js";
import { DemoRoot } from "./DemoRoot.js";
import { DemoScene } from "./DemoScenes.js";
import { DEMO_SCENE_SIZE, getDemoCopy } from "./fixtures.js";
import type { FivePixelsDemoProps } from "./types.js";

export function FivePixelsDemo({
    scene,
    locale,
    defaultLocale = "ko",
    onLocaleChange,
    showLocaleSwitch = false,
    appearance = "light",
    interactive = true,
    className = "",
    style,
    ariaLabel,
}: FivePixelsDemoProps) {
    const [uncontrolledLocale, setUncontrolledLocale] = useState<ReportLocale>(defaultLocale);
    const activeLocale = locale ?? uncontrolledLocale;
    const resolvedAppearance = appearance === "system" ? "light" : appearance;
    const copy = getDemoCopy(activeLocale);
    const size = DEMO_SCENE_SIZE[scene];

    const handleLocaleChange = (nextLocale: ReportLocale) => {
        if (locale === undefined) {
            setUncontrolledLocale(nextLocale);
        }
        onLocaleChange?.(nextLocale);
    };

    return (
        <DemoRoot
            appearance={resolvedAppearance}
            width={size.width}
            height={size.height}
            interactive={interactive}
            className={className}
            style={style}
            ariaLabel={ariaLabel ?? `FivePixels ${scene} demo`}
        >
            {showLocaleSwitch ? (
                <div className="pointer-events-auto absolute right-[4px] top-[4px] z-[20] flex rounded-full border border-[var(--adaptive-border-subtle)] bg-[var(--adaptive-fillOpacity700)] p-[2px] shadow-sm backdrop-blur-[16px]" role="group" aria-label={copy.localeLabel}>
                    {(["ko", "en"] as const).map((option) => (
                        <button
                            key={option}
                            type="button"
                            aria-pressed={activeLocale === option}
                            onClick={() => handleLocaleChange(option)}
                            className={`rounded-full px-[8px] py-[4px] text-[10px] ${
                                activeLocale === option
                                    ? "bg-[var(--adaptive-black900)] text-[var(--adaptive-surface)]"
                                    : "text-[var(--adaptive-black500)]"
                            }`}
                        >
                            {option.toUpperCase()}
                        </button>
                    ))}
                </div>
            ) : null}
            <DemoScene scene={scene} locale={activeLocale} copy={copy} />
        </DemoRoot>
    );
}
