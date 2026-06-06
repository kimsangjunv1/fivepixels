import type { ReportUi } from "../types/report.js";

export type ResolvedReportUi = {
    appearance: NonNullable<ReportUi["appearance"]>;
    showFeedbackList: boolean;
    visibleShortcutKeys: boolean;
    shortcut?: string;
};

const DEFAULT_UI: Pick<ResolvedReportUi, "appearance" | "showFeedbackList" | "visibleShortcutKeys"> = {
    appearance: "system",
    showFeedbackList: true,
    visibleShortcutKeys: false,
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

export function resolveReportUi({
    ui,
    appearance,
    showFeedbackList,
    visibleShortcutKeys,
    shortcut,
}: ResolveReportUiOptions): ResolvedReportUi {
    return {
        appearance: ui?.appearance ?? appearance ?? DEFAULT_UI.appearance,
        showFeedbackList: ui?.showFeedbackList ?? showFeedbackList ?? DEFAULT_UI.showFeedbackList,
        visibleShortcutKeys: ui?.visibleShortcutKeys ?? visibleShortcutKeys ?? DEFAULT_UI.visibleShortcutKeys,
        shortcut: ui?.shortcut ?? shortcut,
    };
}
