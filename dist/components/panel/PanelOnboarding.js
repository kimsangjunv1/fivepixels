import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useMemo, useState } from "react";
import { APPEARANCE_OPTION_VALUES } from "../../constants/appearance.js";
import { PANEL_ROLE_VALUES } from "../../constants/panelRole.js";
import { useReportPreferences, useReportSession } from "../../providers/reportContext.js";
import { getDefaultVisibleTabsForRole } from "../../utils/panel/panelTabPreference.js";
import { isPersonalKeyFile, readPersonalKeyFile } from "../../utils/feedback/feedbackDataTransfer.js";
import { AppearanceThemePicker } from "./AppearanceThemePicker.js";
import { MarkerSizePreview } from "./MarkerSizePreview.js";
import { PanelDropdownMenuItem } from "./PanelDropdownMenu.js";
import { PANEL_GATE_BACK_BUTTON_CLASS, PANEL_GATE_DESCRIPTION_CLASS, PANEL_GATE_PRIMARY_BUTTON_CLASS, PANEL_GATE_SECTION_CLASS, PANEL_GATE_TITLE_CLASS, } from "./PanelGateShell.js";
import { PanelMarkerDisplayControls } from "./PanelMarkerDisplayControls.js";
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
    return (_jsx("section", { className: PANEL_GATE_SECTION_CLASS, children: step === "language" ? (_jsxs(_Fragment, { children: [_jsxs("div", { children: [_jsx("h6", { className: PANEL_GATE_TITLE_CLASS, children: onboarding.languageStepTitle }), _jsx("p", { className: PANEL_GATE_DESCRIPTION_CLASS, children: onboarding.languageStepDescription })] }), _jsx(PanelOptionSwitch, { options: localeOptions, value: locale, onChange: setLocale, ariaLabel: messages.moreMenu.languageAriaLabel }), _jsx("div", { className: "flex items-center justify-end", children: _jsx("button", { type: "button", onClick: () => setStep("intro"), className: PANEL_GATE_PRIMARY_BUTTON_CLASS, children: onboarding.next }) })] })) : step === "intro" ? (_jsxs(_Fragment, { children: [_jsxs("div", { children: [_jsx("h6", { className: PANEL_GATE_TITLE_CLASS, children: onboarding.introTitle }), _jsx("p", { className: PANEL_GATE_DESCRIPTION_CLASS, children: onboarding.introDescription })] }), _jsxs("div", { className: "flex flex-col gap-[8px]", children: [_jsx("button", { type: "button", onClick: () => setStep("role"), className: `${PANEL_GATE_PRIMARY_BUTTON_CLASS} py-[10px]`, children: onboarding.newUser }), _jsx("button", { type: "button", onClick: () => setStep("restore"), className: "rounded-[8px] border border-[var(--adaptive-black200)] px-[12px] py-[10px] text-[12px] font-semibold text-[var(--adaptive-black700)] hover:bg-[var(--adaptive-black100)]", children: onboarding.existingUser })] }), _jsx("div", { className: "flex items-center justify-start", children: _jsx("button", { type: "button", onClick: () => setStep("language"), className: PANEL_GATE_BACK_BUTTON_CLASS, children: onboarding.back }) })] })) : step === "restore" ? (_jsxs(_Fragment, { children: [_jsxs("div", { children: [_jsx("h6", { className: PANEL_GATE_TITLE_CLASS, children: onboarding.restoreTitle }), _jsx("p", { className: PANEL_GATE_DESCRIPTION_CLASS, children: onboarding.restoreDescription })] }), _jsxs("div", { onDragOver: handleDragOver, onDragLeave: handleDragLeave, onDrop: (event) => void handleDrop(event), className: `relative rounded-[8px] transition-colors ${isDragOver ? "ring-2 ring-[var(--adaptive-blue500)]" : ""}`, children: [_jsx("textarea", { autoFocus: true, value: backupKey, onChange: (event) => {
                                setBackupKey(event.target.value);
                                setRestoreError("");
                            }, placeholder: onboarding.restorePlaceholder, rows: 3, className: "w-full resize-none rounded-[8px] border border-[var(--adaptive-border-subtle)] bg-[var(--adaptive-surface)] px-[10px] py-[8px] text-[12px] text-[var(--adaptive-text-primary)] outline-none" }), isDragOver ? (_jsx("div", { className: "pointer-events-none absolute inset-0 flex items-center justify-center rounded-[8px] bg-[var(--adaptive-blue100)]/80 text-[12px] font-semibold text-[var(--adaptive-blue500)]", children: onboarding.restoreDropActive })) : null] }), _jsx("p", { className: "text-[11px] text-[var(--adaptive-black500)]", children: onboarding.restoreDropHint }), restoreError ? _jsx("p", { className: "text-[12px] text-rose-700", children: restoreError }) : null, _jsxs("div", { className: "flex items-center justify-between", children: [_jsx("button", { type: "button", onClick: () => setStep("intro"), className: PANEL_GATE_BACK_BUTTON_CLASS, children: onboarding.back }), _jsx("button", { type: "button", disabled: !backupKey.trim() || isRestoring, onClick: () => void handleRestore(), className: PANEL_GATE_PRIMARY_BUTTON_CLASS, children: onboarding.restoreAction })] })] })) : step === "role" ? (_jsxs(_Fragment, { children: [_jsxs("div", { children: [_jsx("h6", { className: PANEL_GATE_TITLE_CLASS, children: onboarding.roleStepTitle }), _jsx("p", { className: PANEL_GATE_DESCRIPTION_CLASS, children: onboarding.roleStepDescription })] }), _jsx("div", { className: "overflow-hidden rounded-[10px] border border-[var(--adaptive-black200)]", children: PANEL_ROLE_VALUES.map((role) => (_jsx(PanelDropdownMenuItem, { active: role === panelRole, onClick: () => handleSelectRole(role), children: messages.panel.roles[role] }, role))) }), _jsx(PanelTabSelector, { role: panelRole, selectedTabs: selectedTabs, context: resolvedTabAvailabilityContext, messages: messages, onChange: setSelectedTabs }), _jsx("p", { className: "text-[11px] text-[var(--adaptive-black500)]", children: onboarding.roleStepTabsHint }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsx("button", { type: "button", onClick: () => setStep("intro"), className: PANEL_GATE_BACK_BUTTON_CLASS, children: onboarding.back }), _jsx("button", { type: "button", disabled: !canProceedFromRoleStep, onClick: () => setStep("appearance"), className: PANEL_GATE_PRIMARY_BUTTON_CLASS, children: onboarding.next })] })] })) : step === "appearance" ? (_jsxs(_Fragment, { children: [_jsxs("div", { children: [_jsx("h6", { className: PANEL_GATE_TITLE_CLASS, children: onboarding.appearanceStepTitle }), _jsx("p", { className: PANEL_GATE_DESCRIPTION_CLASS, children: onboarding.appearanceStepDescription })] }), _jsx(AppearanceThemePicker, { options: appearanceOptions, value: panelAppearance, onChange: setPanelAppearance, ariaLabel: messages.moreMenu.panelThemeAriaLabel }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsx("button", { type: "button", onClick: () => setStep("role"), className: PANEL_GATE_BACK_BUTTON_CLASS, children: onboarding.back }), _jsx("button", { type: "button", onClick: () => setStep("display"), className: PANEL_GATE_PRIMARY_BUTTON_CLASS, children: onboarding.next })] })] })) : step === "display" ? (_jsxs(_Fragment, { children: [_jsxs("div", { children: [_jsx("h6", { className: PANEL_GATE_TITLE_CLASS, children: onboarding.displayStepTitle }), _jsx("p", { className: PANEL_GATE_DESCRIPTION_CLASS, children: onboarding.displayStepDescription })] }), _jsx(MarkerSizePreview, { size: markerAppearance.size, fontSize: typography.fontSize, shape: markerAppearance.shape, color: markerAppearance.colors.open, fontFamily: typography.fontFamily, ariaLabel: onboarding.displayPreviewAriaLabel }), _jsx(PanelMarkerDisplayControls, { markerSize: markerAppearance.size, fontSize: typography.fontSize, onMarkerSizeChange: setMarkerSize, onFontSizeChange: setFontSize, scaleLabels: scaleLabels, markerFontSizeLabels: markerFontSizeLabels, markerSizeLabel: messages.settings.markerSize, markerFontSizeLabel: messages.settings.markerFontSize, markerSizeAriaLabel: messages.settings.markerSizeAriaLabel, markerFontSizeAriaLabel: messages.settings.markerFontSizeAriaLabel }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsx("button", { type: "button", onClick: () => setStep("appearance"), className: PANEL_GATE_BACK_BUTTON_CLASS, children: onboarding.back }), _jsx("button", { type: "button", onClick: () => setStep("key"), className: PANEL_GATE_PRIMARY_BUTTON_CLASS, children: onboarding.next })] })] })) : (_jsxs(_Fragment, { children: [_jsxs("div", { children: [_jsx("h6", { className: PANEL_GATE_TITLE_CLASS, children: onboarding.keyStepTitle }), _jsx("p", { className: PANEL_GATE_DESCRIPTION_CLASS, children: onboarding.keyStepDescription })] }), _jsx("input", { autoFocus: true, value: name, onChange: (event) => setName(event.target.value), placeholder: onboarding.namePlaceholder, className: "w-full rounded-[8px] border border-[var(--adaptive-border-subtle)] bg-[var(--adaptive-surface)] px-[10px] py-[8px] text-[12px] text-[var(--adaptive-text-primary)] outline-none" }), hasDuplicateName ? _jsx("p", { className: "text-[12px] text-rose-700", children: onboarding.duplicateNameError }) : null, _jsxs("div", { className: "flex items-center justify-between", children: [_jsx("button", { type: "button", onClick: () => setStep("display"), className: PANEL_GATE_BACK_BUTTON_CLASS, children: onboarding.back }), _jsx("button", { type: "button", disabled: !trimmedName || isCreating || hasDuplicateName, onClick: () => void handleCreateKey(), className: PANEL_GATE_PRIMARY_BUTTON_CLASS, children: onboarding.createKey })] })] })) }));
}
//# sourceMappingURL=PanelOnboarding.js.map