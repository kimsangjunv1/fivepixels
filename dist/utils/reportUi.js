import { getReportMessages, resolveReportLocale } from "../i18n/index.js";
const DEFAULT_UI = {
    panelAppearance: "system",
    tooltipAppearance: "system",
    showFeedbackList: true,
    visibleShortcutKeys: false,
    questionThreadDefault: "expanded",
    locale: "en",
};
function resolveScopedAppearance(ui, specific) {
    return specific ?? ui?.appearance ?? DEFAULT_UI.panelAppearance;
}
export function resolveReportUi({ ui }) {
    const locale = resolveReportLocale(ui?.locale);
    const sharedAppearance = ui?.appearance;
    const panelAppearance = ui?.panelAppearance ?? sharedAppearance ?? DEFAULT_UI.panelAppearance;
    const tooltipAppearance = ui?.tooltipAppearance ?? sharedAppearance ?? DEFAULT_UI.tooltipAppearance;
    return {
        panelAppearance,
        tooltipAppearance,
        showFeedbackList: ui?.showFeedbackList ?? DEFAULT_UI.showFeedbackList,
        visibleShortcutKeys: ui?.visibleShortcutKeys ?? DEFAULT_UI.visibleShortcutKeys,
        questionThreadDefault: ui?.questionThreadDefault ?? DEFAULT_UI.questionThreadDefault,
        shortcut: ui?.shortcut,
        locale,
        messages: getReportMessages(locale, ui?.messages),
    };
}
//# sourceMappingURL=reportUi.js.map