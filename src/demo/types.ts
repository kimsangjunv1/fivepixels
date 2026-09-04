import type { CSSProperties } from "react";
import type { ReportAppearance } from "@/shared/types/report.js";
import type { ReportLocale } from "@/shared/i18n/types.js";

export const FIVE_PIXELS_DEMO_SCENES = [
    "marker-tooltip",
    "feedback-composer",
    "memo-composer",
    "panel-overview",
    "network-monitor",
    "memo-list",
    "element-inspector",
    "device-preview",
    "feedback-thread",
    "settings",
    "settings-customization",
    "notifications",
] as const;

export type FivePixelsDemoScene = (typeof FIVE_PIXELS_DEMO_SCENES)[number];

export type FivePixelsDemoProps = {
    scene: FivePixelsDemoScene;
    locale?: ReportLocale;
    defaultLocale?: ReportLocale;
    onLocaleChange?: (locale: ReportLocale) => void;
    showLocaleSwitch?: boolean;
    appearance?: ReportAppearance;
    interactive?: boolean;
    className?: string;
    style?: CSSProperties;
    ariaLabel?: string;
};
