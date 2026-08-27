import type { FivePixelsSync } from "@/constants/loginMethod.js";
import type { ReportAuthUser } from "@/types/report.js";
import type { RemoteAuthSession } from "./loginSession.js";

export function isReportAuthUser(value: unknown): value is ReportAuthUser {
    if (!value || typeof value !== "object") {
        return false;
    }

    const user = value as Partial<ReportAuthUser>;
    return typeof user.id === "string" && user.id.length > 0 && typeof user.name === "string" && user.name.length > 0;
}

/** Optional server logout — host may omit the handler and still clear local session. */
export async function invokeOptionalLogout(logout?: () => Promise<void>): Promise<void> {
    if (!logout) {
        return;
    }

    await logout();
}

export type ApplyRefreshUserResult = { action: "update"; user: ReportAuthUser } | { action: "keep" };

export function applyRefreshUser(returned: ReportAuthUser | void): ApplyRefreshUserResult {
    if (isReportAuthUser(returned)) {
        return { action: "update", user: returned };
    }

    return { action: "keep" };
}

export function resolveRefreshSessionMethod(
    current: RemoteAuthSession | null,
    loginMethod: FivePixelsSync,
): "api" | "artemis" {
    if (current?.method === "api" || current?.method === "artemis") {
        return current.method;
    }

    return loginMethod === "artemis" ? "artemis" : "api";
}
