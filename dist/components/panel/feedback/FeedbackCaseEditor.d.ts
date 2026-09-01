import type { ReportCase } from "../../../types/report.js";
import type { ElementMention, UserMention } from "../../../types/mention.js";
type FeedbackCaseEditorProps = {
    cases: ReportCase[];
    onCaseChange: (caseId: string, text: string, mentions?: ElementMention[], userMentions?: UserMention[]) => void;
    onAddCase: () => void;
    onRemoveCase: (caseId: string) => void;
    autoFocus?: boolean;
    onSubmitShortcut?: () => void;
    needsAttention?: boolean;
    attentionKey?: number;
    emptyCaseIds?: string[];
    showTabBar?: boolean;
    activeCaseId?: string | null;
    onActiveCaseIdChange?: (caseId: string) => void;
    enableElementMentions?: boolean;
    placeholder?: string;
};
export declare function FeedbackCaseEditor({ cases, onCaseChange, onAddCase, onRemoveCase, autoFocus, onSubmitShortcut, needsAttention, attentionKey, emptyCaseIds, showTabBar, activeCaseId: controlledActiveCaseId, onActiveCaseIdChange, enableElementMentions, placeholder, }: FeedbackCaseEditorProps): import("react").JSX.Element | null;
export {};
//# sourceMappingURL=FeedbackCaseEditor.d.ts.map