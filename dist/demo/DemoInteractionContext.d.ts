import { type ReactNode } from "react";
import type { DemoInteraction, FivePixelsDemoScene } from "./types.js";
/** Showcase에서도 제한적 조작을 허용하는 장면 */
export declare const DEMO_GUIDED_SCENES: Set<"settings" | "notifications" | "feedback-list" | "memo-list" | "my-tasks" | "page-brief" | "project-health" | "marker-tooltip" | "feedback-composer" | "memo-composer" | "panel-overview" | "network-monitor" | "element-hover-inspect" | "element-inspector" | "device-preview" | "feedback-thread" | "settings-customization" | "settings-marker">;
type DemoInteractionValue = {
    interaction: DemoInteraction;
    scene: FivePixelsDemoScene;
    /** 전역 클릭 차단 (패널 탭 토글 등 방지) */
    inputLocked: boolean;
    /** 상태 변경 잠금 (알림 dismiss 등) */
    stateLocked: boolean;
    /** UI Edit 수치/텍스트/Before-After 허용 */
    probeEditable: boolean;
    /** 알림 접기/펼치기만 허용 (입력은 열려 있고 상태 변경은 잠금) */
    notificationFoldable: boolean;
};
export declare function DemoInteractionProvider({ interaction, scene, children, }: {
    interaction: DemoInteraction;
    scene: FivePixelsDemoScene;
    children: ReactNode;
}): import("react").JSX.Element;
export declare function useDemoInteractionValue(): DemoInteractionValue;
export declare function useDemoInteraction(): DemoInteraction;
/** 패널 탭·마커 토글 등 상태 고정 */
export declare function useDemoLocked(): boolean;
export declare function useDemoInputLocked(): boolean;
export declare function useDemoProbeEditable(): boolean;
export declare function useDemoNotificationFoldable(): boolean;
export {};
//# sourceMappingURL=DemoInteractionContext.d.ts.map