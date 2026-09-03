export declare const REPORTS_STORAGE_KEY = "fivepixels:reports:v1";
export declare const PERSONAL_KEY_STORAGE_KEY = "fivepixels:personal-key:v1";
export declare const SELF_PROFILE_STORAGE_KEY = "fivepixels:self-profile:v1";
export declare const LOGIN_METHOD_STORAGE_KEY = "fivepixels:login-method:v1";
export declare const REMOTE_AUTH_SESSION_STORAGE_KEY = "fivepixels:remote-auth:v1";
export declare const MINIMIZED_WINDOW_ALIAS_STORAGE_KEY = "fivepixels:minimized-window-alias:v1";
export declare const NOTIFICATIONS_STORAGE_KEY = "fivepixels:notifications:v1";
export declare function getReportsStorageKey(projectId: string, environment?: string, appVersion?: string): string;
export declare function getPersonalKeyStorageKey(projectId: string, environment?: string): string;
export declare function getSelfProfileStorageKey(projectId: string, environment?: string): string;
export declare function getLoginMethodStorageKey(projectId: string, environment?: string): string;
export declare function getRemoteAuthSessionStorageKey(projectId: string, environment?: string): string;
export declare function getMinimizedWindowAliasStorageKey(projectId: string): string;
export declare function getNotificationsStorageKey(projectId?: string, actorId?: string | null): string;
//# sourceMappingURL=storageKeys.d.ts.map