import type { ReportMessages } from "../../../i18n/types.js";
type FeedbackDeleteActionProps = {
    reportId: string;
    onDelete: (id: string) => Promise<void>;
    disabled?: boolean;
    messages: ReportMessages;
    className?: string;
    iconClassName?: string;
    deleteTitle?: string;
    deleteConfirmTitle?: string;
    deleteAriaLabel?: string;
    deleteConfirmAriaLabel?: string;
};
export declare function FeedbackDeleteAction({ reportId, onDelete, disabled, messages, className, iconClassName, deleteTitle, deleteConfirmTitle, deleteAriaLabel, deleteConfirmAriaLabel, }: FeedbackDeleteActionProps): import("react").JSX.Element;
export {};
//# sourceMappingURL=FeedbackDeleteAction.d.ts.map