import type { FivePixelsSync } from "../../../shared/constants/loginMethod.js";
import type { ReportAuthUser } from "../../../shared/types/report.js";
import type { RemoteAuthSession } from "./loginSession.js";
export declare function resolveRemoteOnboardingCompleted(isRemoteAuth: boolean, selfProfileCompleted: boolean | undefined, remoteSession: RemoteAuthSession | null): boolean;
export declare function isReportAuthUser(value: unknown): value is ReportAuthUser;
/** Optional server logout — host may omit the handler and still clear local session. */
export declare function invokeOptionalLogout(logout?: () => Promise<void>): Promise<void>;
export type ApplyRefreshUserResult = {
    action: "update";
    user: ReportAuthUser;
} | {
    action: "keep";
};
export declare function applyRefreshUser(returned: ReportAuthUser | void): ApplyRefreshUserResult;
export declare function resolveRefreshSessionMethod(current: RemoteAuthSession | null, loginMethod: FivePixelsSync): "api" | "artemis";
//# sourceMappingURL=remoteAuthLifecycle.d.ts.map