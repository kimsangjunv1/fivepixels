"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { DemoInteraction, FivePixelsDemoScene } from "./types.js";

/** Showcase에서도 제한적 조작을 허용하는 장면 */
export const DEMO_GUIDED_SCENES = new Set<FivePixelsDemoScene>(["notifications", "element-inspector"]);

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

const DemoInteractionContext = createContext<DemoInteractionValue>({
    interaction: "showcase",
    scene: "panel-overview",
    inputLocked: true,
    stateLocked: true,
    probeEditable: false,
    notificationFoldable: false,
});

export function DemoInteractionProvider({
    interaction,
    scene,
    children,
}: {
    interaction: DemoInteraction;
    scene: FivePixelsDemoScene;
    children: ReactNode;
}) {
    const showcase = interaction === "showcase";
    const guided = showcase && DEMO_GUIDED_SCENES.has(scene);
    const value: DemoInteractionValue = {
        interaction,
        scene,
        inputLocked: showcase && !guided,
        stateLocked: showcase,
        probeEditable: !showcase || scene === "element-inspector",
        notificationFoldable: !showcase || scene === "notifications",
    };

    return <DemoInteractionContext.Provider value={value}>{children}</DemoInteractionContext.Provider>;
}

export function useDemoInteractionValue(): DemoInteractionValue {
    return useContext(DemoInteractionContext);
}

export function useDemoInteraction(): DemoInteraction {
    return useContext(DemoInteractionContext).interaction;
}

/** 패널 탭·마커 토글 등 상태 고정 */
export function useDemoLocked(): boolean {
    return useContext(DemoInteractionContext).stateLocked;
}

export function useDemoInputLocked(): boolean {
    return useContext(DemoInteractionContext).inputLocked;
}

export function useDemoProbeEditable(): boolean {
    return useContext(DemoInteractionContext).probeEditable;
}

export function useDemoNotificationFoldable(): boolean {
    return useContext(DemoInteractionContext).notificationFoldable;
}
