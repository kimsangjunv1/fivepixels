type FeedCommentMetaProps = {
    authorName: string;
    createdAt: string;
    authors?: Array<{
        name: string;
        department?: string;
    }>;
};
/** Name + compact time — badges intentionally omitted for feed density. */
export declare function FeedCommentMeta({ authorName, createdAt, authors }: FeedCommentMetaProps): import("react").JSX.Element;
type FeedActivityLineProps = {
    actorName?: string;
    action: string;
    createdAt?: string;
};
/** Single-line activity: `Name action · 12m` */
export declare function FeedActivityLine({ actorName, action, createdAt }: FeedActivityLineProps): import("react").JSX.Element;
export {};
//# sourceMappingURL=FeedCommentMeta.d.ts.map