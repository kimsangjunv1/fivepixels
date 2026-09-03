import type { FeedbackDisplayStatus } from "../../constants/feedbackStatus.js";
type FeedCommentMetaProps = {
    authorName: string;
    createdAt: string;
    authors?: Array<{
        name: string;
        department?: string;
    }>;
    /** Reply/case status shown after name + time (e.g. 확인 요청, 오류 발견). */
    status?: FeedbackDisplayStatus;
};
/** Name + compact time + optional status label. */
export declare function FeedCommentMeta({ authorName, createdAt, authors, status }: FeedCommentMetaProps): import("react").JSX.Element;
type FeedActivityLineProps = {
    actorName?: string;
    action: string;
    createdAt?: string;
};
/** Single-line activity: `Name action · 12m` */
export declare function FeedActivityLine({ actorName, action, createdAt }: FeedActivityLineProps): import("react").JSX.Element;
export {};
//# sourceMappingURL=FeedCommentMeta.d.ts.map