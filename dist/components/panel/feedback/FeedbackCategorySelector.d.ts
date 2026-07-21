import { type FeedbackCategory } from "../../../constants/feedbackCategory.js";
import type { ReportMessages } from "../../../i18n/types.js";
type FeedbackCategorySelectorProps = {
    value: FeedbackCategory | null;
    onChange: (value: FeedbackCategory) => void;
    messages: ReportMessages;
    needsAttention?: boolean;
    attentionKey?: number;
};
export declare function FeedbackCategorySelector({ value, onChange, messages, needsAttention, attentionKey }: FeedbackCategorySelectorProps): import("react").JSX.Element;
export {};
//# sourceMappingURL=FeedbackCategorySelector.d.ts.map