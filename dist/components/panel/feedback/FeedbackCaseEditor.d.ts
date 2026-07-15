import type { ReportCase } from "../../../types/report.js";
type FeedbackCaseEditorProps = {
    cases: ReportCase[];
    onCaseChange: (caseId: string, text: string) => void;
    onAddCase: () => void;
    onRemoveCase: (caseId: string) => void;
    autoFocus?: boolean;
    onSubmitShortcut?: () => void;
    needsAttention?: boolean;
    attentionKey?: number;
    emptyCaseIds?: string[];
};
export declare function FeedbackCaseEditor({ cases, onCaseChange, onAddCase, onRemoveCase, autoFocus, onSubmitShortcut, needsAttention, attentionKey, emptyCaseIds, }: FeedbackCaseEditorProps): import("react").JSX.Element | null;
export {};
//# sourceMappingURL=FeedbackCaseEditor.d.ts.map