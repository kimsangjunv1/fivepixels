"use client";
import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext } from "react";
/** Showcase에서도 제한적 조작을 허용하는 장면 */
export const DEMO_GUIDED_SCENES = new Set(["notifications", "element-inspector"]);
const DemoInteractionContext = createContext({
    interaction: "showcase",
    scene: "panel-overview",
    inputLocked: true,
    stateLocked: true,
    probeEditable: false,
    notificationFoldable: false,
});
export function DemoInteractionProvider({ interaction, scene, children, }) {
    const showcase = interaction === "showcase";
    const guided = showcase && DEMO_GUIDED_SCENES.has(scene);
    const value = {
        interaction,
        scene,
        inputLocked: showcase && !guided,
        stateLocked: showcase,
        probeEditable: !showcase || scene === "element-inspector",
        notificationFoldable: !showcase || scene === "notifications",
    };
    return _jsx(DemoInteractionContext.Provider, { value: value, children: children });
}
export function useDemoInteractionValue() {
    return useContext(DemoInteractionContext);
}
export function useDemoInteraction() {
    return useContext(DemoInteractionContext).interaction;
}
/** 패널 탭·마커 토글 등 상태 고정 */
export function useDemoLocked() {
    return useContext(DemoInteractionContext).stateLocked;
}
export function useDemoInputLocked() {
    return useContext(DemoInteractionContext).inputLocked;
}
export function useDemoProbeEditable() {
    return useContext(DemoInteractionContext).probeEditable;
}
export function useDemoNotificationFoldable() {
    return useContext(DemoInteractionContext).notificationFoldable;
}
//# sourceMappingURL=DemoInteractionContext.js.map