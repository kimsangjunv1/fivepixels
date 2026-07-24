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

export const THREAD_ACTION_STYLE: Record<ThreadActionKind, ThreadActionStyle> = {
    ask: {
        color: "#10B981",
        idleText: "text-[#10B981]",
        idleHoverBg: "hover:bg-[rgba(16,185,129,0.12)]",
        activeBg: "bg-[rgba(16,185,129,0.16)]",
        activeText: "text-[#10B981]",
        tagBg: "bg-[rgba(16,185,129,0.16)]",
        tagText: "text-[#10B981]",
        tagDismissHoverBg: "hover:bg-[rgba(16,185,129,0.24)]",
        cardHighlight: "border-[#10B981] bg-[rgba(16,185,129,0.08)]",
    },
    denied: {
        color: "#FF2B6A",
        idleText: "text-[#FF2B6A]",
        idleHoverBg: "hover:bg-[rgba(255,43,106,0.12)]",
        activeBg: "bg-[rgba(255,43,106,0.16)]",
        activeText: "text-[#FF2B6A]",
        tagBg: "bg-[rgba(255,43,106,0.16)]",
        tagText: "text-[#FF2B6A]",
        tagDismissHoverBg: "hover:bg-[rgba(255,43,106,0.24)]",
        cardHighlight: "border-[#FF2B6A] bg-[rgba(255,43,106,0.08)]",
    },
    complete: {
        color: "#3B82F6",
        idleText: "text-[#3B82F6]",
        idleHoverBg: "hover:bg-[rgba(59,130,246,0.12)]",
        activeBg: "bg-[rgba(59,130,246,0.16)]",
        activeText: "text-[#3B82F6]",
        tagBg: "bg-[rgba(59,130,246,0.16)]",
        tagText: "text-[#3B82F6]",
        tagDismissHoverBg: "hover:bg-[rgba(59,130,246,0.24)]",
        cardHighlight: "border-[#3B82F6] bg-[rgba(59,130,246,0.08)]",
    },
};

export function getThreadActionButtonClass(kind: ThreadActionKind, active: boolean) {
    const style = THREAD_ACTION_STYLE[kind];

    if (active) {
        return `${style.activeBg} ${style.activeText}`;
    }

    return `${style.idleText} ${style.idleHoverBg}`;
}

export function resolveComposerModeActionKind(mode: "deny" | "recheck" | "checkout" | "question"): ThreadActionKind {
    if (mode === "question") {
        return "ask";
    }

    if (mode === "deny" || mode === "recheck") {
        return "denied";
    }

    return "complete";
}
