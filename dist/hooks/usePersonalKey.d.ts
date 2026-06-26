import type { ReportAuthAction, ReportAuthor, ReportIdentify } from "@/types/report.js";
type UsePersonalKeyOptions = {
    enabled: boolean;
    projectId: string;
    environment?: string;
    identify?: ReportIdentify;
    authors: ReportAuthor[];
};
export declare function usePersonalKey({ enabled, projectId, environment, identify, authors }: UsePersonalKeyOptions): {
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
    rotatePersonalKey: () => Promise<{
        privateKey: string;
        publicKey: string;
    } | null>;
    insertPersonalKey: (key: string) => Promise<{
        authorized: boolean;
    } | null>;
    signPayload: (action: ReportAuthAction, payload: unknown) => Promise<import("@/types/report.js").ReportAuthProof | null>;
};
export {};
//# sourceMappingURL=usePersonalKey.d.ts.map