import type { FivePixelsAdapter } from "../shared/types/adapter.js";
import type { NotificationItem } from "../shared/types/notification.js";
import type { ApiFlowEntry } from "../shared/types/networkMonitor.js";
import type { DraftReport, PickProbeValues, TargetSnapshot } from "../shared/types/report-ui.js";
import type { ReportAuthor, ReportFeedback } from "../shared/types/report.js";
import type { FivePixelsDemoScene } from "./types.js";
export declare const DEMO_AUTHORS: ReportAuthor[];
/** 리스트/툴팁용 대표 케이스 (짧은 목록) */
export declare const DEMO_FEATURED_REPORTS: ReportFeedback[];
/** 패널 수치·활동용 전체 리포트 (대표 + 활동 벌크) */
export declare const DEMO_REPORTS: ReportFeedback[];
export declare const DEMO_DRAFT: DraftReport;
export declare const DEMO_MEMO_DRAFT: DraftReport;
export declare const DEMO_TARGET: TargetSnapshot;
export declare const DEMO_PROBE_VALUES: PickProbeValues;
export declare const DEMO_API_FLOW_ENTRIES: ApiFlowEntry[];
export declare function createDemoNotifications(locale: "ko" | "en"): NotificationItem[];
export declare function createDemoAdapter(): FivePixelsAdapter;
export declare const DEMO_SCENE_SIZE: Record<FivePixelsDemoScene, {
    width: number;
    height: number;
}>;
//# sourceMappingURL=fixtures.d.ts.map