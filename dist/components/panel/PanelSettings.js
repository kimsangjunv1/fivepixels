import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from "react";
import { APPEARANCE_OPTION_VALUES } from "../../constants/appearance.js";
import { FONT_FAMILY_SUGGESTIONS, APPEARANCE_SCALE_VALUES, MARKER_FONT_SIZE_VALUES } from "../../constants/markerAppearance.js";
import { useReport } from "../../providers/reportContext.js";
import { formatPresentationViewerLabel } from "../../utils/reportTeam.js";
import { ChevronLeftIcon, ChevronRightIcon } from "../../components/icons/Icons.js";
import { AppearanceThemePicker } from "./AppearanceThemePicker.js";
import { DiscreteScaleDial } from "./DiscreteScaleDial.js";
import { HexColorField } from "./HexColorField.js";
import { MarkerShapePicker } from "./MarkerShapePicker.js";
import { PanelOptionSwitch } from "./PanelOptionSwitch.js";
const LOCALE_OPTIONS = ["en", "ko"];
const QUESTION_THREAD_OPTIONS = ["expanded", "collapsed"];
function SettingsSection({ label, children }) {
    return (_jsxs("section", { className: "flex flex-col border-b border-[var(--adaptive-border-subtle)] last:border-b-0", children: [_jsx("p", { className: "px-[12px] pt-[10px] pb-[4px] text-[11px] font-semibold uppercase tracking-[0.02em] text-[var(--adaptive-black500)]", children: label }), _jsx("div", { className: "flex flex-col py-[2px]", children: children })] }));
}
function SettingsActionButton({ disabled = false, onClick, children }) {
    return (_jsx("button", { type: "button", disabled: disabled, onClick: onClick, className: "w-full rounded-[8px] px-[12px] py-[8px] text-left text-[13px] text-[var(--adaptive-black800)] hover:bg-[var(--adaptive-black100)] disabled:cursor-not-allowed disabled:opacity-50", children: children }));
}
function SettingsHubRow({ title, subtitle, onClick }) {
    return (_jsxs("button", { type: "button", onClick: onClick, className: "flex w-full items-center gap-[10px] border-b border-[var(--adaptive-border-subtle)] px-[12px] py-[10px] text-left last:border-b-0 hover:bg-[var(--adaptive-black100)]", children: [_jsxs("div", { className: "min-w-0 flex-1", children: [_jsx("p", { className: "text-[13px] font-semibold text-[var(--adaptive-black900)]", children: title }), _jsx("p", { className: "mt-[2px] truncate text-[11px] text-[var(--adaptive-black500)]", children: subtitle })] }), _jsx(ChevronRightIcon, { className: "h-[14px] w-[14px] shrink-0 text-[var(--adaptive-black400)]" })] }));
}
function SettingsDetailHeader({ title, backAriaLabel, onBack }) {
    return (_jsxs("div", { className: "sticky top-0 z-[1] flex shrink-0 items-center border-b border-[var(--adaptive-border-subtle)] bg-[var(--adaptive-black50)]", children: [_jsx("button", { type: "button", onClick: onBack, "aria-label": backAriaLabel, className: "flex h-[28px] w-[28px] shrink-0 items-center justify-center text-[var(--adaptive-black700)] hover:bg-[var(--adaptive-black200)] border-r border-r-[var(--adaptive-black200)]", children: _jsx(ChevronLeftIcon, { className: "h-[16px] w-[16px]" }) }), _jsx("p", { className: "px-[12px] min-w-0 flex-1 truncate text-[12px] font-semibold text-[var(--adaptive-black900)]", children: title })] }));
}
function getCategoryTitle(category, messages) {
    switch (category) {
        case "preview":
            return messages.settings.categoryPreview;
        case "appearance":
            return messages.settings.categoryAppearance;
        case "display":
            return messages.settings.categoryDisplay;
        case "data-and-keys":
            return messages.settings.categoryDataAndKeys;
        case "advanced":
            return messages.settings.categoryAdvanced;
    }
}
export function PanelSettings({ transferDisabled = false, panelAppearance, onPanelAppearanceChange, tooltipAppearance, onTooltipAppearanceChange, questionThreadDisplay, onQuestionThreadDisplayChange, onExport, onImport, onCommand, hasPersonalKey, onKeyCopy, onPublicKeyCopy, onKeyInsert, onKeyRotate, }) {
    const [activeCategory, setActiveCategory] = useState(null);
    const { locale, setLocale, messages, showMarkerTargetPreview, setShowMarkerTargetPreview, isPresentationMode, presentationViewers, presentationViewerId, setPresentationViewerId, markerAppearance, setMarkerSize, setMarkerShape, setMarkerColor, typography, setFontSize, setFontFamily, } = useReport();
    const scaleLabels = {
        sm: messages.settings.scaleSm,
        md: messages.settings.scaleMd,
        lg: messages.settings.scaleLg,
        xl: messages.settings.scaleXl,
    };
    const markerFontSizeLabels = {
        none: messages.settings.scaleNone,
        ...scaleLabels,
    };
    const markerShapeLabels = {
        circle: messages.settings.markerShapeCircle,
        square: messages.settings.markerShapeSquare,
        pill: messages.settings.markerShapePill,
        pin: messages.settings.markerShapePin,
    };
    const appearanceOptions = APPEARANCE_OPTION_VALUES.map((value) => ({
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
    const viewerOptions = presentationViewers.map((viewer) => ({
        value: viewer.id,
        label: viewer.isCreator ? `${formatPresentationViewerLabel(viewer)} (${messages.author.creatorLabel})` : formatPresentationViewerLabel(viewer),
        disabled: !viewer.privateKey,
    }));
    const showPreviewCategory = isPresentationMode && viewerOptions.length > 0;
    const activeViewerLabel = viewerOptions.find((option) => option.value === (presentationViewerId ?? viewerOptions[0]?.value))?.label ?? "";
    const appearanceSummary = `${messages.appearance[panelAppearance]} · ${messages.localeOption[locale]}`;
    const displaySummary = `${messages.questionThreadOption[questionThreadDisplay]} · ${showMarkerTargetPreview ? messages.settings.markerTargetsOn : messages.settings.markerTargetsOff}`;
    if (activeCategory) {
        return (_jsxs("section", { className: "flex min-h-0 flex-1 flex-col overflow-hidden bg-[var(--adaptive-black50)]", children: [_jsx(SettingsDetailHeader, { title: getCategoryTitle(activeCategory, messages), backAriaLabel: messages.settings.backAriaLabel, onBack: () => setActiveCategory(null) }), _jsxs("div", { className: "min-h-0 flex-1 overflow-y-auto", children: [activeCategory === "preview" ? (_jsxs(SettingsSection, { label: messages.settings.sectionViewerSwitch, children: [_jsx("p", { className: "mb-[8px] text-[12px] leading-[1.4] text-[var(--adaptive-black600)]", children: messages.settings.viewerSwitchHint }), _jsx("div", { role: "radiogroup", "aria-label": messages.settings.viewerSwitchAriaLabel, className: "flex flex-col gap-[4px]", children: viewerOptions.map((option) => {
                                        const active = option.value === (presentationViewerId ?? viewerOptions[0]?.value);
                                        return (_jsx("button", { type: "button", role: "radio", "aria-checked": active, disabled: option.disabled, onClick: () => {
                                                if (option.disabled) {
                                                    return;
                                                }
                                                void setPresentationViewerId(option.value);
                                            }, className: `rounded-[8px] px-[12px] py-[8px] text-left text-[13px] transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${active
                                                ? "bg-[var(--adaptive-blue50)] font-semibold text-[var(--adaptive-blue500)]"
                                                : "text-[var(--adaptive-black800)] hover:bg-[var(--adaptive-black100)]"}`, children: option.label }, option.value));
                                    }) })] })) : null, activeCategory === "appearance" ? (_jsxs(_Fragment, { children: [_jsx(SettingsSection, { label: messages.settings.sectionTheme, children: _jsxs("div", { className: "flex flex-col gap-[10px] px-[12px] pb-[10px]", children: [_jsxs("div", { children: [_jsx("p", { className: "mb-[6px] text-[11px] font-medium text-[var(--adaptive-black600)]", children: messages.moreMenu.panelTheme }), _jsx(AppearanceThemePicker, { options: appearanceOptions, value: panelAppearance, onChange: onPanelAppearanceChange, ariaLabel: messages.moreMenu.panelThemeAriaLabel })] }), _jsxs("div", { children: [_jsx("p", { className: "mb-[6px] text-[11px] font-medium text-[var(--adaptive-black600)]", children: messages.moreMenu.tooltipTheme }), _jsx(AppearanceThemePicker, { options: appearanceOptions, value: tooltipAppearance, onChange: onTooltipAppearanceChange, ariaLabel: messages.moreMenu.tooltipThemeAriaLabel })] }), _jsxs("div", { children: [_jsx("p", { className: "mb-[6px] text-[11px] font-medium text-[var(--adaptive-black600)]", children: messages.moreMenu.language }), _jsx(PanelOptionSwitch, { options: localeOptions, value: locale, onChange: setLocale, ariaLabel: messages.moreMenu.languageAriaLabel })] })] }) }), _jsx(SettingsSection, { label: messages.settings.sectionMarkerAppearance, children: _jsxs("div", { className: "flex flex-col gap-[12px] px-[12px] pb-[10px]", children: [_jsxs("div", { children: [_jsx("p", { className: "mb-[6px] text-[11px] font-medium text-[var(--adaptive-black600)]", children: messages.settings.markerSize }), _jsx(DiscreteScaleDial, { values: APPEARANCE_SCALE_VALUES, value: markerAppearance.size, onChange: setMarkerSize, labels: scaleLabels, ariaLabel: messages.settings.markerSizeAriaLabel })] }), _jsxs("div", { children: [_jsx("p", { className: "mb-[6px] text-[11px] font-medium text-[var(--adaptive-black600)]", children: messages.settings.markerShape }), _jsx(MarkerShapePicker, { value: markerAppearance.shape, onChange: setMarkerShape, labels: markerShapeLabels, ariaLabel: messages.settings.markerShapeAriaLabel })] }), _jsx(HexColorField, { label: messages.settings.markerColorOpen, value: markerAppearance.colors.open, onChange: (color) => setMarkerColor("open", color) }), _jsx(HexColorField, { label: messages.settings.markerColorResolved, value: markerAppearance.colors.resolved, onChange: (color) => setMarkerColor("resolved", color) }), _jsx(HexColorField, { label: messages.settings.markerColorGitIssued, value: markerAppearance.colors.gitIssued, onChange: (color) => setMarkerColor("gitIssued", color) })] }) }), _jsx(SettingsSection, { label: messages.settings.sectionTypography, children: _jsxs("div", { className: "flex flex-col gap-[12px] px-[12px] pb-[10px]", children: [_jsxs("div", { children: [_jsx("p", { className: "mb-[6px] text-[11px] font-medium text-[var(--adaptive-black600)]", children: messages.settings.markerFontSize }), _jsx(DiscreteScaleDial, { values: MARKER_FONT_SIZE_VALUES, value: typography.fontSize, onChange: setFontSize, labels: markerFontSizeLabels, ariaLabel: messages.settings.markerFontSizeAriaLabel })] }), _jsxs("label", { className: "flex flex-col gap-[4px] text-[11px]", children: [_jsx("span", { className: "font-medium text-[var(--adaptive-black500)]", children: messages.settings.fontFamily }), _jsx("input", { type: "text", list: "fivepixels-font-family-suggestions", value: typography.fontFamily, onChange: (event) => setFontFamily(event.target.value), "aria-label": messages.settings.fontFamilyAriaLabel, className: "w-full rounded-[8px] border border-[var(--adaptive-border-subtle)] bg-[var(--adaptive-black50)] px-[8px] py-[6px] text-[12px] text-[var(--adaptive-black900)] outline-none focus:border-[var(--adaptive-blue500)]" }), _jsx("datalist", { id: "fivepixels-font-family-suggestions", children: FONT_FAMILY_SUGGESTIONS.map((family) => (_jsx("option", { value: family }, family))) })] })] }) })] })) : null, activeCategory === "display" ? (_jsxs(_Fragment, { children: [_jsx(SettingsSection, { label: messages.moreMenu.questionThread, children: _jsx("div", { className: "px-[12px] pb-[10px]", children: _jsx(PanelOptionSwitch, { options: questionThreadOptions, value: questionThreadDisplay, onChange: onQuestionThreadDisplayChange, ariaLabel: messages.moreMenu.questionThreadAriaLabel }) }) }), _jsx(SettingsSection, { label: messages.settings.sectionMarker, children: _jsx("div", { className: "px-[12px] pb-[10px]", children: _jsx(PanelOptionSwitch, { options: [
                                                { value: "off", label: messages.settings.markerTargetsOff },
                                                { value: "on", label: messages.settings.markerTargetsOn },
                                            ], value: showMarkerTargetPreview ? "on" : "off", onChange: (value) => setShowMarkerTargetPreview(value === "on"), ariaLabel: messages.settings.markerTargetsAriaLabel }) }) })] })) : null, activeCategory === "data-and-keys" ? (_jsxs(_Fragment, { children: [_jsxs(SettingsSection, { label: messages.moreMenu.sectionTransfer, children: [_jsx(SettingsActionButton, { disabled: transferDisabled, onClick: onImport, children: messages.moreMenu.import }), _jsx(SettingsActionButton, { disabled: transferDisabled, onClick: onExport, children: messages.moreMenu.export })] }), _jsxs(SettingsSection, { label: messages.moreMenu.sectionKey, children: [_jsx(SettingsActionButton, { disabled: !hasPersonalKey, onClick: onPublicKeyCopy, children: messages.moreMenu.publicKeyCopy }), _jsx(SettingsActionButton, { disabled: !hasPersonalKey, onClick: onKeyCopy, children: messages.moreMenu.keyCopy }), _jsx(SettingsActionButton, { onClick: onKeyInsert, children: messages.moreMenu.keyInsert }), _jsx(SettingsActionButton, { disabled: !hasPersonalKey, onClick: onKeyRotate, children: messages.moreMenu.keyRotate })] })] })) : null, activeCategory === "advanced" ? (_jsx(SettingsSection, { label: messages.moreMenu.sectionAdvanced, children: _jsx(SettingsActionButton, { disabled: transferDisabled, onClick: onCommand, children: messages.moreMenu.command }) })) : null] })] }));
    }
    return (_jsxs("section", { className: "flex min-h-0 flex-1 flex-col overflow-y-auto bg-[var(--adaptive-black50)]", children: [_jsx("p", { className: "shrink-0 border-b border-[var(--adaptive-border-subtle)] px-[12px] py-[10px] text-[13px] font-semibold text-[var(--adaptive-black900)]", children: messages.settings.hubTitle }), showPreviewCategory ? (_jsx(SettingsHubRow, { title: messages.settings.categoryPreview, subtitle: activeViewerLabel, onClick: () => setActiveCategory("preview") })) : null, _jsx(SettingsHubRow, { title: messages.settings.categoryAppearance, subtitle: appearanceSummary, onClick: () => setActiveCategory("appearance") }), _jsx(SettingsHubRow, { title: messages.settings.categoryDisplay, subtitle: displaySummary, onClick: () => setActiveCategory("display") }), _jsx(SettingsHubRow, { title: messages.settings.categoryDataAndKeys, subtitle: messages.settings.categoryDataAndKeysSummary, onClick: () => setActiveCategory("data-and-keys") }), _jsx(SettingsHubRow, { title: messages.settings.categoryAdvanced, subtitle: messages.moreMenu.command, onClick: () => setActiveCategory("advanced") })] }));
}
//# sourceMappingURL=PanelSettings.js.map