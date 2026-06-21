import type { ReportAuthor, ReportIdentify } from "../types/report.js";
type UsePersonalKeyOptions = {
    enabled: boolean;
    projectId: string;
    environment?: string;
    identify?: ReportIdentify;
    authors: ReportAuthor[];
};
export declare function usePersonalKey({ enabled, projectId, environment, identify, authors }: UsePersonalKeyOptions): {
    personalKey: string | null;
    personalKeyRequired: boolean;
    authorizedAuthors: ReportAuthor[];
    issuePersonalKey: () => Promise<string | null>;
    insertPersonalKey: (key: string) => Promise<boolean>;
};
export {};
//# sourceMappingURL=usePersonalKey.d.ts.map