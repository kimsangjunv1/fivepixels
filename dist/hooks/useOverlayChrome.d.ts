import type { ReportMode } from "../types/report-ui.js";
type UseOverlayChromeArgs = {
    mode: ReportMode;
    panelCollapsed: boolean;
    setPanelCollapsed: (collapsed: boolean | ((current: boolean) => boolean)) => void;
    pinRailCollapsed: boolean;
    setPinRailCollapsed: (collapsed: boolean) => void;
    hasPins: boolean;
};
/**
 * Host-yield + idle auto-collapse for floating chrome (panel / pin).
 * Writes `data-fp-host-yield` on the shadow mount for CSS-driven dimming/peek.
 */
export declare function useOverlayChrome({ mode, panelCollapsed, setPanelCollapsed, pinRailCollapsed, setPinRailCollapsed, hasPins, }: UseOverlayChromeArgs): void;
export {};
//# sourceMappingURL=useOverlayChrome.d.ts.map