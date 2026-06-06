const DEFAULT_UI = {
    appearance: "system",
    showFeedbackList: true,
    visibleShortcutKeys: false,
};
export function resolveReportUi({ ui, appearance, showFeedbackList, visibleShortcutKeys, shortcut, }) {
    return {
        appearance: ui?.appearance ?? appearance ?? DEFAULT_UI.appearance,
        showFeedbackList: ui?.showFeedbackList ?? showFeedbackList ?? DEFAULT_UI.showFeedbackList,
        visibleShortcutKeys: ui?.visibleShortcutKeys ?? visibleShortcutKeys ?? DEFAULT_UI.visibleShortcutKeys,
        shortcut: ui?.shortcut ?? shortcut,
    };
}
//# sourceMappingURL=reportUi.js.map