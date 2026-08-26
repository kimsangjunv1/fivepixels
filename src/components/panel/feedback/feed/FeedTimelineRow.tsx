import type { ReactNode } from "react";

export const FEED_RAIL_WIDTH = 32;

export type FeedRowDensity = "comment" | "activity";

type FeedTimelineRowProps = {
    /** Visual node on the vertical spine (avatar or thin icon). */
    node?: ReactNode;
    /** Indent as a nested reply under a parent comment. */
    nested?: boolean;
    /** Hide the continuing spine below this row (e.g. last item). */
    hideLineBelow?: boolean;
    /** Hide the spine above this row (e.g. first item). */
    hideLineAbove?: boolean;
    /** Activity rows stay tight; comments breathe a bit more. */
    density?: FeedRowDensity;
    children: ReactNode;
    className?: string;
};

/**
 * Continuous-spine row for the feed thread layout.
 * One full-height rail line; the node sits on top with a surface fill so the spine reads unbroken.
 */
export function FeedTimelineRow({
    node,
    nested = false,
    hideLineBelow = false,
    hideLineAbove = false,
    density = "comment",
    children,
    className = "",
}: FeedTimelineRowProps) {
    const bottomPad = density === "activity" ? "pb-[6px]" : "pb-[12px]";
    const nodeCenter = density === "activity" ? 12 : 13;

    return (
        <div
            className={`relative grid ${nested ? "ml-[20px]" : ""} ${bottomPad} ${className}`}
            style={{ gridTemplateColumns: `${FEED_RAIL_WIDTH}px minmax(0, 1fr)` }}
        >
            <div className="relative flex justify-center self-stretch">
                <span
                    aria-hidden
                    className="absolute left-1/2 w-px -translate-x-1/2 bg-[var(--adaptive-black300)]"
                    style={{
                        top: hideLineAbove ? nodeCenter : 0,
                        bottom: hideLineBelow ? undefined : 0,
                        height: hideLineBelow ? nodeCenter : undefined,
                    }}
                />
                {nested ? (
                    <span
                        aria-hidden
                        className="absolute left-[-20px] w-[20px] bg-[var(--adaptive-black300)]"
                        style={{ top: nodeCenter, height: 1 }}
                    />
                ) : null}
                <div className="relative z-[1] flex shrink-0 items-start bg-[var(--adaptive-black50)] py-[1px]">{node}</div>
            </div>
            <div className={`min-w-0 ${nested ? "pl-[8px]" : "pl-[10px]"}`}>{children}</div>
        </div>
    );
}

/** Thin icon on the spine — no circular chip (avoids flowchart look). */
export function FeedSpineIcon({ children }: { children: ReactNode }) {
    return (
        <span className="mt-[2px] inline-flex h-[16px] w-[16px] items-center justify-center text-[var(--adaptive-black500)]">
            {children}
        </span>
    );
}

export function FeedSpineDot({ className = "" }: { className?: string }) {
    return <span aria-hidden className={`mt-[6px] h-[6px] w-[6px] rounded-full bg-[var(--adaptive-black400)] ${className}`} />;
}
