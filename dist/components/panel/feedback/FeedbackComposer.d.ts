import type { ReportField, ReportFieldValues } from "../../../types/report.js";
import type { ReportAuthor } from "../../../types/report.js";
type FeedbackComposerProps = {
    message: string;
    onMessageChange: (value: string) => void;
    authorName: string;
    onAuthorNameChange: (value: string) => void;
    authors: ReportAuthor[];
    fields: ReportField[];
    fieldValues: ReportFieldValues;
    onFieldChange: (key: string, value: string | boolean) => void;
    showTags?: boolean;
    onSubmit: () => void;
    isSubmitting?: boolean;
    placeholder?: string;
    autoFocus?: boolean;
};
export declare function FeedbackComposer({ message, onMessageChange, authorName, onAuthorNameChange, authors, fields, fieldValues, onFieldChange, showTags, onSubmit, isSubmitting, placeholder, autoFocus, }: FeedbackComposerProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=FeedbackComposer.d.ts.map