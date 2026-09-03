import type { ReportAuthor, ReportReply } from "../../shared/types/report.js";
type QuestionThreadGroupProps = {
    questions: ReportReply[];
    authors: ReportAuthor[];
    originalAuthorName: string;
    actorName: string;
    forceExpanded?: boolean;
};
export declare function QuestionThreadGroup({ questions, authors, originalAuthorName, actorName, forceExpanded }: QuestionThreadGroupProps): import("react").JSX.Element | null;
export {};
//# sourceMappingURL=QuestionThreadGroup.d.ts.map