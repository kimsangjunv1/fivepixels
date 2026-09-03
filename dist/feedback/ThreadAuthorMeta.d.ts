import type { ReactNode } from "react";
type ThreadAuthorMetaProps = {
    authorName: string;
    authors?: Array<{
        name: string;
        department?: string;
    }>;
    createdAt?: string;
    showCreator?: boolean;
    showMine?: boolean;
    trailing?: ReactNode;
    className?: string;
};
export declare function ThreadAuthorMeta({ authorName, authors, createdAt, showCreator, showMine, trailing, className }: ThreadAuthorMetaProps): import("react").JSX.Element | null;
export {};
//# sourceMappingURL=ThreadAuthorMeta.d.ts.map