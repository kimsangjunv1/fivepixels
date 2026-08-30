import type { ReportMode } from "../types/report-ui.js";
type UseOverlayChromeArgs = {
    mode: ReportMode;
};
/**
 * Host-yield dimming for floating chrome (panel) when the user interacts with the host page.
 * Writes `data-fp-host-yield` on the shadow mount for CSS-driven dimming/peek.
 */
export declare function useOverlayChrome({ mode }: UseOverlayChromeArgs): void;
export {};
//# sourceMappingURL=useOverlayChrome.d.ts.map