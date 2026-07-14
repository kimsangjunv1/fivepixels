import type { ReportAuthAction, ReportAuthor, ReportIdentify } from "../types/report.js";
type UsePersonalKeyOptions = {
    enabled: boolean;
    requireKey: boolean;
    projectId: string;
    environment?: string;
    identify?: ReportIdentify;
    authors: ReportAuthor[];
};
export declare function usePersonalKey({ enabled, requireKey, projectId, environment, identify, authors }: UsePersonalKeyOptions): {
    personalKey: string | null;
    publicKey: string | null;
    personalKeyRequired: boolean;
    personalKeyPendingRegistration: boolean;
    personalKeyCandidates: ReportAuthor[];
    authorizedAuthors: ReportIdentify[];
    issuePersonalKey: (authorId?: string) => Promise<{
        privateKey: string;
        publicKey: string;
    } | null>;
    issueSelfKey: (authorId: string, authorName?: string) => Promise<{
        privateKey: string;
        publicKey: string;
    }>;
    rotatePersonalKey: () => Promise<{
        privateKey: string;
        publicKey: string;
    } | null>;
    insertPersonalKey: (key: string) => Promise<{
        saved: false;
        reason: "invalid";
        authorized?: undefined;
    } | {
        saved: false;
        reason: "project-mismatch";
        authorized?: undefined;
    } | {
        saved: true;
        authorized: boolean;
        reason?: undefined;
    }>;
    clearPersonalKey: () => void;
    signPayload: (action: ReportAuthAction, payload: unknown) => Promise<import("../types/report.js").ReportAuthProof | null>;
};
export {};
//# sourceMappingURL=usePersonalKey.d.ts.map