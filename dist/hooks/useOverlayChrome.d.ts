import type { ReportMode } from "../types/report-ui.js";
type UseOverlayChromeArgs = {
    mode: ReportMode;
    panelCollapsed: boolean;
    setPanelCollapsed: (collapsed: boolean | ((current: boolean) => boolean)) => void;
};
/**
 * Host-yield + idle auto-collapse for floating chrome (panel).
 * Writes `data-fp-host-yield` on the shadow mount for CSS-driven dimming/peek.
 */
export declare function useOverlayChrome({ mode, panelCollapsed, setPanelCollapsed }: UseOverlayChromeArgs): void;
export {};
//# sourceMappingURL=useOverlayChrome.d.ts.map