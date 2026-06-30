import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useReport } from "../../providers/reportContext.js";
import { PanelOptionSwitch } from "./PanelOptionSwitch.js";
const LOCALE_OPTIONS = ["en", "ko"];
const QUESTION_THREAD_OPTIONS = ["expanded", "collapsed"];
function SettingsSection({ label, children }) {
    return (_jsxs("section", { className: "flex flex-col border-b border-[var(--adaptive-border-subtle)] last:border-b-0", children: [_jsx("p", { className: "px-[12px] pt-[10px] pb-[4px] text-[11px] font-semibold uppercase tracking-[0.02em] text-[var(--adaptive-black500)]", children: label }), _jsx("div", { className: "flex flex-col py-[2px]", children: children })] }));
}
function SettingsActionButton({ disabled = false, onClick, children }) {
    return (_jsx("button", { type: "button", disabled: disabled, onClick: onClick, className: "w-full rounded-[8px] px-[12px] py-[8px] text-left text-[13px] text-[var(--adaptive-black800)] hover:bg-[var(--adaptive-black100)] disabled:cursor-not-allowed disabled:opacity-50", children: children }));
}
export function PanelSettings({ transferDisabled = false, appearance, onAppearanceChange, questionThreadDisplay, onQuestionThreadDisplayChange, onExport, onImport, onCommand, hasPersonalKey, onKeyCopy, onPublicKeyCopy, onKeyInsert, onKeyRotate, }) {
    const { locale, setLocale, messages, showMarkerTargetPreview, setShowMarkerTargetPreview } = useReport();
    const appearanceOptions = ["system", "light", "dark"].map((value) => ({
        value,
        label: messages.appearance[value],
    }));
    const localeOptions = LOCALE_OPTIONS.map((value) => ({
        value,
        label: messages.localeOption[value],
    }));
    const questionThreadOptions = QUESTION_THREAD_OPTIONS.map((value) => ({
        value,
        label: messages.questionThreadOption[value],
    }));
    return (_jsxs("section", { className: "flex min-h-0 flex-1 flex-col overflow-y-auto bg-[var(--adaptive-black50)]", children: [_jsxs(SettingsSection, { label: messages.moreMenu.sectionTransfer, children: [_jsx(SettingsActionButton, { disabled: transferDisabled, onClick: onImport, children: messages.moreMenu.import }), _jsx(SettingsActionButton, { disabled: transferDisabled, onClick: onExport, children: messages.moreMenu.export })] }), _jsxs(SettingsSection, { label: messages.moreMenu.sectionKey, children: [_jsx(SettingsActionButton, { disabled: !hasPersonalKey, onClick: onPublicKeyCopy, children: messages.moreMenu.publicKeyCopy }), _jsx(SettingsActionButton, { disabled: !hasPersonalKey, onClick: onKeyCopy, children: messages.moreMenu.keyCopy }), _jsx(SettingsActionButton, { onClick: onKeyInsert, children: messages.moreMenu.keyInsert }), _jsx(SettingsActionButton, { disabled: !hasPersonalKey, onClick: onKeyRotate, children: messages.moreMenu.keyRotate })] }), _jsx(SettingsSection, { label: messages.moreMenu.theme, children: _jsx("div", { className: "px-[12px] pb-[10px]", children: _jsx(PanelOptionSwitch, { options: appearanceOptions, value: appearance, onChange: onAppearanceChange, ariaLabel: messages.moreMenu.themeAriaLabel }) }) }), _jsx(SettingsSection, { label: messages.moreMenu.language, children: _jsx("div", { className: "px-[12px] pb-[10px]", children: _jsx(PanelOptionSwitch, { options: localeOptions, value: locale, onChange: setLocale, ariaLabel: messages.moreMenu.languageAriaLabel }) }) }), _jsx(SettingsSection, { label: messages.moreMenu.questionThread, children: _jsx("div", { className: "px-[12px] pb-[10px]", children: _jsx(PanelOptionSwitch, { options: questionThreadOptions, value: questionThreadDisplay, onChange: onQuestionThreadDisplayChange, ariaLabel: messages.moreMenu.questionThreadAriaLabel }) }) }), _jsx(SettingsSection, { label: messages.settings.sectionMarker, children: _jsx("div", { className: "px-[12px] pb-[10px]", children: _jsx(PanelOptionSwitch, { options: [
                            { value: "off", label: messages.settings.markerTargetsOff },
                            { value: "on", label: messages.settings.markerTargetsOn },
                        ], value: showMarkerTargetPreview ? "on" : "off", onChange: (value) => setShowMarkerTargetPreview(value === "on"), ariaLabel: messages.settings.markerTargetsAriaLabel }) }) }), _jsx(SettingsSection, { label: messages.moreMenu.sectionAdvanced, children: _jsx(SettingsActionButton, { disabled: transferDisabled, onClick: onCommand, children: messages.moreMenu.command }) })] }));
}
//# sourceMappingURL=PanelSettings.js.map