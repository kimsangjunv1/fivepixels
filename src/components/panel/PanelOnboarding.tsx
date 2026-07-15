import { useMemo, useState, type DragEvent } from "react";
import { APPEARANCE_OPTION_VALUES } from "@/constants/appearance.js";
import { APPEARANCE_SCALE_VALUES, MARKER_FONT_SIZE_VALUES, type AppearanceScale, type MarkerFontSize } from "@/constants/markerAppearance.js";
import { PANEL_ROLE_VALUES, type PanelRole } from "@/constants/panelRole.js";
import type { UserSelectablePanelTab } from "@/constants/panelTabRegistry.js";
import type { ReportLocale } from "@/i18n/types.js";
import { useReportPreferences, useReportSession } from "@/providers/reportContext.js";
import { getDefaultVisibleTabsForRole } from "@/utils/panel/panelTabPreference.js";
import { isPersonalKeyFile, readPersonalKeyFile } from "@/utils/feedback/feedbackDataTransfer.js";
import { AppearanceThemePicker } from "./AppearanceThemePicker.js";
import { DiscreteScaleDial } from "./DiscreteScaleDial.js";
import { MarkerSizePreview } from "./MarkerSizePreview.js";
import { PanelDropdownMenuItem } from "./PanelDropdownMenu.js";
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
        <section className="flex flex-col gap-[12px] bg-[var(--adaptive-black50)] p-[16px]">
            {step === "language" ? (
                <>
                    <div>
                        <h6 className="text-[14px] font-bold text-[var(--adaptive-black900)]">{onboarding.languageStepTitle}</h6>
                        <p className="mt-[4px] text-[12px] leading-[1.5] text-[var(--adaptive-black600)]">{onboarding.languageStepDescription}</p>
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
                            className="rounded-[8px] bg-[var(--adaptive-blue100)] px-[12px] py-[6px] text-[12px] font-bold text-[var(--adaptive-blue500)]"
                        >
                            {onboarding.next}
                        </button>
                    </div>
                </>
            ) : step === "intro" ? (
                <>
                    <div>
                        <h6 className="text-[14px] font-bold text-[var(--adaptive-black900)]">{onboarding.introTitle}</h6>
                        <p className="mt-[4px] text-[12px] leading-[1.5] text-[var(--adaptive-black600)]">{onboarding.introDescription}</p>
                    </div>

                    <div className="flex flex-col gap-[8px]">
                        <button
                            type="button"
                            onClick={() => setStep("role")}
                            className="rounded-[8px] bg-[var(--adaptive-blue100)] px-[12px] py-[10px] text-[12px] font-bold text-[var(--adaptive-blue500)]"
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
                            className="text-[12px] font-semibold text-[var(--adaptive-black500)] hover:text-[var(--adaptive-black700)]"
                        >
                            {onboarding.back}
                        </button>
                    </div>
                </>
            ) : step === "restore" ? (
                <>
                    <div>
                        <h6 className="text-[14px] font-bold text-[var(--adaptive-black900)]">{onboarding.restoreTitle}</h6>
                        <p className="mt-[4px] text-[12px] leading-[1.5] text-[var(--adaptive-black600)]">{onboarding.restoreDescription}</p>
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
                            className="text-[12px] font-semibold text-[var(--adaptive-black500)] hover:text-[var(--adaptive-black700)]"
                        >
                            {onboarding.back}
                        </button>
                        <button
                            type="button"
                            disabled={!backupKey.trim() || isRestoring}
                            onClick={() => void handleRestore()}
                            className="rounded-[8px] bg-[var(--adaptive-blue100)] px-[12px] py-[6px] text-[12px] font-bold text-[var(--adaptive-blue500)] disabled:opacity-50"
                        >
                            {onboarding.restoreAction}
                        </button>
                    </div>
                </>
            ) : step === "role" ? (
                <>
                    <div>
                        <h6 className="text-[14px] font-bold text-[var(--adaptive-black900)]">{onboarding.roleStepTitle}</h6>
                        <p className="mt-[4px] text-[12px] leading-[1.5] text-[var(--adaptive-black600)]">{onboarding.roleStepDescription}</p>
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
                            className="text-[12px] font-semibold text-[var(--adaptive-black500)] hover:text-[var(--adaptive-black700)]"
                        >
                            {onboarding.back}
                        </button>
                        <button
                            type="button"
                            disabled={!canProceedFromRoleStep}
                            onClick={() => setStep("appearance")}
                            className="rounded-[8px] bg-[var(--adaptive-blue100)] px-[12px] py-[6px] text-[12px] font-bold text-[var(--adaptive-blue500)] disabled:opacity-50"
                        >
                            {onboarding.next}
                        </button>
                    </div>
                </>
            ) : step === "appearance" ? (
                <>
                    <div>
                        <h6 className="text-[14px] font-bold text-[var(--adaptive-black900)]">{onboarding.appearanceStepTitle}</h6>
                        <p className="mt-[4px] text-[12px] leading-[1.5] text-[var(--adaptive-black600)]">{onboarding.appearanceStepDescription}</p>
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
                            className="text-[12px] font-semibold text-[var(--adaptive-black500)] hover:text-[var(--adaptive-black700)]"
                        >
                            {onboarding.back}
                        </button>
                        <button
                            type="button"
                            onClick={() => setStep("display")}
                            className="rounded-[8px] bg-[var(--adaptive-blue100)] px-[12px] py-[6px] text-[12px] font-bold text-[var(--adaptive-blue500)]"
                        >
                            {onboarding.next}
                        </button>
                    </div>
                </>
            ) : step === "display" ? (
                <>
                    <div>
                        <h6 className="text-[14px] font-bold text-[var(--adaptive-black900)]">{onboarding.displayStepTitle}</h6>
                        <p className="mt-[4px] text-[12px] leading-[1.5] text-[var(--adaptive-black600)]">{onboarding.displayStepDescription}</p>
                    </div>

                    <MarkerSizePreview
                        size={markerAppearance.size}
                        fontSize={typography.fontSize}
                        shape={markerAppearance.shape}
                        color={markerAppearance.colors.open}
                        fontFamily={typography.fontFamily}
                        ariaLabel={onboarding.displayPreviewAriaLabel}
                    />
                    <div className="flex flex-col gap-[12px]">
                        <div>
                            <p className="mb-[6px] text-[11px] font-medium text-[var(--adaptive-black600)]">{messages.settings.markerSize}</p>
                            <DiscreteScaleDial
                                values={APPEARANCE_SCALE_VALUES}
                                value={markerAppearance.size}
                                onChange={setMarkerSize}
                                labels={scaleLabels}
                                ariaLabel={messages.settings.markerSizeAriaLabel}
                            />
                        </div>
                        <div>
                            <p className="mb-[6px] text-[11px] font-medium text-[var(--adaptive-black600)]">{messages.settings.markerFontSize}</p>
                            <DiscreteScaleDial
                                values={MARKER_FONT_SIZE_VALUES}
                                value={typography.fontSize}
                                onChange={setFontSize}
                                labels={markerFontSizeLabels}
                                ariaLabel={messages.settings.markerFontSizeAriaLabel}
                            />
                        </div>
                    </div>
                    <div className="flex items-center justify-between">
                        <button
                            type="button"
                            onClick={() => setStep("appearance")}
                            className="text-[12px] font-semibold text-[var(--adaptive-black500)] hover:text-[var(--adaptive-black700)]"
                        >
                            {onboarding.back}
                        </button>
                        <button
                            type="button"
                            onClick={() => setStep("key")}
                            className="rounded-[8px] bg-[var(--adaptive-blue100)] px-[12px] py-[6px] text-[12px] font-bold text-[var(--adaptive-blue500)]"
                        >
                            {onboarding.next}
                        </button>
                    </div>
                </>
            ) : (
                <>
                    <div>
                        <h6 className="text-[14px] font-bold text-[var(--adaptive-black900)]">{onboarding.keyStepTitle}</h6>
                        <p className="mt-[4px] text-[12px] leading-[1.5] text-[var(--adaptive-black600)]">{onboarding.keyStepDescription}</p>
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
                            className="text-[12px] font-semibold text-[var(--adaptive-black500)] hover:text-[var(--adaptive-black700)]"
                        >
                            {onboarding.back}
                        </button>

                        <button
                            type="button"
                            disabled={!trimmedName || isCreating || hasDuplicateName}
                            onClick={() => void handleCreateKey()}
                            className="rounded-[8px] bg-[var(--adaptive-blue100)] px-[12px] py-[6px] text-[12px] font-bold text-[var(--adaptive-blue500)] disabled:opacity-50"
                        >
                            {onboarding.createKey}
                        </button>
                    </div>
                </>
            )}
        </section>
    );
}
