import type { PanelView } from "../../hooks/useReportState.js";
type PanelKeyGateMode = Extract<PanelView, "setup-complete" | "key-issue">;
export declare function PanelKeyGate({ mode }: {
    mode: PanelKeyGateMode;
}): import("react").JSX.Element;
export {};
//# sourceMappingURL=PanelKeyGate.d.ts.map