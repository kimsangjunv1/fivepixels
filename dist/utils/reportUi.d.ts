import type { ReportUi } from "../types/report.js";
export type ResolvedReportUi = {
    appearance: NonNullable<ReportUi["appearance"]>;
    showFeedbackList: boolean;
    visibleShortcutKeys: boolean;
    shortcut?: string;
};
export type ResolveReportUiOptions = {
    ui?: ReportUi;
    /** @deprecated Use `ui.appearance`. */
    appearance?: ReportUi["appearance"];
    /** @deprecated Use `ui.showFeedbackList`. */
    showFeedbackList?: boolean;
    /** @deprecated Use `ui.visibleShortcutKeys`. */
    visibleShortcutKeys?: boolean;
    /** @deprecated Use `ui.shortcut`. */
    shortcut?: string;
};
export declare function resolveReportUi({ ui, appearance, showFeedbackList, visibleShortcutKeys, shortcut, }: ResolveReportUiOptions): ResolvedReportUi;
//# sourceMappingURL=reportUi.d.ts.map