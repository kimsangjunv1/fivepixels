import type { ReactNode } from "react";
import type { ReportPanelTab } from "../../shared/types/report-ui.js";
type PanelContentProps = {
    activeTab: ReportPanelTab | null;
    blocked: boolean;
    showFeedbackList: boolean;
    settings: ReactNode;
    command: ReactNode;
};
/** Exhaustive panel content router. Start here when tracing a panel tab. */
export declare function PanelContent({ activeTab, blocked, showFeedbackList, settings, command }: PanelContentProps): string | number | boolean | Iterable<ReactNode> | import("react").JSX.Element | null | undefined;
export {};
//# sourceMappingURL=PanelContent.d.ts.map