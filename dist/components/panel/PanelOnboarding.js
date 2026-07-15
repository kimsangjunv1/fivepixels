import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useMemo, useState } from "react";
import { APPEARANCE_OPTION_VALUES } from "../../constants/appearance.js";
import { APPEARANCE_SCALE_VALUES, MARKER_FONT_SIZE_VALUES } from "../../constants/markerAppearance.js";
import { PANEL_ROLE_VALUES } from "../../constants/panelRole.js";
import { useReportPreferences, useReportSession } from "../../providers/reportContext.js";
import { getDefaultVisibleTabsForRole } from "../../utils/panel/panelTabPreference.js";
import { isPersonalKeyFile, readPersonalKeyFile } from "../../utils/feedback/feedbackDataTransfer.js";
import { AppearanceThemePicker } from "./AppearanceThemePicker.js";
import { DiscreteScaleDial } from "./DiscreteScaleDial.js";
import { MarkerSizePreview } from "./MarkerSizePreview.js";
import { PanelDropdownMenuItem } from "./PanelDropdownMenu.js";
import { PanelOptionSwitch } from "./PanelOptionSwitch.js";
import { PanelTabSelector } from "./PanelTabSelector.js";
const LOCALE_OPTIONS = ["en", "ko"];
export function PanelOnboarding() {
    const { messages, locale, setLocale, panelAppearance, setPanelAppearance, markerAppearance, setMarkerSize, typography, setFontSize, panelRole, setPanelRole, completeOnboarding, restoreFromBackup, selfProfile, personalKeyCandidates, resolvedTabAvailabilityContext, savePanelTabPreference, } = useReportPreferences();
    const { setErrorMessage } = useReportSession();
    const onboarding = messages.onboarding;
    const [step, setStep] = useState("language");
    const [name, setName] = useState(selfProfile?.name ?? "");
    const [selectedTabs, setSelectedTabs] = useState(() => getDefaultVisibleTabsForRole(panelRole, resolvedTabAvailabilityContext));
    const [isCreating, setIsCreating] = useState(false);
    const [backupKey, setBackupKey] = useState("");
    const [isRestoring, setIsRestoring] = useState(false);
    const [restoreError, setRestoreError] = useState("");
    const [isDragOver, setIsDragOver] = useState(false);
    const trimmedName = name.trim();
    const hasDuplicateName = useMemo(() => Boolean(trimmedName) && personalKeyCandidates.some((author) => author.name.trim() === trimmedName), [personalKeyCandidates, trimmedName]);
    const canProceedFromRoleStep = selectedTabs.length > 0;
    const localeOptions = LOCALE_OPTIONS.map((value) => ({
        value,
        label: messages.localeOption[value],
    }));
    const appearanceOptions = APPEARANCE_OPTION_VALUES.map((value) => ({
        value,
        label: messages.appearance[value],
    }));
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
    const handleSelectRole = (role) => {
        setPanelRole(role);
        setSelectedTabs(getDefaultVisibleTabsForRole(role, resolvedTabAvailabilityContext));
    };
    const handleCreateKey = async () => {
        if (!trimmedName || isCreating || hasDuplicateName) {
            return;
        }
        setIsCreating(true);
        try {
            savePanelTabPreference({
                visibleTabs: selectedTabs,
                customized: true,
            });
            await completeOnboarding({ name: trimmedName });
        }
        catch {
            setErrorMessage(messages.errors.clipboardCopyFailed);
        }
        finally {
            setIsCreating(false);
        }
    };
    const handleRestore = async () => {
        if (!backupKey.trim() || isRestoring) {
            return;
        }
        setIsRestoring(true);
        setRestoreError("");
        try {
            const result = await restoreFromBackup(backupKey.trim());
            if (!result.restored) {
                if (result.reason === "unauthorized") {
                    setRestoreError(onboarding.restoreNotAuthorized);
                }
                else if (result.reason === "project-mismatch") {
                    setRestoreError(messages.personalKey.restoreProjectMismatch);
                }
                else {
                    setRestoreError(messages.personalKey.invalidKey);
                }
                return;
            }
            if (typeof window !== "undefined") {
                window.location.reload();
            }
        }
        catch {
            setRestoreError(messages.personalKey.invalidKey);
        }
        finally {
            setIsRestoring(false);
        }
    };
    const handleDragOver = (event) => {
        if (!Array.from(event.dataTransfer.types).includes("Files")) {
            return;
        }
        event.preventDefault();
        setIsDragOver(true);
    };
    const handleDragLeave = (event) => {
        if (event.currentTarget.contains(event.relatedTarget)) {
            return;
        }
        setIsDragOver(false);
    };
    const handleDrop = async (event) => {
        event.preventDefault();
        setIsDragOver(false);
        const file = event.dataTransfer.files.item(0);
        if (!file) {
            return;
        }
        if (!isPersonalKeyFile(file)) {
            setRestoreError(onboarding.restoreDropInvalid);
            return;
        }
        try {
            const key = await readPersonalKeyFile(file);
            setBackupKey(key);
            setRestoreError("");
        }
        catch {
            setRestoreError(onboarding.restoreDropFailed);
        }
    };
    return (_jsx("section", { className: "flex flex-col gap-[12px] bg-[var(--adaptive-black50)] p-[16px]", children: step === "language" ? (_jsxs(_Fragment, { children: [_jsxs("div", { children: [_jsx("h6", { className: "text-[14px] font-bold text-[var(--adaptive-black900)]", children: onboarding.languageStepTitle }), _jsx("p", { className: "mt-[4px] text-[12px] leading-[1.5] text-[var(--adaptive-black600)]", children: onboarding.languageStepDescription })] }), _jsx(PanelOptionSwitch, { options: localeOptions, value: locale, onChange: setLocale, ariaLabel: messages.moreMenu.languageAriaLabel }), _jsx("div", { className: "flex items-center justify-end", children: _jsx("button", { type: "button", onClick: () => setStep("intro"), className: "rounded-[8px] bg-[var(--adaptive-blue100)] px-[12px] py-[6px] text-[12px] font-bold text-[var(--adaptive-blue500)]", children: onboarding.next }) })] })) : step === "intro" ? (_jsxs(_Fragment, { children: [_jsxs("div", { children: [_jsx("h6", { className: "text-[14px] font-bold text-[var(--adaptive-black900)]", children: onboarding.introTitle }), _jsx("p", { className: "mt-[4px] text-[12px] leading-[1.5] text-[var(--adaptive-black600)]", children: onboarding.introDescription })] }), _jsxs("div", { className: "flex flex-col gap-[8px]", children: [_jsx("button", { type: "button", onClick: () => setStep("role"), className: "rounded-[8px] bg-[var(--adaptive-blue100)] px-[12px] py-[10px] text-[12px] font-bold text-[var(--adaptive-blue500)]", children: onboarding.newUser }), _jsx("button", { type: "button", onClick: () => setStep("restore"), className: "rounded-[8px] border border-[var(--adaptive-black200)] px-[12px] py-[10px] text-[12px] font-semibold text-[var(--adaptive-black700)] hover:bg-[var(--adaptive-black100)]", children: onboarding.existingUser })] }), _jsx("div", { className: "flex items-center justify-start", children: _jsx("button", { type: "button", onClick: () => setStep("language"), className: "text-[12px] font-semibold text-[var(--adaptive-black500)] hover:text-[var(--adaptive-black700)]", children: onboarding.back }) })] })) : step === "restore" ? (_jsxs(_Fragment, { children: [_jsxs("div", { children: [_jsx("h6", { className: "text-[14px] font-bold text-[var(--adaptive-black900)]", children: onboarding.restoreTitle }), _jsx("p", { className: "mt-[4px] text-[12px] leading-[1.5] text-[var(--adaptive-black600)]", children: onboarding.restoreDescription })] }), _jsxs("div", { onDragOver: handleDragOver, onDragLeave: handleDragLeave, onDrop: (event) => void handleDrop(event), className: `relative rounded-[8px] transition-colors ${isDragOver ? "ring-2 ring-[var(--adaptive-blue500)]" : ""}`, children: [_jsx("textarea", { autoFocus: true, value: backupKey, onChange: (event) => {
                                setBackupKey(event.target.value);
                                setRestoreError("");
                            }, placeholder: onboarding.restorePlaceholder, rows: 3, className: "w-full resize-none rounded-[8px] border border-[var(--adaptive-border-subtle)] bg-[var(--adaptive-surface)] px-[10px] py-[8px] text-[12px] text-[var(--adaptive-text-primary)] outline-none" }), isDragOver ? (_jsx("div", { className: "pointer-events-none absolute inset-0 flex items-center justify-center rounded-[8px] bg-[var(--adaptive-blue100)]/80 text-[12px] font-semibold text-[var(--adaptive-blue500)]", children: onboarding.restoreDropActive })) : null] }), _jsx("p", { className: "text-[11px] text-[var(--adaptive-black500)]", children: onboarding.restoreDropHint }), restoreError ? _jsx("p", { className: "text-[12px] text-rose-700", children: restoreError }) : null, _jsxs("div", { className: "flex items-center justify-between", children: [_jsx("button", { type: "button", onClick: () => setStep("intro"), className: "text-[12px] font-semibold text-[var(--adaptive-black500)] hover:text-[var(--adaptive-black700)]", children: onboarding.back }), _jsx("button", { type: "button", disabled: !backupKey.trim() || isRestoring, onClick: () => void handleRestore(), className: "rounded-[8px] bg-[var(--adaptive-blue100)] px-[12px] py-[6px] text-[12px] font-bold text-[var(--adaptive-blue500)] disabled:opacity-50", children: onboarding.restoreAction })] })] })) : step === "role" ? (_jsxs(_Fragment, { children: [_jsxs("div", { children: [_jsx("h6", { className: "text-[14px] font-bold text-[var(--adaptive-black900)]", children: onboarding.roleStepTitle }), _jsx("p", { className: "mt-[4px] text-[12px] leading-[1.5] text-[var(--adaptive-black600)]", children: onboarding.roleStepDescription })] }), _jsx("div", { className: "overflow-hidden rounded-[10px] border border-[var(--adaptive-black200)]", children: PANEL_ROLE_VALUES.map((role) => (_jsx(PanelDropdownMenuItem, { active: role === panelRole, onClick: () => handleSelectRole(role), children: messages.panel.roles[role] }, role))) }), _jsx(PanelTabSelector, { role: panelRole, selectedTabs: selectedTabs, context: resolvedTabAvailabilityContext, messages: messages, onChange: setSelectedTabs }), _jsx("p", { className: "text-[11px] text-[var(--adaptive-black500)]", children: onboarding.roleStepTabsHint }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsx("button", { type: "button", onClick: () => setStep("intro"), className: "text-[12px] font-semibold text-[var(--adaptive-black500)] hover:text-[var(--adaptive-black700)]", children: onboarding.back }), _jsx("button", { type: "button", disabled: !canProceedFromRoleStep, onClick: () => setStep("appearance"), className: "rounded-[8px] bg-[var(--adaptive-blue100)] px-[12px] py-[6px] text-[12px] font-bold text-[var(--adaptive-blue500)] disabled:opacity-50", children: onboarding.next })] })] })) : step === "appearance" ? (_jsxs(_Fragment, { children: [_jsxs("div", { children: [_jsx("h6", { className: "text-[14px] font-bold text-[var(--adaptive-black900)]", children: onboarding.appearanceStepTitle }), _jsx("p", { className: "mt-[4px] text-[12px] leading-[1.5] text-[var(--adaptive-black600)]", children: onboarding.appearanceStepDescription })] }), _jsx(AppearanceThemePicker, { options: appearanceOptions, value: panelAppearance, onChange: setPanelAppearance, ariaLabel: messages.moreMenu.panelThemeAriaLabel }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsx("button", { type: "button", onClick: () => setStep("role"), className: "text-[12px] font-semibold text-[var(--adaptive-black500)] hover:text-[var(--adaptive-black700)]", children: onboarding.back }), _jsx("button", { type: "button", onClick: () => setStep("display"), className: "rounded-[8px] bg-[var(--adaptive-blue100)] px-[12px] py-[6px] text-[12px] font-bold text-[var(--adaptive-blue500)]", children: onboarding.next })] })] })) : step === "display" ? (_jsxs(_Fragment, { children: [_jsxs("div", { children: [_jsx("h6", { className: "text-[14px] font-bold text-[var(--adaptive-black900)]", children: onboarding.displayStepTitle }), _jsx("p", { className: "mt-[4px] text-[12px] leading-[1.5] text-[var(--adaptive-black600)]", children: onboarding.displayStepDescription })] }), _jsx(MarkerSizePreview, { size: markerAppearance.size, fontSize: typography.fontSize, shape: markerAppearance.shape, color: markerAppearance.colors.open, fontFamily: typography.fontFamily, ariaLabel: onboarding.displayPreviewAriaLabel }), _jsxs("div", { className: "flex flex-col gap-[12px]", children: [_jsxs("div", { children: [_jsx("p", { className: "mb-[6px] text-[11px] font-medium text-[var(--adaptive-black600)]", children: messages.settings.markerSize }), _jsx(DiscreteScaleDial, { values: APPEARANCE_SCALE_VALUES, value: markerAppearance.size, onChange: setMarkerSize, labels: scaleLabels, ariaLabel: messages.settings.markerSizeAriaLabel })] }), _jsxs("div", { children: [_jsx("p", { className: "mb-[6px] text-[11px] font-medium text-[var(--adaptive-black600)]", children: messages.settings.markerFontSize }), _jsx(DiscreteScaleDial, { values: MARKER_FONT_SIZE_VALUES, value: typography.fontSize, onChange: setFontSize, labels: markerFontSizeLabels, ariaLabel: messages.settings.markerFontSizeAriaLabel })] })] }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsx("button", { type: "button", onClick: () => setStep("appearance"), className: "text-[12px] font-semibold text-[var(--adaptive-black500)] hover:text-[var(--adaptive-black700)]", children: onboarding.back }), _jsx("button", { type: "button", onClick: () => setStep("key"), className: "rounded-[8px] bg-[var(--adaptive-blue100)] px-[12px] py-[6px] text-[12px] font-bold text-[var(--adaptive-blue500)]", children: onboarding.next })] })] })) : (_jsxs(_Fragment, { children: [_jsxs("div", { children: [_jsx("h6", { className: "text-[14px] font-bold text-[var(--adaptive-black900)]", children: onboarding.keyStepTitle }), _jsx("p", { className: "mt-[4px] text-[12px] leading-[1.5] text-[var(--adaptive-black600)]", children: onboarding.keyStepDescription })] }), _jsx("input", { autoFocus: true, value: name, onChange: (event) => setName(event.target.value), placeholder: onboarding.namePlaceholder, className: "w-full rounded-[8px] border border-[var(--adaptive-border-subtle)] bg-[var(--adaptive-surface)] px-[10px] py-[8px] text-[12px] text-[var(--adaptive-text-primary)] outline-none" }), hasDuplicateName ? _jsx("p", { className: "text-[12px] text-rose-700", children: onboarding.duplicateNameError }) : null, _jsxs("div", { className: "flex items-center justify-between", children: [_jsx("button", { type: "button", onClick: () => setStep("display"), className: "text-[12px] font-semibold text-[var(--adaptive-black500)] hover:text-[var(--adaptive-black700)]", children: onboarding.back }), _jsx("button", { type: "button", disabled: !trimmedName || isCreating || hasDuplicateName, onClick: () => void handleCreateKey(), className: "rounded-[8px] bg-[var(--adaptive-blue100)] px-[12px] py-[6px] text-[12px] font-bold text-[var(--adaptive-blue500)] disabled:opacity-50", children: onboarding.createKey })] })] })) }));
}
//# sourceMappingURL=PanelOnboarding.js.map