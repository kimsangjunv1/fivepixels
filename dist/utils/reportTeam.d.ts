import type { ReportAuthor, ReportIdentify, ReportTeam } from "../types/report.js";
export type ResolvedReportTeam = {
    user?: ReportIdentify;
    reviewers: ReportAuthor[];
    requireReviewerKey: boolean;
};
export type PresentationViewer = {
    id: string;
    name: string;
    department?: string;
    isCreator?: boolean;
    privateKey?: string;
};
export type ResolveReportTeamOptions = {
    team?: ReportTeam;
};
export declare function resolveReportTeam({ team }: ResolveReportTeamOptions): ResolvedReportTeam;
export declare function buildPresentationViewers(user: ReportIdentify | undefined, reviewers: ReportAuthor[]): PresentationViewer[];
export declare function formatPresentationViewerLabel(viewer: PresentationViewer): string;
export type SessionActor = {
    id: string;
    name: string;
};
export declare function resolveSessionActor(options: {
    isPresentationMode: boolean;
    presentationViewers: PresentationViewer[];
    presentationViewerId: string | null;
    activeIdentify: ReportIdentify | undefined;
}): SessionActor | null;
//# sourceMappingURL=reportTeam.d.ts.map