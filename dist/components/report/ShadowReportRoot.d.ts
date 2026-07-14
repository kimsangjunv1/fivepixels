import { type ReactNode } from "react";
import type { ResolvedAppearance } from "../../types/report-ui.js";
type ShadowReportRootProps = {
    panelAppearance: ResolvedAppearance;
    children: ReactNode;
};
export declare function ShadowReportRoot({ panelAppearance, children }: ShadowReportRootProps): import("react").ReactPortal | null;
export {};
//# sourceMappingURL=ShadowReportRoot.d.ts.map