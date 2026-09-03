import type { ReportMessages } from "../../shared/i18n/types.js";
type FeedbackDeleteActionProps = {
    reportId: string;
    onDelete: (id: string) => Promise<void>;
    disabled?: boolean;
    locked?: boolean;
    lockLabel?: string;
    messages: ReportMessages;
    className?: string;
    iconClassName?: string;
    deleteTitle?: string;
    deleteConfirmTitle?: string;
    deleteAriaLabel?: string;
    deleteConfirmAriaLabel?: string;
};
export declare function FeedbackDeleteAction({ reportId, onDelete, disabled, locked, lockLabel, messages, className, iconClassName, deleteTitle, deleteConfirmTitle, deleteAriaLabel, deleteConfirmAriaLabel, }: FeedbackDeleteActionProps): import("react").JSX.Element;
export {};
//# sourceMappingURL=FeedbackDeleteAction.d.ts.map