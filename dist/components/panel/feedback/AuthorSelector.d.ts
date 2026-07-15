import type { ReportAuthor } from "../../../types/report.js";
type AuthorSelectorProps = {
    authors: ReportAuthor[];
    value: string;
    onChange: (value: string) => void;
};
export declare function AuthorSelector({ authors, value, onChange }: AuthorSelectorProps): import("react").JSX.Element;
export {};
//# sourceMappingURL=AuthorSelector.d.ts.map