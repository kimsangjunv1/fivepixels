import { type ReactNode } from "react";
import type { ReportLocale } from "../shared/i18n/types.js";
import type { ResolvedAppearance } from "../shared/types/report-ui.js";
import type { FivePixelsDemoScene } from "./types.js";
type DemoRuntimeProps = {
    scene: FivePixelsDemoScene;
    locale: ReportLocale;
    appearance: ResolvedAppearance;
    children: ReactNode;
};
export declare function DemoRuntime({ scene, locale, appearance, children }: DemoRuntimeProps): import("react").JSX.Element;
export {};
//# sourceMappingURL=DemoRuntime.d.ts.map