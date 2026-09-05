import type { CSSProperties } from "react";
import type { ReportAppearance } from "@/shared/types/report.js";
import type { ReportLocale } from "@/shared/i18n/types.js";

export type DemoInteraction = "live" | "showcase";

export const FIVE_PIXELS_DEMO_SCENES = [
    "marker-tooltip",
    "feedback-composer",
    "memo-composer",
    "panel-overview",
    "network-monitor",
    "feedback-list",
    "memo-list",
    "page-brief",
    "my-tasks",
    "project-health",
    "element-hover-inspect",
    "element-inspector",
    "device-preview",
    "feedback-thread",
    "settings",
    "settings-customization",
    "settings-marker",
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
    /**
     * `showcase` (default): hover만 가능, 클릭/상태 변경 잠금.
     * `live`: 실제 제품처럼 조작 가능.
     */
    interaction?: DemoInteraction;
    /** @deprecated `interaction`을 사용하세요. false면 pointer-events none. */
    interactive?: boolean;
    className?: string;
    style?: CSSProperties;
    ariaLabel?: string;
};
