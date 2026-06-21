import type { ReportAuthor, ReportIdentify } from "../types/report.js";
type PersonalKeyPayload = {
    projectId: string;
    environment?: string;
    authorId: string;
    secret: string;
};
export declare function createPersonalKey(projectId: string, environment: string | undefined, authorId: string): string;
export declare function parsePersonalKey(key: string): PersonalKeyPayload | null;
export declare function resolvePersonalKeyAuthor(payload: PersonalKeyPayload, identify: ReportIdentify | undefined, authors: ReportAuthor[]): ReportIdentify | undefined;
export declare function resolvePersonalKeyOwner(identify: ReportIdentify | undefined, authors: ReportAuthor[]): ReportIdentify | undefined;
export declare function savePersonalKey(projectId: string, environment: string | undefined, key: string, identify: ReportIdentify | undefined, authors: ReportAuthor[]): Promise<boolean>;
export declare function readPersonalKey(projectId: string, environment: string | undefined, identify: ReportIdentify | undefined, authors: ReportAuthor[]): Promise<string | null>;
export {};
//# sourceMappingURL=personalKey.d.ts.map