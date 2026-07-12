import { type FeedbackCategory } from "../../../constants/feedbackCategory.js";
import type { ReportMessages } from "../../../i18n/types.js";
type FeedbackCategorySelectorProps = {
    value: FeedbackCategory | null;
    onChange: (value: FeedbackCategory) => void;
    messages: ReportMessages;
};
export declare function FeedbackCategorySelector({ value, onChange, messages }: FeedbackCategorySelectorProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=FeedbackCategorySelector.d.ts.map