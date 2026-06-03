import type { ReportAuthor } from "../../../types/report.js";
type AuthorSelectorProps = {
    authors: ReportAuthor[];
    value: string;
    onChange: (nextValue: string) => void;
};
export declare function AuthorSelector({ authors, value, onChange }: AuthorSelectorProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=AuthorSelector.d.ts.map