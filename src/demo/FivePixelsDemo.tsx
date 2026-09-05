"use client";

import { useState, type ComponentProps } from "react";
import type { ReportLocale } from "@/shared/i18n/types.js";
import { DemoInteractionProvider, useDemoInputLocked } from "./DemoInteractionContext.js";
import { DemoRoot } from "./DemoRoot.js";
import { DemoRuntime } from "./DemoRuntime.js";
import { DemoScene } from "./DemoScenes.js";
import { DEMO_SCENE_SIZE } from "./fixtures.js";
import type { DemoInteraction, FivePixelsDemoProps } from "./types.js";

function resolveInteraction(interaction: DemoInteraction | undefined, interactive: boolean | undefined): DemoInteraction {
    if (interactive === false) {
        return "showcase";
    }
    return interaction ?? "showcase";
}

function DemoRootWithLock(props: Omit<ComponentProps<typeof DemoRoot>, "inputLocked">) {
    const inputLocked = useDemoInputLocked();
    return (
        <DemoRoot
            {...props}
            inputLocked={inputLocked}
        />
    );
}

export function FivePixelsDemo({
    scene,
    locale,
    defaultLocale = "ko",
    onLocaleChange,
    showLocaleSwitch = false,
    appearance = "light",
    interaction,
    interactive = true,
    className = "",
    style,
    ariaLabel,
}: FivePixelsDemoProps) {
    const [uncontrolledLocale, setUncontrolledLocale] = useState<ReportLocale>(defaultLocale);
    const activeLocale = locale ?? uncontrolledLocale;
    const resolvedAppearance = appearance === "system" ? "light" : appearance;
    const resolvedInteraction = resolveInteraction(interaction, interactive);
    const size = DEMO_SCENE_SIZE[scene];
    const localeSwitchHeight = showLocaleSwitch ? 36 : 0;

    const handleLocaleChange = (nextLocale: ReportLocale) => {
        if (locale === undefined) {
            setUncontrolledLocale(nextLocale);
        }
        onLocaleChange?.(nextLocale);
    };

    return (
        <DemoRuntime
            scene={scene}
            locale={activeLocale}
            appearance={resolvedAppearance}
        >
            <DemoInteractionProvider
                interaction={resolvedInteraction}
                scene={scene}
            >
                <DemoRootWithLock
                    appearance={resolvedAppearance}
                    width={size.width}
                    height={size.height + localeSwitchHeight}
                    interaction={resolvedInteraction}
                    interactive={interactive}
                    className={className}
                    style={style}
                    ariaLabel={ariaLabel ?? `FivePixels ${scene} demo`}
                >
                    {showLocaleSwitch ? (
                        <div
                            className="pointer-events-auto absolute right-0 top-0 z-[20] flex rounded-full border border-[var(--adaptive-border-subtle)] bg-[var(--adaptive-fillOpacity700)] p-[2px] shadow-sm backdrop-blur-[16px]"
                            role="group"
                            aria-label={activeLocale === "ko" ? "데모 언어" : "Demo language"}
                        >
                            {(["ko", "en"] as const).map((option) => (
                                <button
                                    key={option}
                                    type="button"
                                    aria-pressed={activeLocale === option}
                                    onClick={() => handleLocaleChange(option)}
                                    className={`rounded-full px-[8px] py-[4px] text-[12px] ${
                                        activeLocale === option ? "bg-[var(--adaptive-black900)] text-[var(--adaptive-surface)]" : "text-[var(--adaptive-black500)]"
                                    }`}
                                >
                                    {option.toUpperCase()}
                                </button>
                            ))}
                        </div>
                    ) : null}
                    <div
                        className="absolute inset-x-0 bottom-0"
                        style={{ height: size.height }}
                    >
                        <DemoScene scene={scene} />
                    </div>
                </DemoRootWithLock>
            </DemoInteractionProvider>
        </DemoRuntime>
    );
}
