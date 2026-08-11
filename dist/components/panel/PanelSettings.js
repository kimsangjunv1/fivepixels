import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from "react";
import { APPEARANCE_OPTION_VALUES } from "../../constants/appearance.js";
import { DEFAULT_FEEDBACK_MODE_DOT_COLORS, FONT_FAMILY_SUGGESTIONS, MARKER_FILL_STYLE_VALUES } from "../../constants/markerAppearance.js";
import { useReportPreferences, useReportSession } from "../../providers/reportContext.js";
import { formatPresentationViewerLabel } from "../../utils/report/reportTeam.js";
import { ChevronLeftIcon, ChevronRightIcon } from "../../components/icons/Icons.js";
import { AppearanceThemePicker } from "./AppearanceThemePicker.js";
import { HexColorField } from "./HexColorField.js";
import { MarkerShapePicker } from "./MarkerShapePicker.js";
import { PanelMarkerDisplayControls } from "./PanelMarkerDisplayControls.js";
import { PanelOptionSwitch } from "./PanelOptionSwitch.js";
import { PanelTabSelector } from "./PanelTabSelector.js";
import { PanelTeamSettings } from "./PanelTeamSettings.js";
const LOCALE_OPTIONS = ["en", "ko"];
const QUESTION_THREAD_OPTIONS = ["expanded", "collapsed"];
function SettingsSection({ label, children }) {
    return (_jsxs("section", { className: "flex flex-col border-b border-[var(--adaptive-border-subtle)] last:border-b-0", children: [_jsx("p", { className: "px-[12px] pt-[10px] pb-[4px] text-[11px] font-semibold uppercase tracking-[0.02em] text-[var(--adaptive-black500)]", children: label }), _jsx("div", { className: "flex flex-col py-[2px]", children: children })] }));
}
function SettingsActionButton({ disabled = false, onClick, children }) {
    return (_jsx("button", { type: "button", disabled: disabled, onClick: onClick, className: "w-full rounded-[8px] px-[12px] py-[8px] text-left text-[13px] text-[var(--adaptive-black800)] hover:bg-[var(--adaptive-black100)] disabled:cursor-not-allowed disabled:opacity-50", children: children }));
}
function SettingsHubRow({ title, subtitle, onClick }) {
    return (_jsxs("button", { type: "button", onClick: onClick, className: "flex w-full items-center gap-[10px] border-b border-[var(--adaptive-border-subtle)] px-[12px] py-[10px] text-left last:border-b-0 hover:bg-[var(--adaptive-black100)]", children: [_jsxs("div", { className: "min-w-0 flex-1 flex flex-col gap-[4px]", children: [_jsx("p", { className: "text-[13px] font-semibold text-[var(--adaptive-black900)]", children: title }), _jsx("p", { className: "truncate text-[10px] text-[var(--adaptive-black700)]", children: subtitle })] }), _jsx(ChevronRightIcon, { className: "h-[14px] w-[14px] shrink-0 text-[var(--adaptive-black400)]" })] }));
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
        case "tabs":
            return messages.settings.categoryTabs;
        case "team":
            return messages.settings.categoryTeam;
        case "data-and-keys":
            return messages.settings.categoryDataAndKeys;
        case "advanced":
            return messages.settings.categoryAdvanced;
    }
}
function getAppearanceSectionTitle(section, messages) {
    switch (section) {
        case "theme-language":
            return messages.settings.appearanceThemeLanguage;
        case "feedback-mode":
            return messages.settings.sectionFeedbackMode;
        case "marker":
            return messages.settings.sectionMarkerAppearance;
    }
}
export function PanelSettings({ transferDisabled = false, panelAppearance, onPanelAppearanceChange, tooltipAppearance, onTooltipAppearanceChange, questionThreadDisplay, onQuestionThreadDisplayChange, onExport, onImport, onCommand, hasPersonalKey, onKeyCopy, onPublicKeyCopy, onKeyInsert, onKeyRotate, }) {
    const [activeCategory, setActiveCategory] = useState(null);
    const [activeAppearanceSection, setActiveAppearanceSection] = useState(null);
    const { locale, setLocale, messages, showMarkerTargetPreview, setShowMarkerTargetPreview, devicePreviewUiOpen, setDevicePreviewUiOpen, isPresentationMode, presentationViewers, markerAppearance, setMarkerSize, setMarkerShape, setMarkerFillStyle, setMarkerColor, setFeedbackModeDotColors, setFeedbackModeDotColor, typography, setFontFamily, panelRole, visiblePanelTabs, visiblePanelTabsSummary, resolvedTabAvailabilityContext, setVisiblePanelTabs, resetVisibleTabsToRoleDefault, canAccessTeamSettings, } = useReportPreferences();
    const { presentationViewerId, setPresentationViewerId } = useReportSession();
    const scaleLabels = {
        xs: messages.settings.scaleXs,
        sm: messages.settings.scaleSm,
        md: messages.settings.scaleMd,
        lg: messages.settings.scaleLg,
        xl: messages.settings.scaleXl,
    };
    const shapeLabels = {
        circle: messages.settings.markerShapeCircle,
        square: messages.settings.markerShapeSquare,
        cookie4: messages.settings.markerShapeCookie4,
        sunny: messages.settings.markerShapeSunny,
        cookie6: messages.settings.markerShapeCookie6,
        clover4: messages.settings.markerShapeClover4,
        flower: messages.settings.markerShapeFlower,
        ghostish: messages.settings.markerShapeGhostish,
        bun: messages.settings.markerShapeBun,
        gem: messages.settings.markerShapeGem,
        pill: messages.settings.markerShapePill,
        pentagon: messages.settings.markerShapePentagon,
        puffy: messages.settings.markerShapePuffy,
    };
    const fillStyleLabels = {
        filled: messages.settings.markerFillStyleFilled,
        outlined: messages.settings.markerFillStyleOutlined,
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
    const feedbackModeSummary = `${markerAppearance.feedbackModeDotColors.light} · ${markerAppearance.feedbackModeDotColors.dark}`;
    const markerSummary = `${scaleLabels[markerAppearance.size]} · ${shapeLabels[markerAppearance.shape]} · ${fillStyleLabels[markerAppearance.fillStyle]}`;
    const displaySummary = `${messages.questionThreadOption[questionThreadDisplay]} · ${showMarkerTargetPreview ? messages.settings.markerTargetsOn : messages.settings.markerTargetsOff} · ${devicePreviewUiOpen ? messages.settings.devicePreviewEnabledSummary : messages.settings.devicePreviewDisabledSummary}`;
    const tabsSummary = visiblePanelTabsSummary || messages.settings.categoryTabsSummary;
    if (activeCategory === "appearance" && !activeAppearanceSection) {
        return (_jsxs("section", { className: "flex min-h-0 flex-1 flex-col overflow-hidden bg-[var(--adaptive-black50)]", children: [_jsx(SettingsDetailHeader, { title: messages.settings.categoryAppearance, backAriaLabel: messages.settings.backAriaLabel, onBack: () => setActiveCategory(null) }), _jsxs("div", { className: "min-h-0 flex-1 overflow-y-auto", children: [_jsx(SettingsHubRow, { title: messages.settings.appearanceThemeLanguage, subtitle: appearanceSummary, onClick: () => setActiveAppearanceSection("theme-language") }), _jsx(SettingsHubRow, { title: messages.settings.sectionFeedbackMode, subtitle: feedbackModeSummary, onClick: () => setActiveAppearanceSection("feedback-mode") }), _jsx(SettingsHubRow, { title: messages.settings.sectionMarkerAppearance, subtitle: markerSummary, onClick: () => setActiveAppearanceSection("marker") })] })] }));
    }
    if (activeCategory) {
        const isAppearanceDetail = activeCategory === "appearance" && activeAppearanceSection != null;
        const detailTitle = activeCategory === "appearance" && activeAppearanceSection
            ? getAppearanceSectionTitle(activeAppearanceSection, messages)
            : getCategoryTitle(activeCategory, messages);
        const detailBackAriaLabel = isAppearanceDetail ? messages.settings.appearanceBackAriaLabel : messages.settings.backAriaLabel;
        return (_jsxs("section", { className: "flex min-h-0 flex-1 flex-col overflow-hidden bg-[var(--adaptive-black50)]", children: [_jsx(SettingsDetailHeader, { title: detailTitle, backAriaLabel: detailBackAriaLabel, onBack: () => {
                        if (isAppearanceDetail) {
                            setActiveAppearanceSection(null);
                            return;
                        }
                        setActiveCategory(null);
                    } }), _jsxs("div", { className: "min-h-0 flex-1 overflow-y-auto", children: [activeCategory === "preview" ? (_jsxs(SettingsSection, { label: messages.settings.sectionViewerSwitch, children: [_jsx("p", { className: "mb-[8px] text-[12px] leading-[1.4] text-[var(--adaptive-black600)]", children: messages.settings.viewerSwitchHint }), _jsx("div", { role: "radiogroup", "aria-label": messages.settings.viewerSwitchAriaLabel, className: "flex flex-col gap-[4px]", children: viewerOptions.map((option) => {
                                        const active = option.value === (presentationViewerId ?? viewerOptions[0]?.value);
                                        return (_jsx("button", { type: "button", role: "radio", "aria-checked": active, disabled: option.disabled, onClick: () => {
                                                if (option.disabled) {
                                                    return;
                                                }
                                                void setPresentationViewerId(option.value);
                                            }, className: `rounded-[8px] px-[12px] py-[8px] text-left text-[13px] transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${active
                                                ? "bg-[var(--adaptive-blue50)] font-semibold text-[var(--adaptive-blue500)]"
                                                : "text-[var(--adaptive-black800)] hover:bg-[var(--adaptive-black100)]"}`, children: option.label }, option.value));
                                    }) })] })) : null, activeAppearanceSection === "theme-language" ? (_jsxs(_Fragment, { children: [_jsx(SettingsSection, { label: messages.settings.sectionTheme, children: _jsxs("div", { className: "flex flex-col gap-[10px] px-[12px] pb-[10px]", children: [_jsxs("div", { children: [_jsx("p", { className: "mb-[6px] text-[11px] font-medium text-[var(--adaptive-black600)]", children: messages.moreMenu.panelTheme }), _jsx(AppearanceThemePicker, { options: appearanceOptions, value: panelAppearance, onChange: onPanelAppearanceChange, ariaLabel: messages.moreMenu.panelThemeAriaLabel, previewKind: "panel" })] }), _jsxs("div", { children: [_jsx("p", { className: "mb-[6px] text-[11px] font-medium text-[var(--adaptive-black600)]", children: messages.moreMenu.tooltipTheme }), _jsx(AppearanceThemePicker, { options: appearanceOptions, value: tooltipAppearance, onChange: onTooltipAppearanceChange, ariaLabel: messages.moreMenu.tooltipThemeAriaLabel, previewKind: "tooltip" })] })] }) }), _jsx(SettingsSection, { label: messages.settings.sectionLanguage, children: _jsx("div", { className: "px-[12px] pb-[10px]", children: _jsx(PanelOptionSwitch, { options: localeOptions, value: locale, onChange: setLocale, ariaLabel: messages.moreMenu.languageAriaLabel }) }) })] })) : null, activeAppearanceSection === "feedback-mode" ? (_jsx(SettingsSection, { label: messages.settings.sectionFeedbackMode, children: _jsxs("div", { className: "flex flex-col gap-[12px] px-[12px] pb-[10px]", children: [_jsx(HexColorField, { label: messages.settings.feedbackModeDotColorLight, value: markerAppearance.feedbackModeDotColors.light, onChange: (color) => setFeedbackModeDotColor("light", color) }), _jsx(HexColorField, { label: messages.settings.feedbackModeDotColorDark, value: markerAppearance.feedbackModeDotColors.dark, onChange: (color) => setFeedbackModeDotColor("dark", color) }), _jsx(SettingsActionButton, { onClick: () => setFeedbackModeDotColors(DEFAULT_FEEDBACK_MODE_DOT_COLORS), children: messages.settings.resetFeedbackModeDotColors })] }) })) : null, activeAppearanceSection === "marker" ? (_jsxs(_Fragment, { children: [_jsx(SettingsSection, { label: messages.settings.sectionMarkerForm, children: _jsxs("div", { className: "flex flex-col gap-[12px] px-[12px] pb-[10px]", children: [_jsx(PanelMarkerDisplayControls, { markerSize: markerAppearance.size, onMarkerSizeChange: setMarkerSize, scaleLabels: scaleLabels, markerSizeLabel: messages.settings.markerSize, markerSizeAriaLabel: messages.settings.markerSizeAriaLabel }), _jsxs("div", { children: [_jsx("p", { className: "mb-[6px] text-[11px] font-medium text-[var(--adaptive-black600)]", children: messages.settings.markerFillStyle }), _jsx(PanelOptionSwitch, { options: MARKER_FILL_STYLE_VALUES.map((value) => ({
                                                            value,
                                                            label: fillStyleLabels[value],
                                                        })), value: markerAppearance.fillStyle, onChange: setMarkerFillStyle, ariaLabel: messages.settings.markerFillStyleAriaLabel })] }), _jsxs("div", { children: [_jsx("p", { className: "mb-[6px] text-[11px] font-medium text-[var(--adaptive-black600)]", children: messages.settings.markerShape }), _jsx(MarkerShapePicker, { value: markerAppearance.shape, onChange: setMarkerShape, labels: shapeLabels, ariaLabel: messages.settings.markerShapeAriaLabel, previewColor: markerAppearance.colors.open, fillStyle: markerAppearance.fillStyle })] })] }) }), _jsx(SettingsSection, { label: messages.settings.sectionMarkerColors, children: _jsxs("div", { className: "flex flex-col gap-[12px] px-[12px] pb-[10px]", children: [_jsx(HexColorField, { label: messages.settings.markerColorOpen, value: markerAppearance.colors.open, onChange: (color) => setMarkerColor("open", color) }), _jsx(HexColorField, { label: messages.settings.markerColorResolved, value: markerAppearance.colors.resolved, onChange: (color) => setMarkerColor("resolved", color) }), _jsx(HexColorField, { label: messages.settings.markerColorGitIssued, value: markerAppearance.colors.gitIssued, onChange: (color) => setMarkerColor("gitIssued", color) })] }) }), _jsx(SettingsSection, { label: messages.settings.sectionTypography, children: _jsx("div", { className: "flex flex-col gap-[12px] px-[12px] pb-[10px]", children: _jsxs("label", { className: "flex flex-col gap-[4px] text-[11px]", children: [_jsx("span", { className: "font-medium text-[var(--adaptive-black500)]", children: messages.settings.fontFamily }), _jsx("input", { type: "text", list: "fivepixels-font-family-suggestions", value: typography.fontFamily, onChange: (event) => setFontFamily(event.target.value), "aria-label": messages.settings.fontFamilyAriaLabel, className: "w-full rounded-[8px] border border-[var(--adaptive-border-subtle)] bg-[var(--adaptive-black50)] px-[8px] py-[6px] text-[12px] text-[var(--adaptive-black900)] outline-none focus:border-[var(--adaptive-blue500)]" }), _jsx("datalist", { id: "fivepixels-font-family-suggestions", children: FONT_FAMILY_SUGGESTIONS.map((family) => (_jsx("option", { value: family }, family))) })] }) }) })] })) : null, activeCategory === "display" ? (_jsxs(_Fragment, { children: [_jsx(SettingsSection, { label: messages.moreMenu.questionThread, children: _jsx("div", { className: "px-[12px] pb-[10px]", children: _jsx(PanelOptionSwitch, { options: questionThreadOptions, value: questionThreadDisplay, onChange: onQuestionThreadDisplayChange, ariaLabel: messages.moreMenu.questionThreadAriaLabel }) }) }), _jsx(SettingsSection, { label: messages.settings.sectionMarker, children: _jsx("div", { className: "px-[12px] pb-[10px]", children: _jsx(PanelOptionSwitch, { options: [
                                                { value: "off", label: messages.settings.markerTargetsOff },
                                                { value: "on", label: messages.settings.markerTargetsOn },
                                            ], value: showMarkerTargetPreview ? "on" : "off", onChange: (value) => setShowMarkerTargetPreview(value === "on"), ariaLabel: messages.settings.markerTargetsAriaLabel }) }) }), _jsx(SettingsSection, { label: messages.settings.sectionDevicePreview, children: _jsx("div", { className: "flex flex-col gap-[12px] px-[12px] pb-[10px]", children: _jsxs("label", { className: "flex items-center gap-[8px] text-[12px] text-[var(--adaptive-black800)]", children: [_jsx("input", { type: "checkbox", checked: devicePreviewUiOpen, onChange: (event) => setDevicePreviewUiOpen(event.target.checked), "aria-label": messages.settings.devicePreviewUiOpenAriaLabel, className: "h-[14px] w-[14px] accent-[var(--adaptive-blue500)]" }), _jsx("span", { className: "font-medium", children: messages.settings.devicePreviewUiOpenLabel })] }) }) })] })) : null, activeCategory === "tabs" ? (_jsx(SettingsSection, { label: messages.settings.categoryTabs, children: _jsxs("div", { className: "flex flex-col gap-[12px] px-[12px] pb-[10px]", children: [_jsx(PanelTabSelector, { role: panelRole, selectedTabs: visiblePanelTabs, context: resolvedTabAvailabilityContext, messages: messages, onChange: setVisiblePanelTabs }), _jsx(SettingsActionButton, { onClick: resetVisibleTabsToRoleDefault, children: messages.settings.resetTabsToRoleDefault })] }) })) : null, activeCategory === "team" ? _jsx(PanelTeamSettings, {}) : null, activeCategory === "data-and-keys" ? (_jsxs(_Fragment, { children: [_jsxs(SettingsSection, { label: messages.moreMenu.sectionTransfer, children: [_jsx(SettingsActionButton, { disabled: transferDisabled, onClick: onImport, children: messages.moreMenu.import }), _jsx(SettingsActionButton, { disabled: transferDisabled, onClick: onExport, children: messages.moreMenu.export })] }), _jsxs(SettingsSection, { label: messages.moreMenu.sectionKey, children: [_jsx(SettingsActionButton, { disabled: !hasPersonalKey, onClick: onPublicKeyCopy, children: messages.moreMenu.publicKeyCopy }), _jsx(SettingsActionButton, { disabled: !hasPersonalKey, onClick: onKeyCopy, children: messages.moreMenu.keyCopy }), _jsx(SettingsActionButton, { onClick: onKeyInsert, children: messages.moreMenu.keyInsert }), _jsx(SettingsActionButton, { disabled: !hasPersonalKey, onClick: onKeyRotate, children: messages.moreMenu.keyRotate })] })] })) : null, activeCategory === "advanced" ? (_jsx(SettingsSection, { label: messages.moreMenu.sectionAdvanced, children: _jsx(SettingsActionButton, { disabled: transferDisabled, onClick: onCommand, children: messages.moreMenu.command }) })) : null] })] }));
    }
    return (_jsxs("section", { className: "flex min-h-0 flex-1 flex-col overflow-y-auto bg-[var(--adaptive-black50)]", children: [_jsx("p", { className: "shrink-0 border-b border-[var(--adaptive-border-subtle)] px-[12px] py-[10px] text-[13px] font-semibold text-[var(--adaptive-black900)]", children: messages.settings.hubTitle }), showPreviewCategory ? (_jsx(SettingsHubRow, { title: messages.settings.categoryPreview, subtitle: activeViewerLabel, onClick: () => setActiveCategory("preview") })) : null, _jsx(SettingsHubRow, { title: messages.settings.categoryAppearance, subtitle: appearanceSummary, onClick: () => {
                    setActiveAppearanceSection(null);
                    setActiveCategory("appearance");
                } }), _jsx(SettingsHubRow, { title: messages.settings.categoryDisplay, subtitle: displaySummary, onClick: () => setActiveCategory("display") }), _jsx(SettingsHubRow, { title: messages.settings.categoryTabs, subtitle: tabsSummary, onClick: () => setActiveCategory("tabs") }), canAccessTeamSettings ? (_jsx(SettingsHubRow, { title: messages.settings.categoryTeam, subtitle: messages.settings.categoryTeamSummary, onClick: () => setActiveCategory("team") })) : null, _jsx(SettingsHubRow, { title: messages.settings.categoryDataAndKeys, subtitle: messages.settings.categoryDataAndKeysSummary, onClick: () => setActiveCategory("data-and-keys") }), _jsx(SettingsHubRow, { title: messages.settings.categoryAdvanced, subtitle: messages.moreMenu.command, onClick: () => setActiveCategory("advanced") })] }));
}
//# sourceMappingURL=PanelSettings.js.map