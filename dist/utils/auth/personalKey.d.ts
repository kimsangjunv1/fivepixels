import type { ReportAuthAction, ReportAuthProof, ReportAuthor, ReportIdentify } from "../../types/report.js";
type ReviewerKeyBundle = {
    projectId: string;
    environment?: string;
    authorId: string;
    authorName?: string;
    privateKey: JsonWebKey;
    publicKey: JsonWebKey;
};
export declare function createReportAuthMessage(params: {
    projectId: string;
    environment?: string;
    action: ReportAuthAction;
    authorId: string;
    signedAt: string;
    payload: unknown;
}): string;
export declare function serializePublicKey(key: JsonWebKey): string;
export declare function parsePublicKey(key: string): JsonWebKey | null;
export declare function publicKeysMatch(left: string, right: string): boolean;
export declare function serializePrivateKeyBundle(bundle: ReviewerKeyBundle): string;
export declare function parsePrivateKeyBundle(key: string): ReviewerKeyBundle | null;
export declare function resolvePersonalKeyOwner(identify: ReportIdentify | undefined, authors: ReportAuthor[]): ReportIdentify | undefined;
export declare function createReviewerKeyPair(projectId: string, environment: string | undefined, authorId: string, authorName?: string): Promise<{
    privateKey: string;
    publicKey: string;
}>;
export declare function resolvePersonalKeyAuthor(bundle: ReviewerKeyBundle, identify: ReportIdentify | undefined, authors: ReportAuthor[]): ReportIdentify | undefined;
export declare function savePersonalKey(projectId: string, environment: string | undefined, key: string): boolean;
export declare function readPersonalKey(projectId: string, environment: string | undefined): string | null;
export declare function hasStoredPersonalKey(projectId: string, environment: string | undefined): boolean;
export declare function removePersonalKey(projectId: string, environment: string | undefined): void;
export declare function getPublicKeyFromPrivateKey(key: string): string | null;
export declare function getAuthorIdFromPrivateKey(key: string): string | null;
export declare function getAuthorNameFromPrivateKey(key: string): string | null;
export declare function signReportPayload(key: string, params: {
    projectId: string;
    environment?: string;
    action: ReportAuthAction;
    payload: unknown;
}): Promise<ReportAuthProof>;
export declare function verifyReportAuthProof(params: {
    proof: ReportAuthProof;
    publicKey: string;
    projectId: string;
    environment?: string;
    action: ReportAuthAction;
    payload: unknown;
}): Promise<boolean>;
export {};
//# sourceMappingURL=personalKey.d.ts.map