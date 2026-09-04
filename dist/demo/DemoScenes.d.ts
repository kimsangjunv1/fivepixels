import type { ReportLocale } from "../shared/i18n/types.js";
import type { DemoCopy } from "./fixtures.js";
import type { FivePixelsDemoScene } from "./types.js";
type DemoSceneProps = {
    scene: FivePixelsDemoScene;
    locale: ReportLocale;
    copy: DemoCopy;
};
export declare function DemoScene({ scene, locale, copy }: DemoSceneProps): import("react").JSX.Element;
export {};
//# sourceMappingURL=DemoScenes.d.ts.map