import { useMemo, useState, type DragEvent } from "react";
import { APPEARANCE_OPTION_VALUES } from "@/constants/appearance.js";
import { type AppearanceScale, type MarkerFontSize } from "@/constants/markerAppearance.js";
import { PANEL_ROLE_VALUES, type PanelRole } from "@/constants/panelRole.js";
import type { UserSelectablePanelTab } from "@/constants/panelTabRegistry.js";
import type { ReportLocale } from "@/i18n/types.js";
import { useReportPreferences, useReportSession } from "@/providers/reportContext.js";
import { getDefaultVisibleTabsForRole } from "@/utils/panel/panelTabPreference.js";
import { isPersonalKeyFile, readPersonalKeyFile } from "@/utils/feedback/feedbackDataTransfer.js";
import { AppearanceThemePicker } from "./AppearanceThemePicker.js";
import { MarkerSizePreview } from "./MarkerSizePreview.js";
import { PanelDropdownMenuItem } from "./PanelDropdownMenu.js";
import {
    PANEL_GATE_BACK_BUTTON_CLASS,
    PANEL_GATE_DESCRIPTION_CLASS,
    PANEL_GATE_PRIMARY_BUTTON_CLASS,
    PANEL_GATE_SECTION_CLASS,
    PANEL_GATE_TITLE_CLASS,
} from "./PanelGateShell.js";
import { PanelMarkerDisplayControls } from "./PanelMarkerDisplayControls.js";
import { PanelOptionSwitch } from "./PanelOptionSwitch.js";
import { PanelTabSelector } from "./PanelTabSelector.js";

type OnboardingStep = "language" | "intro" | "restore" | "role" | "appearance" | "display" | "key";

const LOCALE_OPTIONS = ["en", "ko"] as const satisfies readonly ReportLocale[];

export function PanelOnboarding() {
    const {
        messages,
        locale,
        setLocale,
        panelAppearance,
        setPanelAppearance,
        markerAppearance,
        setMarkerSize,
        typography,
        setFontSize,
        panelRole,
        setPanelRole,
        completeOnboarding,
        restoreFromBackup,
        selfProfile,
        personalKeyCandidates,
        resolvedTabAvailabilityContext,
        savePanelTabPreference,
    } = useReportPreferences();
    const { setErrorMessage } = useReportSession();
    const onboarding = messages.onboarding;
    const [step, setStep] = useState<OnboardingStep>("language");
    const [name, setName] = useState(selfProfile?.name ?? "");
    const [selectedTabs, setSelectedTabs] = useState<UserSelectablePanelTab[]>(() => getDefaultVisibleTabsForRole(panelRole, resolvedTabAvailabilityContext));
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
    const scaleLabels: Record<AppearanceScale, string> = {
        sm: messages.settings.scaleSm,
        md: messages.settings.scaleMd,
        lg: messages.settings.scaleLg,
        xl: messages.settings.scaleXl,
    };
    const markerFontSizeLabels: Record<MarkerFontSize, string> = {
        none: messages.settings.scaleNone,
        ...scaleLabels,
    };

    const handleSelectRole = (role: PanelRole) => {
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
        } catch {
            setErrorMessage(messages.errors.clipboardCopyFailed);
        } finally {
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
                } else if (result.reason === "project-mismatch") {
                    setRestoreError(messages.personalKey.restoreProjectMismatch);
                } else {
                    setRestoreError(messages.personalKey.invalidKey);
                }
                return;
            }

            if (typeof window !== "undefined") {
                window.location.reload();
            }
        } catch {
            setRestoreError(messages.personalKey.invalidKey);
        } finally {
            setIsRestoring(false);
        }
    };

    const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
        if (!Array.from(event.dataTransfer.types).includes("Files")) {
            return;
        }

        event.preventDefault();
        setIsDragOver(true);
    };

    const handleDragLeave = (event: DragEvent<HTMLDivElement>) => {
        if (event.currentTarget.contains(event.relatedTarget as Node | null)) {
            return;
        }

        setIsDragOver(false);
    };

    const handleDrop = async (event: DragEvent<HTMLDivElement>) => {
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
        } catch {
            setRestoreError(onboarding.restoreDropFailed);
        }
    };

    return (
        <section className={PANEL_GATE_SECTION_CLASS}>
            {step === "language" ? (
                <>
                    <div>
                        <h6 className={PANEL_GATE_TITLE_CLASS}>{onboarding.languageStepTitle}</h6>
                        <p className={PANEL_GATE_DESCRIPTION_CLASS}>{onboarding.languageStepDescription}</p>
                    </div>

                    <PanelOptionSwitch
                        options={localeOptions}
                        value={locale}
                        onChange={setLocale}
                        ariaLabel={messages.moreMenu.languageAriaLabel}
                    />

                    <div className="flex items-center justify-end">
                        <button
                            type="button"
                            onClick={() => setStep("intro")}
                            className={PANEL_GATE_PRIMARY_BUTTON_CLASS}
                        >
                            {onboarding.next}
                        </button>
                    </div>
                </>
            ) : step === "intro" ? (
                <>
                    <div>
                        <h6 className={PANEL_GATE_TITLE_CLASS}>{onboarding.introTitle}</h6>
                        <p className={PANEL_GATE_DESCRIPTION_CLASS}>{onboarding.introDescription}</p>
                    </div>

                    <div className="flex flex-col gap-[8px]">
                        <button
                            type="button"
                            onClick={() => setStep("role")}
                            className={`${PANEL_GATE_PRIMARY_BUTTON_CLASS} py-[10px]`}
                        >
                            {onboarding.newUser}
                        </button>
                        <button
                            type="button"
                            onClick={() => setStep("restore")}
                            className="rounded-[8px] border border-[var(--adaptive-black200)] px-[12px] py-[10px] text-[12px] font-semibold text-[var(--adaptive-black700)] hover:bg-[var(--adaptive-black100)]"
                        >
                            {onboarding.existingUser}
                        </button>
                    </div>

                    <div className="flex items-center justify-start">
                        <button
                            type="button"
                            onClick={() => setStep("language")}
                            className={PANEL_GATE_BACK_BUTTON_CLASS}
                        >
                            {onboarding.back}
                        </button>
                    </div>
                </>
            ) : step === "restore" ? (
                <>
                    <div>
                        <h6 className={PANEL_GATE_TITLE_CLASS}>{onboarding.restoreTitle}</h6>
                        <p className={PANEL_GATE_DESCRIPTION_CLASS}>{onboarding.restoreDescription}</p>
                    </div>

                    <div
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={(event) => void handleDrop(event)}
                        className={`relative rounded-[8px] transition-colors ${isDragOver ? "ring-2 ring-[var(--adaptive-blue500)]" : ""}`}
                    >
                        <textarea
                            autoFocus
                            value={backupKey}
                            onChange={(event) => {
                                setBackupKey(event.target.value);
                                setRestoreError("");
                            }}
                            placeholder={onboarding.restorePlaceholder}
                            rows={3}
                            className="w-full resize-none rounded-[8px] border border-[var(--adaptive-border-subtle)] bg-[var(--adaptive-surface)] px-[10px] py-[8px] text-[12px] text-[var(--adaptive-text-primary)] outline-none"
                        />
                        {isDragOver ? (
                            <div className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-[8px] bg-[var(--adaptive-blue100)]/80 text-[12px] font-semibold text-[var(--adaptive-blue500)]">
                                {onboarding.restoreDropActive}
                            </div>
                        ) : null}
                    </div>

                    <p className="text-[11px] text-[var(--adaptive-black500)]">{onboarding.restoreDropHint}</p>

                    {restoreError ? <p className="text-[12px] text-rose-700">{restoreError}</p> : null}

                    <div className="flex items-center justify-between">
                        <button
                            type="button"
                            onClick={() => setStep("intro")}
                            className={PANEL_GATE_BACK_BUTTON_CLASS}
                        >
                            {onboarding.back}
                        </button>
                        <button
                            type="button"
                            disabled={!backupKey.trim() || isRestoring}
                            onClick={() => void handleRestore()}
                            className={PANEL_GATE_PRIMARY_BUTTON_CLASS}
                        >
                            {onboarding.restoreAction}
                        </button>
                    </div>
                </>
            ) : step === "role" ? (
                <>
                    <div>
                        <h6 className={PANEL_GATE_TITLE_CLASS}>{onboarding.roleStepTitle}</h6>
                        <p className={PANEL_GATE_DESCRIPTION_CLASS}>{onboarding.roleStepDescription}</p>
                    </div>

                    <div className="overflow-hidden rounded-[10px] border border-[var(--adaptive-black200)]">
                        {PANEL_ROLE_VALUES.map((role) => (
                            <PanelDropdownMenuItem
                                key={role}
                                active={role === panelRole}
                                onClick={() => handleSelectRole(role)}
                            >
                                {messages.panel.roles[role]}
                            </PanelDropdownMenuItem>
                        ))}
                    </div>

                    <PanelTabSelector
                        role={panelRole}
                        selectedTabs={selectedTabs}
                        context={resolvedTabAvailabilityContext}
                        messages={messages}
                        onChange={setSelectedTabs}
                    />

                    <p className="text-[11px] text-[var(--adaptive-black500)]">{onboarding.roleStepTabsHint}</p>

                    <div className="flex items-center justify-between">
                        <button
                            type="button"
                            onClick={() => setStep("intro")}
                            className={PANEL_GATE_BACK_BUTTON_CLASS}
                        >
                            {onboarding.back}
                        </button>
                        <button
                            type="button"
                            disabled={!canProceedFromRoleStep}
                            onClick={() => setStep("appearance")}
                            className={PANEL_GATE_PRIMARY_BUTTON_CLASS}
                        >
                            {onboarding.next}
                        </button>
                    </div>
                </>
            ) : step === "appearance" ? (
                <>
                    <div>
                        <h6 className={PANEL_GATE_TITLE_CLASS}>{onboarding.appearanceStepTitle}</h6>
                        <p className={PANEL_GATE_DESCRIPTION_CLASS}>{onboarding.appearanceStepDescription}</p>
                    </div>

                    <AppearanceThemePicker
                        options={appearanceOptions}
                        value={panelAppearance}
                        onChange={setPanelAppearance}
                        ariaLabel={messages.moreMenu.panelThemeAriaLabel}
                    />

                    <div className="flex items-center justify-between">
                        <button
                            type="button"
                            onClick={() => setStep("role")}
                            className={PANEL_GATE_BACK_BUTTON_CLASS}
                        >
                            {onboarding.back}
                        </button>
                        <button
                            type="button"
                            onClick={() => setStep("display")}
                            className={PANEL_GATE_PRIMARY_BUTTON_CLASS}
                        >
                            {onboarding.next}
                        </button>
                    </div>
                </>
            ) : step === "display" ? (
                <>
                    <div>
                        <h6 className={PANEL_GATE_TITLE_CLASS}>{onboarding.displayStepTitle}</h6>
                        <p className={PANEL_GATE_DESCRIPTION_CLASS}>{onboarding.displayStepDescription}</p>
                    </div>

                    <MarkerSizePreview
                        size={markerAppearance.size}
                        fontSize={typography.fontSize}
                        shape={markerAppearance.shape}
                        color={markerAppearance.colors.open}
                        fontFamily={typography.fontFamily}
                        ariaLabel={onboarding.displayPreviewAriaLabel}
                    />
                    <PanelMarkerDisplayControls
                        markerSize={markerAppearance.size}
                        fontSize={typography.fontSize}
                        onMarkerSizeChange={setMarkerSize}
                        onFontSizeChange={setFontSize}
                        scaleLabels={scaleLabels}
                        markerFontSizeLabels={markerFontSizeLabels}
                        markerSizeLabel={messages.settings.markerSize}
                        markerFontSizeLabel={messages.settings.markerFontSize}
                        markerSizeAriaLabel={messages.settings.markerSizeAriaLabel}
                        markerFontSizeAriaLabel={messages.settings.markerFontSizeAriaLabel}
                    />
                    <div className="flex items-center justify-between">
                        <button
                            type="button"
                            onClick={() => setStep("appearance")}
                            className={PANEL_GATE_BACK_BUTTON_CLASS}
                        >
                            {onboarding.back}
                        </button>
                        <button
                            type="button"
                            onClick={() => setStep("key")}
                            className={PANEL_GATE_PRIMARY_BUTTON_CLASS}
                        >
                            {onboarding.next}
                        </button>
                    </div>
                </>
            ) : (
                <>
                    <div>
                        <h6 className={PANEL_GATE_TITLE_CLASS}>{onboarding.keyStepTitle}</h6>
                        <p className={PANEL_GATE_DESCRIPTION_CLASS}>{onboarding.keyStepDescription}</p>
                    </div>
                    <input
                        autoFocus
                        value={name}
                        onChange={(event) => setName(event.target.value)}
                        placeholder={onboarding.namePlaceholder}
                        className="w-full rounded-[8px] border border-[var(--adaptive-border-subtle)] bg-[var(--adaptive-surface)] px-[10px] py-[8px] text-[12px] text-[var(--adaptive-text-primary)] outline-none"
                    />

                    {hasDuplicateName ? <p className="text-[12px] text-rose-700">{onboarding.duplicateNameError}</p> : null}

                    <div className="flex items-center justify-between">
                        <button
                            type="button"
                            onClick={() => setStep("display")}
                            className={PANEL_GATE_BACK_BUTTON_CLASS}
                        >
                            {onboarding.back}
                        </button>

                        <button
                            type="button"
                            disabled={!trimmedName || isCreating || hasDuplicateName}
                            onClick={() => void handleCreateKey()}
                            className={PANEL_GATE_PRIMARY_BUTTON_CLASS}
                        >
                            {onboarding.createKey}
                        </button>
                    </div>
                </>
            )}
        </section>
    );
}
