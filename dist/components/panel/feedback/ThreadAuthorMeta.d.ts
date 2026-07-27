import type { ReactNode } from "react";
type ThreadAuthorMetaProps = {
    authorName: string;
    createdAt?: string;
    showCreator?: boolean;
    showMine?: boolean;
    trailing?: ReactNode;
    className?: string;
};
export declare function ThreadAuthorMeta({ authorName, createdAt, showCreator, showMine, trailing, className }: ThreadAuthorMetaProps): import("react").JSX.Element | null;
export {};
//# sourceMappingURL=ThreadAuthorMeta.d.ts.map