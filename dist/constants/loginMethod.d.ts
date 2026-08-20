export declare const LOGIN_METHOD_VALUES: readonly ["local", "api", "artemis"];
export type LoginMethod = (typeof LOGIN_METHOD_VALUES)[number];
export declare function isRemoteLoginMethod(method: LoginMethod | null | undefined): method is "api" | "artemis";
//# sourceMappingURL=loginMethod.d.ts.map