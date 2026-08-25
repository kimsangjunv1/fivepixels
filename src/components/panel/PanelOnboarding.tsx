import { useMemo, useState, type DragEvent } from "react";
import { APPEARANCE_OPTION_VALUES } from "@/constants/appearance.js";
import { resolveFivePixelsSync, resolveRequireAuth, usesRemoteAuthLogin, type FivePixelsSync } from "@/constants/loginMethod.js";
import { MARKER_FILL_STYLE_VALUES, type AppearanceScale, type MarkerFillStyle, type MarkerShape } from "@/constants/markerAppearance.js";
import { PANEL_ROLE_VALUES, type PanelRole } from "@/constants/panelRole.js";
import type { UserSelectablePanelTab } from "@/constants/panelTabRegistry.js";
import type { ReportLocale } from "@/i18n/types.js";
import { useReportPreferences, useReportSession } from "@/providers/reportContext.js";
import { getDefaultVisibleTabsForRole } from "@/utils/panel/panelTabPreference.js";
import { ReportAuthError, resolveRegistrationError } from "@/utils/auth/reportAuthError.js";
import { isPersonalKeyFile, readPersonalKeyFile } from "@/utils/feedback/feedbackDataTransfer.js";
import { hasTeamRequestHandler, isTeamWriteEnabled } from "@/utils/report/teamManagement.js";
import { AppearanceThemePicker } from "./AppearanceThemePicker.js";
import { MarkerShapePicker } from "./MarkerShapePicker.js";
import { MarkerSizePreview } from "./MarkerSizePreview.js";
import { PanelDropdownMenuItem } from "./PanelDropdownMenu.js";
import {
    PANEL_GATE_BACK_BUTTON_CLASS,
    PANEL_GATE_DESCRIPTION_CLASS,
    PANEL_GATE_INPUT_CLASS,
    PANEL_GATE_PRIMARY_BUTTON_CLASS,
    PANEL_GATE_SECTION_CLASS,
    PANEL_GATE_TITLE_CLASS,
} from "./PanelGateShell.js";
import { PanelMarkerDisplayControls } from "./PanelMarkerDisplayControls.js";
import { PanelOptionSwitch } from "./PanelOptionSwitch.js";
import { PanelTabSelector } from "./PanelTabSelector.js";
import {
    ApiLoginStep,
    ApiRegisterResultStep,
    ApiRegisterStep,
    ArtemisLoginStep,
} from "./onboarding/PanelOnboardingAuthSteps.js";

type OnboardingStep =
    | "language"
    | "intro"
    | "restore"
    | "api-login"
    | "api-register"
    | "api-register-success"
    | "api-register-error"
    | "artemis-login"
    | "role"
    | "appearance"
    | "display"
    | "key";

const LOCALE_OPTIONS = ["en", "ko"] as const satisfies readonly ReportLocale[];

function getAuthEntryStep(sync: FivePixelsSync, requireAuth: boolean): Extract<OnboardingStep, "intro" | "api-login" | "artemis-login"> {
    if (sync === "api" && requireAuth) {
        return "api-login";
    }
    if (sync === "artemis" && requireAuth) {
        return "artemis-login";
    }
    return "intro";
}

export function PanelOnboarding() {
    const {
        messages,
        locale,
        setLocale,
        panelAppearance,
        setPanelAppearance,
        markerAppearance,
        setMarkerSize,
        setMarkerShape,
        setMarkerFillStyle,
        typography,
        panelRole,
        setPanelRole,
        completeOnboarding,
        restoreFromBackup,
        selfProfile,
        personalKeyCandidates,
        resolvedTabAvailabilityContext,
        savePanelTabPreference,
        persistenceStatus,
        onCreateReviewerRequest,
        loginMethod: storedLoginMethod,
        requireAuth: requireAuthProp,
        loginWithApi,
        registerWithApi,
        loginWithArtemis,
        completeRemoteOnboarding,
    } = useReportPreferences();
    const { setErrorMessage } = useReportSession();
    const onboarding = messages.onboarding;
    const sync = resolveFivePixelsSync(storedLoginMethod);
    const requireAuth = resolveRequireAuth(sync, requireAuthProp);
    const canSubmitRegistrationRequest = isTeamWriteEnabled(persistenceStatus) && hasTeamRequestHandler({ onCreateReviewerRequest });
    const [step, setStep] = useState<OnboardingStep>("language");
    const [name, setName] = useState(selfProfile?.name ?? "");
    const [selectedTabs, setSelectedTabs] = useState<UserSelectablePanelTab[]>(() => getDefaultVisibleTabsForRole(panelRole, resolvedTabAvailabilityContext));
    const [isCreating, setIsCreating] = useState(false);
    const [backupKey, setBackupKey] = useState("");
    const [isRestoring, setIsRestoring] = useState(false);
    const [restoreError, setRestoreError] = useState("");
    const [isDragOver, setIsDragOver] = useState(false);
    const [loginId, setLoginId] = useState("");
    const [password, setPassword] = useState("");
    const [passwordConfirm, setPasswordConfirm] = useState("");
    const [email, setEmail] = useState("");
    const [username, setUsername] = useState("");
    const [authError, setAuthError] = useState("");
    const [registerErrorKind, setRegisterErrorKind] = useState<"invalid-registration" | "account-already-exists" | "unknown">("unknown");
    const [isAuthBusy, setIsAuthBusy] = useState(false);
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
        "2xs": messages.settings.scale2xs,
        xs: messages.settings.scaleXs,
        sm: messages.settings.scaleSm,
        md: messages.settings.scaleMd,
        lg: messages.settings.scaleLg,
        xl: messages.settings.scaleXl,
    };
    const shapeLabels: Record<MarkerShape, string> = {
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
    const fillStyleLabels: Record<MarkerFillStyle, string> = {
        filled: messages.settings.markerFillStyleFilled,
        outlined: messages.settings.markerFillStyleOutlined,
        both: messages.settings.markerFillStyleBoth,
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
            const issued = await completeOnboarding({ name: trimmedName });

            if (canSubmitRegistrationRequest && onCreateReviewerRequest && issued.publicKey && issued.authorId) {
                try {
                    await onCreateReviewerRequest({
                        author_id: issued.authorId,
                        author_name: trimmedName,
                        public_key: issued.publicKey,
                    });
                } catch {
                    setErrorMessage(messages.team.requestFailed);
                }
            }
        } catch {
            setErrorMessage(messages.errors.clipboardCopyFailed);
        } finally {
            setIsCreating(false);
        }
    };

    const goToSharedSetup = () => {
        setStep("role");
    };

    const handleApiLogin = async () => {
        if (!loginId.trim() || !password || isAuthBusy) {
            return;
        }

        setIsAuthBusy(true);
        setAuthError("");

        try {
            await loginWithApi({ loginId: loginId.trim(), password });
            goToSharedSetup();
        } catch (error) {
            setAuthError(error instanceof ReportAuthError && error.code === "auth-unavailable" ? onboarding.authUnavailable : onboarding.loginFailed);
        } finally {
            setIsAuthBusy(false);
        }
    };

    const handleApiRegister = async () => {
        if (isAuthBusy) {
            return;
        }

        if (password !== passwordConfirm) {
            setRegisterErrorKind("invalid-registration");
            setStep("api-register-error");
            return;
        }

        setIsAuthBusy(true);

        try {
            await registerWithApi({
                loginId: loginId.trim(),
                password,
                passwordConfirm,
                email: email.trim(),
                username: username.trim(),
            });
            setStep("api-register-success");
        } catch (error) {
            setRegisterErrorKind(resolveRegistrationError(error));
            setStep("api-register-error");
        } finally {
            setIsAuthBusy(false);
        }
    };

    const handleArtemisLogin = async () => {
        if (isAuthBusy) {
            return;
        }

        setIsAuthBusy(true);
        setAuthError("");

        try {
            await loginWithArtemis();
            goToSharedSetup();
        } catch (error) {
            setAuthError(error instanceof ReportAuthError && error.code === "auth-unavailable" ? onboarding.authUnavailable : onboarding.loginFailed);
        } finally {
            setIsAuthBusy(false);
        }
    };

    const handleFinishSharedSetup = () => {
        if (usesRemoteAuthLogin(sync, requireAuth)) {
            savePanelTabPreference({
                visibleTabs: selectedTabs,
                customized: true,
            });
            completeRemoteOnboarding();
            return;
        }

        setStep("key");
    };

    const sharedSetupBackStep: OnboardingStep = getAuthEntryStep(sync, requireAuth);
    const registerErrorMessage =
        registerErrorKind === "account-already-exists"
            ? onboarding.registerDuplicate
            : registerErrorKind === "invalid-registration"
              ? onboarding.registerInvalid
              : onboarding.registerUnknownError;

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
                            onClick={() => setStep(getAuthEntryStep(sync, requireAuth))}
                            className={PANEL_GATE_PRIMARY_BUTTON_CLASS}
                        >
                            {onboarding.next}
                        </button>
                    </div>
                </>
            ) : step === "api-login" ? (
                <ApiLoginStep
                    copy={onboarding}
                    loginId={loginId}
                    password={password}
                    error={authError}
                    busy={isAuthBusy}
                    onLoginIdChange={(value) => {
                        setLoginId(value);
                        setAuthError("");
                    }}
                    onPasswordChange={(value) => {
                        setPassword(value);
                        setAuthError("");
                    }}
                    onLogin={() => void handleApiLogin()}
                    onSignUp={() => {
                        setAuthError("");
                        setStep("api-register");
                    }}
                    onBack={() => setStep("language")}
                />
            ) : step === "api-register" ? (
                <ApiRegisterStep
                    copy={onboarding}
                    loginId={loginId}
                    password={password}
                    passwordConfirm={passwordConfirm}
                    email={email}
                    username={username}
                    busy={isAuthBusy}
                    onLoginIdChange={setLoginId}
                    onPasswordChange={setPassword}
                    onPasswordConfirmChange={setPasswordConfirm}
                    onEmailChange={setEmail}
                    onUsernameChange={setUsername}
                    onSubmit={() => void handleApiRegister()}
                    onBack={() => setStep("api-login")}
                />
            ) : step === "api-register-success" ? (
                <ApiRegisterResultStep
                    copy={onboarding}
                    success
                    message={onboarding.registerSuccessDescription}
                    onAction={() => setStep("api-login")}
                />
            ) : step === "api-register-error" ? (
                <ApiRegisterResultStep
                    copy={onboarding}
                    success={false}
                    message={registerErrorMessage}
                    onAction={() => setStep("api-register")}
                />
            ) : step === "artemis-login" ? (
                <ArtemisLoginStep
                    copy={onboarding}
                    error={authError}
                    busy={isAuthBusy}
                    onGoogleLogin={() => void handleArtemisLogin()}
                    onBack={() => setStep("language")}
                />
            ) : step === "intro" ? (
                <>
                    <div>
                        <h6 className={PANEL_GATE_TITLE_CLASS}>{onboarding.introTitle}</h6>
                        <p className={PANEL_GATE_DESCRIPTION_CLASS}>
                            {sync === "api" && !requireAuth ? onboarding.introDescriptionApiNoAuth : onboarding.introDescription}
                        </p>
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
                            onClick={() => setStep(sharedSetupBackStep)}
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
                        fillStyle={markerAppearance.fillStyle}
                        strokeColor={markerAppearance.strokeColor}
                        fontFamily={typography.fontFamily}
                        ariaLabel={onboarding.displayPreviewAriaLabel}
                        showReplyBadge
                    />
                    <PanelMarkerDisplayControls
                        markerSize={markerAppearance.size}
                        onMarkerSizeChange={setMarkerSize}
                        scaleLabels={scaleLabels}
                        markerSizeLabel={messages.settings.markerSize}
                        markerSizeAriaLabel={messages.settings.markerSizeAriaLabel}
                    />
                    <div>
                        <p className="mb-[6px] text-[11px] font-medium text-[var(--adaptive-black600)]">{messages.settings.markerFillStyle}</p>
                        <PanelOptionSwitch
                            options={MARKER_FILL_STYLE_VALUES.map((value) => ({
                                value,
                                label: fillStyleLabels[value],
                            }))}
                            value={markerAppearance.fillStyle}
                            onChange={setMarkerFillStyle}
                            ariaLabel={messages.settings.markerFillStyleAriaLabel}
                        />
                    </div>
                    <div>
                        <p className="mb-[6px] text-[11px] font-medium text-[var(--adaptive-black600)]">{messages.settings.markerShape}</p>
                        <MarkerShapePicker
                            value={markerAppearance.shape}
                            onChange={setMarkerShape}
                            labels={shapeLabels}
                            ariaLabel={messages.settings.markerShapeAriaLabel}
                            previewColor={markerAppearance.colors.open}
                            fillStyle={markerAppearance.fillStyle}
                            strokeColor={markerAppearance.strokeColor}
                        />
                    </div>
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
                            onClick={handleFinishSharedSetup}
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
                        className={PANEL_GATE_INPUT_CLASS}
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
