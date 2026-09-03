import { resolveRequireAuth } from "../../../shared/constants/loginMethod.js";
/**
 * Resolves require flags with legacy prop fallbacks.
 * Precedence: `require.*` → deprecated props → defaults.
 */
export function resolveFivePixelsRequire({ sync, require: requireProp, requireAuth, teamRequireReviewerKey, }) {
    const authLoginExplicit = requireProp?.authLogin ?? requireAuth;
    const reviewerKeyExplicit = requireProp?.reviewerKey ?? teamRequireReviewerKey;
    return {
        authLogin: resolveRequireAuth(sync, authLoginExplicit),
        reviewerKey: typeof reviewerKeyExplicit === "boolean" ? reviewerKeyExplicit : false,
    };
}
//# sourceMappingURL=resolveRequire.js.map