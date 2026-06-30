import type { ReportCase } from "../../../types/report.js";
type FeedbackCaseEditorProps = {
    cases: ReportCase[];
    onCaseChange: (caseId: string, text: string) => void;
    onAddCase: () => void;
    onRemoveCase: (caseId: string) => void;
    autoFocus?: boolean;
    placeholder?: string;
    onSubmitShortcut?: () => void;
};
export declare function FeedbackCaseEditor({ cases, onCaseChange, onAddCase, onRemoveCase, autoFocus, placeholder, onSubmitShortcut }: FeedbackCaseEditorProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=FeedbackCaseEditor.d.ts.map