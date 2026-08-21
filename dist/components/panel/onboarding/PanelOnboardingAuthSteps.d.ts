import type { LoginMethod } from "../../../constants/loginMethod.js";
import type { ReportMessages } from "../../../i18n/types.js";
type OnboardingCopy = ReportMessages["onboarding"];
export declare function LoginMethodStep({ copy, value, onChange, onBack, onNext, }: {
    copy: OnboardingCopy;
    value: LoginMethod;
    onChange: (method: LoginMethod) => void;
    onBack: () => void;
    onNext: () => void;
}): import("react").JSX.Element;
export declare function ApiLoginStep({ copy, loginId, password, error, busy, onLoginIdChange, onPasswordChange, onLogin, onSignUp, onBack, }: {
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
}): import("react").JSX.Element;
export declare function ApiRegisterStep({ copy, loginId, password, passwordConfirm, email, username, busy, onLoginIdChange, onPasswordChange, onPasswordConfirmChange, onEmailChange, onUsernameChange, onSubmit, onBack, }: {
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
}): import("react").JSX.Element;
export declare function ApiRegisterResultStep({ copy, success, message, onAction, }: {
    copy: OnboardingCopy;
    success: boolean;
    message: string;
    onAction: () => void;
}): import("react").JSX.Element;
export declare function ArtemisLoginStep({ copy, error, busy, onGoogleLogin, onBack, }: {
    copy: OnboardingCopy;
    error: string;
    busy: boolean;
    onGoogleLogin: () => void;
    onBack: () => void;
}): import("react").JSX.Element;
export {};
//# sourceMappingURL=PanelOnboardingAuthSteps.d.ts.map