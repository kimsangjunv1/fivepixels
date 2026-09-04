import type { FivePixelsAdapter } from "../shared/types/adapter.js";
import type { NotificationItem } from "../shared/types/notification.js";
import type { DraftReport, PickProbeValues, TargetSnapshot } from "../shared/types/report-ui.js";
import type { ReportAuthor, ReportFeedback } from "../shared/types/report.js";
import type { FivePixelsDemoScene } from "./types.js";
export declare const DEMO_AUTHORS: ReportAuthor[];
export declare const DEMO_REPORTS: ReportFeedback[];
export declare const DEMO_DRAFT: DraftReport;
export declare const DEMO_TARGET: TargetSnapshot;
export declare const DEMO_PROBE_VALUES: PickProbeValues;
export declare function createDemoNotifications(locale: "ko" | "en"): NotificationItem[];
export declare function createDemoAdapter(): FivePixelsAdapter;
export declare const DEMO_SCENE_SIZE: Record<FivePixelsDemoScene, {
    width: number;
    height: number;
}>;
//# sourceMappingURL=fixtures.d.ts.map