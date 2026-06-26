import { getReportMessages, resolveReportLocale } from "@/i18n/index.js";
const DEFAULT_UI = {
    appearance: "system",
    showFeedbackList: true,
    visibleShortcutKeys: false,
    locale: "en",
};
export function resolveReportUi({ ui }) {
    const locale = resolveReportLocale(ui?.locale);
    return {
        appearance: ui?.appearance ?? DEFAULT_UI.appearance,
        showFeedbackList: ui?.showFeedbackList ?? DEFAULT_UI.showFeedbackList,
        visibleShortcutKeys: ui?.visibleShortcutKeys ?? DEFAULT_UI.visibleShortcutKeys,
        shortcut: ui?.shortcut,
        locale,
        messages: getReportMessages(locale, ui?.messages),
    };
}
//# sourceMappingURL=reportUi.js.map