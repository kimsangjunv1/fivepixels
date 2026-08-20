import type { LoginMethod } from "@/constants/loginMethod.js";
import type { ReportMessages } from "@/i18n/types.js";
import {
    PANEL_GATE_BACK_BUTTON_CLASS,
    PANEL_GATE_DESCRIPTION_CLASS,
    PANEL_GATE_INPUT_CLASS,
    PANEL_GATE_LABEL_CLASS,
    PANEL_GATE_PRIMARY_BUTTON_CLASS,
    PANEL_GATE_TITLE_CLASS,
} from "../PanelGateShell.js";

type OnboardingCopy = ReportMessages["onboarding"];

type FieldProps = {
    label: string;
    value: string;
    onChange: (value: string) => void;
    type?: "text" | "password" | "email";
    autoFocus?: boolean;
};

function OnboardingField({ label, value, onChange, type = "text", autoFocus }: FieldProps) {
    return (
        <label className="block">
            <span className={PANEL_GATE_LABEL_CLASS}>{label}</span>
            <input
                autoFocus={autoFocus}
                type={type}
                value={value}
                onChange={(event) => onChange(event.target.value)}
                className={PANEL_GATE_INPUT_CLASS}
            />
        </label>
    );
}

function StepFooter({
    backLabel,
    onBack,
    nextLabel,
    onNext,
    nextDisabled,
    nextClassName = PANEL_GATE_PRIMARY_BUTTON_CLASS,
}: {
    backLabel: string;
    onBack: () => void;
    nextLabel?: string;
    onNext?: () => void;
    nextDisabled?: boolean;
    nextClassName?: string;
}) {
    return (
        <div className={`flex items-center ${onNext ? "justify-between" : "justify-start"}`}>
            <button type="button" onClick={onBack} className={PANEL_GATE_BACK_BUTTON_CLASS}>
                {backLabel}
            </button>
            {onNext && nextLabel ? (
                <button type="button" disabled={nextDisabled} onClick={onNext} className={nextClassName}>
                    {nextLabel}
                </button>
            ) : null}
        </div>
    );
}

const LOGIN_METHOD_OPTIONS: readonly LoginMethod[] = ["local", "api", "artemis"];

export function LoginMethodStep({
    copy,
    value,
    onChange,
    onBack,
    onNext,
}: {
    copy: OnboardingCopy;
    value: LoginMethod;
    onChange: (method: LoginMethod) => void;
    onBack: () => void;
    onNext: () => void;
}) {
    const details: Record<LoginMethod, { title: string; description: string }> = {
        local: { title: copy.loginMethodLocal, description: copy.loginMethodLocalDescription },
        api: { title: copy.loginMethodApi, description: copy.loginMethodApiDescription },
        artemis: { title: copy.loginMethodArtemis, description: copy.loginMethodArtemisDescription },
    };

    return (
        <>
            <div>
                <h6 className={PANEL_GATE_TITLE_CLASS}>{copy.loginMethodStepTitle}</h6>
                <p className={PANEL_GATE_DESCRIPTION_CLASS}>{copy.loginMethodStepDescription}</p>
            </div>
            <div className="flex flex-col gap-[8px]">
                {LOGIN_METHOD_OPTIONS.map((method) => {
                    const selected = method === value;

                    return (
                        <button
                            key={method}
                            type="button"
                            onClick={() => onChange(method)}
                            className={`rounded-[8px] border px-[12px] py-[10px] text-left ${
                                selected
                                    ? "border-[var(--adaptive-blue400)] bg-[var(--adaptive-blue100)]"
                                    : "border-[var(--adaptive-black200)] hover:bg-[var(--adaptive-black100)]"
                            }`}
                        >
                            <span className={`block text-[12px] font-semibold ${selected ? "text-[var(--adaptive-blue500)]" : "text-[var(--adaptive-black700)]"}`}>
                                {details[method].title}
                            </span>
                            <span className="mt-[2px] block text-[11px] leading-[1.4] text-[var(--adaptive-black500)]">{details[method].description}</span>
                        </button>
                    );
                })}
            </div>
            <StepFooter backLabel={copy.back} onBack={onBack} nextLabel={copy.next} onNext={onNext} />
        </>
    );
}

export function ApiLoginStep({
    copy,
    loginId,
    password,
    error,
    busy,
    onLoginIdChange,
    onPasswordChange,
    onLogin,
    onSignUp,
    onBack,
}: {
    copy: OnboardingCopy;
    loginId: string;
    password: string;
    error: string;
    busy: boolean;
    onLoginIdChange: (value: string) => void;
    onPasswordChange: (value: string) => void;
    onLogin: () => void;
    onSignUp: () => void;
    onBack: () => void;
}) {
    return (
        <>
            <div>
                <h6 className={PANEL_GATE_TITLE_CLASS}>{copy.apiLoginTitle}</h6>
                <p className={PANEL_GATE_DESCRIPTION_CLASS}>{copy.apiLoginDescription}</p>
            </div>
            <div className="flex flex-col gap-[8px]">
                <OnboardingField autoFocus label={copy.loginIdLabel} value={loginId} onChange={onLoginIdChange} />
                <OnboardingField label={copy.passwordLabel} value={password} onChange={onPasswordChange} type="password" />
            </div>
            {error ? <p className="text-[12px] text-rose-700">{error}</p> : null}
            <div className="flex flex-col gap-[8px]">
                <button
                    type="button"
                    disabled={!loginId.trim() || !password || busy}
                    onClick={onLogin}
                    className={`${PANEL_GATE_PRIMARY_BUTTON_CLASS} py-[10px]`}
                >
                    {copy.loginAction}
                </button>
                <button
                    type="button"
                    disabled={busy}
                    onClick={onSignUp}
                    className="rounded-[8px] border border-[var(--adaptive-black200)] px-[12px] py-[10px] text-[12px] font-semibold text-[var(--adaptive-black700)] hover:bg-[var(--adaptive-black100)]"
                >
                    {copy.signUpAction}
                </button>
            </div>
            <StepFooter backLabel={copy.back} onBack={onBack} />
        </>
    );
}

export function ApiRegisterStep({
    copy,
    loginId,
    password,
    passwordConfirm,
    email,
    username,
    busy,
    onLoginIdChange,
    onPasswordChange,
    onPasswordConfirmChange,
    onEmailChange,
    onUsernameChange,
    onSubmit,
    onBack,
}: {
    copy: OnboardingCopy;
    loginId: string;
    password: string;
    passwordConfirm: string;
    email: string;
    username: string;
    busy: boolean;
    onLoginIdChange: (value: string) => void;
    onPasswordChange: (value: string) => void;
    onPasswordConfirmChange: (value: string) => void;
    onEmailChange: (value: string) => void;
    onUsernameChange: (value: string) => void;
    onSubmit: () => void;
    onBack: () => void;
}) {
    const canSubmit = Boolean(loginId.trim() && password && passwordConfirm && email.trim() && username.trim()) && !busy;

    return (
        <>
            <div>
                <h6 className={PANEL_GATE_TITLE_CLASS}>{copy.registerTitle}</h6>
                <p className={PANEL_GATE_DESCRIPTION_CLASS}>{copy.registerDescription}</p>
            </div>
            <div className="flex flex-col gap-[8px]">
                <OnboardingField autoFocus label={copy.loginIdLabel} value={loginId} onChange={onLoginIdChange} />
                <OnboardingField label={copy.passwordLabel} value={password} onChange={onPasswordChange} type="password" />
                <OnboardingField label={copy.passwordConfirmLabel} value={passwordConfirm} onChange={onPasswordConfirmChange} type="password" />
                <OnboardingField label={copy.emailLabel} value={email} onChange={onEmailChange} type="email" />
                <OnboardingField label={copy.usernameLabel} value={username} onChange={onUsernameChange} />
            </div>
            <StepFooter backLabel={copy.back} onBack={onBack} nextLabel={copy.registerSubmit} onNext={onSubmit} nextDisabled={!canSubmit} />
        </>
    );
}

export function ApiRegisterResultStep({
    copy,
    success,
    message,
    onAction,
}: {
    copy: OnboardingCopy;
    success: boolean;
    message: string;
    onAction: () => void;
}) {
    return (
        <>
            <div>
                <h6 className={PANEL_GATE_TITLE_CLASS}>{success ? copy.registerSuccessTitle : copy.registerErrorTitle}</h6>
                <p className={PANEL_GATE_DESCRIPTION_CLASS}>{success ? copy.registerSuccessDescription : message}</p>
            </div>
            <div className="flex items-center justify-end">
                <button type="button" onClick={onAction} className={PANEL_GATE_PRIMARY_BUTTON_CLASS}>
                    {success ? copy.goToLogin : copy.backToPrevious}
                </button>
            </div>
        </>
    );
}

function GoogleGlyph() {
    return (
        <svg width="14" height="14" viewBox="0 0 48 48" aria-hidden="true">
            <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 8 3l5.7-5.7C34.2 6.1 29.4 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.5-.4-3.5z" />
            <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16 19 12 24 12c3.1 0 5.8 1.1 8 3l5.7-5.7C34.2 6.1 29.4 4 24 4 16.3 4 9.6 8.3 6.3 14.7z" />
            <path fill="#4CAF50" d="M24 44c5.2 0 10-2 13.6-5.2l-6.3-5.3C29.2 35.1 26.7 36 24 36c-5.3 0-9.7-3.3-11.3-8.1l-6.5 5C9.5 39.6 16.2 44 24 44z" />
            <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-1.1 3.2-3.5 5.8-6.6 7.4l6.3 5.3C37.8 38.2 44 32 44 24c0-1.3-.1-2.5-.4-3.5z" />
        </svg>
    );
}

export function ArtemisLoginStep({
    copy,
    error,
    busy,
    onGoogleLogin,
    onBack,
}: {
    copy: OnboardingCopy;
    error: string;
    busy: boolean;
    onGoogleLogin: () => void;
    onBack: () => void;
}) {
    return (
        <>
            <div>
                <h6 className={PANEL_GATE_TITLE_CLASS}>{copy.artemisLoginTitle}</h6>
                <p className={PANEL_GATE_DESCRIPTION_CLASS}>{copy.artemisLoginDescription}</p>
            </div>
            <button
                type="button"
                disabled={busy}
                onClick={onGoogleLogin}
                className="flex items-center justify-center gap-[8px] rounded-[8px] border border-[var(--adaptive-black200)] bg-[var(--adaptive-surface)] px-[12px] py-[10px] text-[12px] font-semibold text-[var(--adaptive-black700)] hover:bg-[var(--adaptive-black100)] disabled:opacity-50"
            >
                <GoogleGlyph />
                {copy.googleLogin}
            </button>
            {error ? <p className="text-[12px] text-rose-700">{error}</p> : null}
            <StepFooter backLabel={copy.back} onBack={onBack} />
        </>
    );
}
