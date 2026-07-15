import { getReportMessages, resolveReportLocale } from "../../i18n/index.js";
import { DEFAULT_REPLY_HISTORY_MODE, DEFAULT_REPLY_HISTORY_PAGE_SIZE } from "../../utils/feedback/replyHistory.js";
const DEFAULT_UI = {
    panelAppearance: "light",
    tooltipAppearance: "light",
    showFeedbackList: true,
    visibleShortcutKeys: false,
    questionThreadDefault: "expanded",
    locale: "en",
};
export function resolveReportUi({ ui }) {
    const locale = resolveReportLocale(ui?.locale);
    const panelAppearance = ui?.panelAppearance ?? DEFAULT_UI.panelAppearance;
    const tooltipAppearance = ui?.tooltipAppearance ?? DEFAULT_UI.tooltipAppearance;
    return {
        panelAppearance,
        tooltipAppearance,
        showFeedbackList: ui?.showFeedbackList ?? DEFAULT_UI.showFeedbackList,
        visibleShortcutKeys: ui?.visibleShortcutKeys ?? DEFAULT_UI.visibleShortcutKeys,
        questionThreadDefault: ui?.questionThreadDefault ?? DEFAULT_UI.questionThreadDefault,
        replyHistory: {
            mode: ui?.replyHistory?.mode ?? DEFAULT_REPLY_HISTORY_MODE,
            pageSize: ui?.replyHistory?.pageSize ?? DEFAULT_REPLY_HISTORY_PAGE_SIZE,
        },
        shortcut: ui?.shortcut,
        locale,
        messages: getReportMessages(locale, ui?.messages),
    };
}
//# sourceMappingURL=reportUi.js.map