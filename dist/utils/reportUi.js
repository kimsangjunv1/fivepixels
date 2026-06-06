import { getReportMessages, resolveReportLocale } from "../i18n/index.js";
const DEFAULT_UI = {
    appearance: "system",
    showFeedbackList: true,
    visibleShortcutKeys: false,
    locale: "en",
};
export function resolveReportUi({ ui, appearance, showFeedbackList, visibleShortcutKeys, shortcut }) {
    const locale = resolveReportLocale(ui?.locale);
    return {
        appearance: ui?.appearance ?? appearance ?? DEFAULT_UI.appearance,
        showFeedbackList: ui?.showFeedbackList ?? showFeedbackList ?? DEFAULT_UI.showFeedbackList,
        visibleShortcutKeys: ui?.visibleShortcutKeys ?? visibleShortcutKeys ?? DEFAULT_UI.visibleShortcutKeys,
        shortcut: ui?.shortcut ?? shortcut,
        locale,
        messages: getReportMessages(locale, ui?.messages),
    };
}
//# sourceMappingURL=reportUi.js.map