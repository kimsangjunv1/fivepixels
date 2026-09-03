export type ThreadActionKind = "ask" | "denied" | "complete";
export type ThreadActionStyle = {
    color: string;
    idleText: string;
    idleHoverBg: string;
    activeBg: string;
    activeText: string;
    tagBg: string;
    tagText: string;
    tagDismissHoverBg: string;
    cardHighlight: string;
};
export declare const THREAD_ACTION_STYLE: Record<ThreadActionKind, ThreadActionStyle>;
export declare function getThreadActionButtonClass(kind: ThreadActionKind, active: boolean): string;
export declare function resolveComposerModeActionKind(mode: "deny" | "recheck" | "checkout" | "question"): ThreadActionKind;
//# sourceMappingURL=threadActionStyles.d.ts.map