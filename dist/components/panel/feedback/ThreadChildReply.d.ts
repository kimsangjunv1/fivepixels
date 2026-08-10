import type { ReportAuthor, ReportReply } from "../../../types/report.js";
type ThreadChildReplyProps = {
    reply: ReportReply;
    authors: ReportAuthor[];
    originalAuthorName: string;
    actorName: string;
};
export declare function ThreadChildReply({ reply, authors, originalAuthorName, actorName }: ThreadChildReplyProps): import("react").JSX.Element;
export {};
//# sourceMappingURL=ThreadChildReply.d.ts.map