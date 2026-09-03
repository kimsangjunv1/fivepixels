import { resolveRequireAuth, type FivePixelsSync } from "@/shared/constants/loginMethod.js";

/**
 * Policy flags for identity gates.
 * Prefer this over top-level `requireAuth` / `team.requireReviewerKey`.
 */
export type FivePixelsRequire = {
    /**
     * When `sync` is `api` or `artemis`, whether company login is required.
     * - `true` (default for remote sync): login / Artemis gate
     * - `false`: local-style onboarding (display name + personal key)
     * Ignored when `sync="local"`.
     */
    authLogin?: boolean;
    /**
     * Whether the personal key must match an entry in `team.reviewers` (publicKey).
     * Defaults to `false`.
     */
    reviewerKey?: boolean;
};

export type ResolvedFivePixelsRequire = {
    authLogin: boolean;
    reviewerKey: boolean;
};

export type ResolveFivePixelsRequireOptions = {
    sync: FivePixelsSync;
    require?: FivePixelsRequire;
    /** @deprecated Prefer `require.authLogin`. */
    requireAuth?: boolean;
    /** @deprecated Prefer `require.reviewerKey`. */
    teamRequireReviewerKey?: boolean;
};

/**
 * Resolves require flags with legacy prop fallbacks.
 * Precedence: `require.*` → deprecated props → defaults.
 */
export function resolveFivePixelsRequire({
    sync,
    require: requireProp,
    requireAuth,
    teamRequireReviewerKey,
}: ResolveFivePixelsRequireOptions): ResolvedFivePixelsRequire {
    const authLoginExplicit = requireProp?.authLogin ?? requireAuth;
    const reviewerKeyExplicit = requireProp?.reviewerKey ?? teamRequireReviewerKey;

    return {
        authLogin: resolveRequireAuth(sync, authLoginExplicit),
        reviewerKey: typeof reviewerKeyExplicit === "boolean" ? reviewerKeyExplicit : false,
    };
}
