import type { FivePixelsSync } from "../../constants/loginMethod.js";
import type { ReportAuthUser } from "../../types/report.js";
import type { RemoteAuthSession } from "./loginSession.js";
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