import type { ReportFeedback } from "../../types/report.js";
export type FeedbackActor = {
    id?: string;
    name?: string;
} | null;
export declare function canDeleteFeedback(report: Pick<ReportFeedback, "author_id" | "author_name">, actor: FeedbackActor): boolean;
export declare function canRemoveCase(report: Pick<ReportFeedback, "author_id" | "author_name" | "status" | "cases" | "replies">, caseId: string, actor: FeedbackActor): boolean;
//# sourceMappingURL=feedbackPermissions.d.ts.map