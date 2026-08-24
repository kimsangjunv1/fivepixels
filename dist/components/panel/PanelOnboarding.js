import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useMemo, useState } from "react";
import { APPEARANCE_OPTION_VALUES } from "../../constants/appearance.js";
import { isRemoteLoginMethod, resolveFivePixelsSync } from "../../constants/loginMethod.js";
import { MARKER_FILL_STYLE_VALUES } from "../../constants/markerAppearance.js";
import { PANEL_ROLE_VALUES } from "../../constants/panelRole.js";
import { useReportPreferences, useReportSession } from "../../providers/reportContext.js";
import { getDefaultVisibleTabsForRole } from "../../utils/panel/panelTabPreference.js";
import { ReportAuthError, resolveRegistrationError } from "../../utils/auth/reportAuthError.js";
import { isPersonalKeyFile, readPersonalKeyFile } from "../../utils/feedback/feedbackDataTransfer.js";
import { hasTeamRequestHandler, isTeamWriteEnabled } from "../../utils/report/teamManagement.js";
import { AppearanceThemePicker } from "./AppearanceThemePicker.js";
import { MarkerShapePicker } from "./MarkerShapePicker.js";
import { MarkerSizePreview } from "./MarkerSizePreview.js";
import { PanelDropdownMenuItem } from "./PanelDropdownMenu.js";
import { PANEL_GATE_BACK_BUTTON_CLASS, PANEL_GATE_DESCRIPTION_CLASS, PANEL_GATE_INPUT_CLASS, PANEL_GATE_PRIMARY_BUTTON_CLASS, PANEL_GATE_SECTION_CLASS, PANEL_GATE_TITLE_CLASS, } from "./PanelGateShell.js";
import { PanelMarkerDisplayControls } from "./PanelMarkerDisplayControls.js";
import { PanelOptionSwitch } from "./PanelOptionSwitch.js";
import { PanelTabSelector } from "./PanelTabSelector.js";
import { ApiLoginStep, ApiRegisterResultStep, ApiRegisterStep, ArtemisLoginStep, } from "./onboarding/PanelOnboardingAuthSteps.js";
const LOCALE_OPTIONS = ["en", "ko"];
function getAuthEntryStep(sync) {
    if (sync === "api") {
        return "api-login";
    }
    if (sync === "artemis") {
        return "artemis-login";
    }
    return "intro";
}
export function PanelOnboarding() {
    const { messages, locale, setLocale, panelAppearance, setPanelAppearance, markerAppearance, setMarkerSize, setMarkerShape, setMarkerFillStyle, typography, panelRole, setPanelRole, completeOnboarding, restoreFromBackup, selfProfile, personalKeyCandidates, resolvedTabAvailabilityContext, savePanelTabPreference, persistenceStatus, onCreateReviewerRequest, loginMethod: storedLoginMethod, loginWithApi, registerWithApi, loginWithArtemis, completeRemoteOnboarding, } = useReportPreferences();
    const { setErrorMessage } = useReportSession();
    const onboarding = messages.onboarding;
    const sync = resolveFivePixelsSync(storedLoginMethod);
    const canSubmitRegistrationRequest = isTeamWriteEnabled(persistenceStatus) && hasTeamRequestHandler({ onCreateReviewerRequest });
    const [step, setStep] = useState("language");
    const [name, setName] = useState(selfProfile?.name ?? "");
    const [selectedTabs, setSelectedTabs] = useState(() => getDefaultVisibleTabsForRole(panelRole, resolvedTabAvailabilityContext));
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
    const [registerErrorKind, setRegisterErrorKind] = useState("unknown");
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
            const issued = await completeOnboarding({ name: trimmedName });
            if (canSubmitRegistrationRequest && onCreateReviewerRequest && issued.publicKey && issued.authorId) {
                try {
                    await onCreateReviewerRequest({
                        author_id: issued.authorId,
                        author_name: trimmedName,
                        public_key: issued.publicKey,
                    });
                }
                catch {
                    setErrorMessage(messages.team.requestFailed);
                }
            }
        }
        catch {
            setErrorMessage(messages.errors.clipboardCopyFailed);
        }
        finally {
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
        }
        catch (error) {
            setAuthError(error instanceof ReportAuthError && error.code === "auth-unavailable" ? onboarding.authUnavailable : onboarding.loginFailed);
        }
        finally {
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
        }
        catch (error) {
            setRegisterErrorKind(resolveRegistrationError(error));
            setStep("api-register-error");
        }
        finally {
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
        }
        catch (error) {
            setAuthError(error instanceof ReportAuthError && error.code === "auth-unavailable" ? onboarding.authUnavailable : onboarding.loginFailed);
        }
        finally {
            setIsAuthBusy(false);
        }
    };
    const handleFinishSharedSetup = () => {
        if (isRemoteLoginMethod(sync)) {
            savePanelTabPreference({
                visibleTabs: selectedTabs,
                customized: true,
            });
            completeRemoteOnboarding();
            return;
        }
        setStep("key");
    };
    const sharedSetupBackStep = getAuthEntryStep(sync);
    const registerErrorMessage = registerErrorKind === "account-already-exists"
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
    return (_jsx("section", { className: PANEL_GATE_SECTION_CLASS, children: step === "language" ? (_jsxs(_Fragment, { children: [_jsxs("div", { children: [_jsx("h6", { className: PANEL_GATE_TITLE_CLASS, children: onboarding.languageStepTitle }), _jsx("p", { className: PANEL_GATE_DESCRIPTION_CLASS, children: onboarding.languageStepDescription })] }), _jsx(PanelOptionSwitch, { options: localeOptions, value: locale, onChange: setLocale, ariaLabel: messages.moreMenu.languageAriaLabel }), _jsx("div", { className: "flex items-center justify-end", children: _jsx("button", { type: "button", onClick: () => setStep(getAuthEntryStep(sync)), className: PANEL_GATE_PRIMARY_BUTTON_CLASS, children: onboarding.next }) })] })) : step === "api-login" ? (_jsx(ApiLoginStep, { copy: onboarding, loginId: loginId, password: password, error: authError, busy: isAuthBusy, onLoginIdChange: (value) => {
                setLoginId(value);
                setAuthError("");
            }, onPasswordChange: (value) => {
                setPassword(value);
                setAuthError("");
            }, onLogin: () => void handleApiLogin(), onSignUp: () => {
                setAuthError("");
                setStep("api-register");
            }, onBack: () => setStep("language") })) : step === "api-register" ? (_jsx(ApiRegisterStep, { copy: onboarding, loginId: loginId, password: password, passwordConfirm: passwordConfirm, email: email, username: username, busy: isAuthBusy, onLoginIdChange: setLoginId, onPasswordChange: setPassword, onPasswordConfirmChange: setPasswordConfirm, onEmailChange: setEmail, onUsernameChange: setUsername, onSubmit: () => void handleApiRegister(), onBack: () => setStep("api-login") })) : step === "api-register-success" ? (_jsx(ApiRegisterResultStep, { copy: onboarding, success: true, message: onboarding.registerSuccessDescription, onAction: () => setStep("api-login") })) : step === "api-register-error" ? (_jsx(ApiRegisterResultStep, { copy: onboarding, success: false, message: registerErrorMessage, onAction: () => setStep("api-register") })) : step === "artemis-login" ? (_jsx(ArtemisLoginStep, { copy: onboarding, error: authError, busy: isAuthBusy, onGoogleLogin: () => void handleArtemisLogin(), onBack: () => setStep("language") })) : step === "intro" ? (_jsxs(_Fragment, { children: [_jsxs("div", { children: [_jsx("h6", { className: PANEL_GATE_TITLE_CLASS, children: onboarding.introTitle }), _jsx("p", { className: PANEL_GATE_DESCRIPTION_CLASS, children: onboarding.introDescription })] }), _jsxs("div", { className: "flex flex-col gap-[8px]", children: [_jsx("button", { type: "button", onClick: () => setStep("role"), className: `${PANEL_GATE_PRIMARY_BUTTON_CLASS} py-[10px]`, children: onboarding.newUser }), _jsx("button", { type: "button", onClick: () => setStep("restore"), className: "rounded-[8px] border border-[var(--adaptive-black200)] px-[12px] py-[10px] text-[12px] font-semibold text-[var(--adaptive-black700)] hover:bg-[var(--adaptive-black100)]", children: onboarding.existingUser })] }), _jsx("div", { className: "flex items-center justify-start", children: _jsx("button", { type: "button", onClick: () => setStep("language"), className: PANEL_GATE_BACK_BUTTON_CLASS, children: onboarding.back }) })] })) : step === "restore" ? (_jsxs(_Fragment, { children: [_jsxs("div", { children: [_jsx("h6", { className: PANEL_GATE_TITLE_CLASS, children: onboarding.restoreTitle }), _jsx("p", { className: PANEL_GATE_DESCRIPTION_CLASS, children: onboarding.restoreDescription })] }), _jsxs("div", { onDragOver: handleDragOver, onDragLeave: handleDragLeave, onDrop: (event) => void handleDrop(event), className: `relative rounded-[8px] transition-colors ${isDragOver ? "ring-2 ring-[var(--adaptive-blue500)]" : ""}`, children: [_jsx("textarea", { autoFocus: true, value: backupKey, onChange: (event) => {
                                setBackupKey(event.target.value);
                                setRestoreError("");
                            }, placeholder: onboarding.restorePlaceholder, rows: 3, className: "w-full resize-none rounded-[8px] border border-[var(--adaptive-border-subtle)] bg-[var(--adaptive-surface)] px-[10px] py-[8px] text-[12px] text-[var(--adaptive-text-primary)] outline-none" }), isDragOver ? (_jsx("div", { className: "pointer-events-none absolute inset-0 flex items-center justify-center rounded-[8px] bg-[var(--adaptive-blue100)]/80 text-[12px] font-semibold text-[var(--adaptive-blue500)]", children: onboarding.restoreDropActive })) : null] }), _jsx("p", { className: "text-[11px] text-[var(--adaptive-black500)]", children: onboarding.restoreDropHint }), restoreError ? _jsx("p", { className: "text-[12px] text-rose-700", children: restoreError }) : null, _jsxs("div", { className: "flex items-center justify-between", children: [_jsx("button", { type: "button", onClick: () => setStep("intro"), className: PANEL_GATE_BACK_BUTTON_CLASS, children: onboarding.back }), _jsx("button", { type: "button", disabled: !backupKey.trim() || isRestoring, onClick: () => void handleRestore(), className: PANEL_GATE_PRIMARY_BUTTON_CLASS, children: onboarding.restoreAction })] })] })) : step === "role" ? (_jsxs(_Fragment, { children: [_jsxs("div", { children: [_jsx("h6", { className: PANEL_GATE_TITLE_CLASS, children: onboarding.roleStepTitle }), _jsx("p", { className: PANEL_GATE_DESCRIPTION_CLASS, children: onboarding.roleStepDescription })] }), _jsx("div", { className: "overflow-hidden rounded-[10px] border border-[var(--adaptive-black200)]", children: PANEL_ROLE_VALUES.map((role) => (_jsx(PanelDropdownMenuItem, { active: role === panelRole, onClick: () => handleSelectRole(role), children: messages.panel.roles[role] }, role))) }), _jsx(PanelTabSelector, { role: panelRole, selectedTabs: selectedTabs, context: resolvedTabAvailabilityContext, messages: messages, onChange: setSelectedTabs }), _jsx("p", { className: "text-[11px] text-[var(--adaptive-black500)]", children: onboarding.roleStepTabsHint }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsx("button", { type: "button", onClick: () => setStep(sharedSetupBackStep), className: PANEL_GATE_BACK_BUTTON_CLASS, children: onboarding.back }), _jsx("button", { type: "button", disabled: !canProceedFromRoleStep, onClick: () => setStep("appearance"), className: PANEL_GATE_PRIMARY_BUTTON_CLASS, children: onboarding.next })] })] })) : step === "appearance" ? (_jsxs(_Fragment, { children: [_jsxs("div", { children: [_jsx("h6", { className: PANEL_GATE_TITLE_CLASS, children: onboarding.appearanceStepTitle }), _jsx("p", { className: PANEL_GATE_DESCRIPTION_CLASS, children: onboarding.appearanceStepDescription })] }), _jsx(AppearanceThemePicker, { options: appearanceOptions, value: panelAppearance, onChange: setPanelAppearance, ariaLabel: messages.moreMenu.panelThemeAriaLabel }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsx("button", { type: "button", onClick: () => setStep("role"), className: PANEL_GATE_BACK_BUTTON_CLASS, children: onboarding.back }), _jsx("button", { type: "button", onClick: () => setStep("display"), className: PANEL_GATE_PRIMARY_BUTTON_CLASS, children: onboarding.next })] })] })) : step === "display" ? (_jsxs(_Fragment, { children: [_jsxs("div", { children: [_jsx("h6", { className: PANEL_GATE_TITLE_CLASS, children: onboarding.displayStepTitle }), _jsx("p", { className: PANEL_GATE_DESCRIPTION_CLASS, children: onboarding.displayStepDescription })] }), _jsx(MarkerSizePreview, { size: markerAppearance.size, fontSize: typography.fontSize, shape: markerAppearance.shape, color: markerAppearance.colors.open, fillStyle: markerAppearance.fillStyle, fontFamily: typography.fontFamily, ariaLabel: onboarding.displayPreviewAriaLabel, showReplyBadge: true }), _jsx(PanelMarkerDisplayControls, { markerSize: markerAppearance.size, onMarkerSizeChange: setMarkerSize, scaleLabels: scaleLabels, markerSizeLabel: messages.settings.markerSize, markerSizeAriaLabel: messages.settings.markerSizeAriaLabel }), _jsxs("div", { children: [_jsx("p", { className: "mb-[6px] text-[11px] font-medium text-[var(--adaptive-black600)]", children: messages.settings.markerFillStyle }), _jsx(PanelOptionSwitch, { options: MARKER_FILL_STYLE_VALUES.map((value) => ({
                                value,
                                label: fillStyleLabels[value],
                            })), value: markerAppearance.fillStyle, onChange: setMarkerFillStyle, ariaLabel: messages.settings.markerFillStyleAriaLabel })] }), _jsxs("div", { children: [_jsx("p", { className: "mb-[6px] text-[11px] font-medium text-[var(--adaptive-black600)]", children: messages.settings.markerShape }), _jsx(MarkerShapePicker, { value: markerAppearance.shape, onChange: setMarkerShape, labels: shapeLabels, ariaLabel: messages.settings.markerShapeAriaLabel, previewColor: markerAppearance.colors.open, fillStyle: markerAppearance.fillStyle })] }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsx("button", { type: "button", onClick: () => setStep("appearance"), className: PANEL_GATE_BACK_BUTTON_CLASS, children: onboarding.back }), _jsx("button", { type: "button", onClick: handleFinishSharedSetup, className: PANEL_GATE_PRIMARY_BUTTON_CLASS, children: onboarding.next })] })] })) : (_jsxs(_Fragment, { children: [_jsxs("div", { children: [_jsx("h6", { className: PANEL_GATE_TITLE_CLASS, children: onboarding.keyStepTitle }), _jsx("p", { className: PANEL_GATE_DESCRIPTION_CLASS, children: onboarding.keyStepDescription })] }), _jsx("input", { autoFocus: true, value: name, onChange: (event) => setName(event.target.value), placeholder: onboarding.namePlaceholder, className: PANEL_GATE_INPUT_CLASS }), hasDuplicateName ? _jsx("p", { className: "text-[12px] text-rose-700", children: onboarding.duplicateNameError }) : null, _jsxs("div", { className: "flex items-center justify-between", children: [_jsx("button", { type: "button", onClick: () => setStep("display"), className: PANEL_GATE_BACK_BUTTON_CLASS, children: onboarding.back }), _jsx("button", { type: "button", disabled: !trimmedName || isCreating || hasDuplicateName, onClick: () => void handleCreateKey(), className: PANEL_GATE_PRIMARY_BUTTON_CLASS, children: onboarding.createKey })] })] })) }));
}
//# sourceMappingURL=PanelOnboarding.js.map