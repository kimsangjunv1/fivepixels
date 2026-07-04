import type { ReportCase } from "../../../types/report.js";
type FeedbackCaseEditorProps = {
    cases: ReportCase[];
    onCaseChange: (caseId: string, text: string) => void;
    onAddCase: () => void;
    onRemoveCase: (caseId: string) => void;
    autoFocus?: boolean;
    onSubmitShortcut?: () => void;
};
export declare function FeedbackCaseEditor({ cases, onCaseChange, onAddCase, onRemoveCase, autoFocus, onSubmitShortcut }: FeedbackCaseEditorProps): import("react/jsx-runtime").JSX.Element | null;
export {};
//# sourceMappingURL=FeedbackCaseEditor.d.ts.map