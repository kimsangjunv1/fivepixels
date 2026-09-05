"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { DemoInteractionProvider } from "./DemoInteractionContext.js";
import { DemoRoot } from "./DemoRoot.js";
import { DemoRuntime } from "./DemoRuntime.js";
import { DemoScene } from "./DemoScenes.js";
import { DEMO_SCENE_SIZE } from "./fixtures.js";
function resolveInteraction(interaction, interactive) {
    if (interactive === false) {
        return "showcase";
    }
    return interaction ?? "showcase";
}
export function FivePixelsDemo({ scene, locale, defaultLocale = "ko", onLocaleChange, showLocaleSwitch = false, appearance = "light", interaction, interactive = true, className = "", style, ariaLabel, }) {
    const [uncontrolledLocale, setUncontrolledLocale] = useState(defaultLocale);
    const activeLocale = locale ?? uncontrolledLocale;
    const resolvedAppearance = appearance === "system" ? "light" : appearance;
    const resolvedInteraction = resolveInteraction(interaction, interactive);
    const size = DEMO_SCENE_SIZE[scene];
    const localeSwitchHeight = showLocaleSwitch ? 36 : 0;
    const handleLocaleChange = (nextLocale) => {
        if (locale === undefined) {
            setUncontrolledLocale(nextLocale);
        }
        onLocaleChange?.(nextLocale);
    };
    return (_jsx(DemoRuntime, { scene: scene, locale: activeLocale, appearance: resolvedAppearance, children: _jsx(DemoInteractionProvider, { interaction: resolvedInteraction, children: _jsxs(DemoRoot, { appearance: resolvedAppearance, width: size.width, height: size.height + localeSwitchHeight, interaction: resolvedInteraction, interactive: interactive, className: className, style: style, ariaLabel: ariaLabel ?? `FivePixels ${scene} demo`, children: [showLocaleSwitch ? (_jsx("div", { className: "pointer-events-auto absolute right-0 top-0 z-[20] flex rounded-full border border-[var(--adaptive-border-subtle)] bg-[var(--adaptive-fillOpacity700)] p-[2px] shadow-sm backdrop-blur-[16px]", role: "group", "aria-label": activeLocale === "ko" ? "데모 언어" : "Demo language", children: ["ko", "en"].map((option) => (_jsx("button", { type: "button", "aria-pressed": activeLocale === option, onClick: () => handleLocaleChange(option), className: `rounded-full px-[8px] py-[4px] text-[12px] ${activeLocale === option ? "bg-[var(--adaptive-black900)] text-[var(--adaptive-surface)]" : "text-[var(--adaptive-black500)]"}`, children: option.toUpperCase() }, option))) })) : null, _jsx("div", { className: "absolute inset-x-0 bottom-0", style: { height: size.height }, children: _jsx(DemoScene, { scene: scene }) })] }) }) }));
}
//# sourceMappingURL=FivePixelsDemo.js.map