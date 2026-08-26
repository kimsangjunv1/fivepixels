import type { ReactNode } from "react";

export const FEED_RAIL_WIDTH = 32;
/** Nested replies indent; L-branch connects back to the main track spine. */
export const FEED_NESTED_OFFSET = 20;

export type FeedRowDensity = "comment" | "activity";

type FeedTimelineRowProps = {
    /** Visual node on the vertical spine (avatar or thin icon). */
    node?: ReactNode;
    /** Indent as a nested reply under a parent comment (keeps L-branch). */
    nested?: boolean;
    /** @deprecated Main spine is drawn by FeedTimelineTrack; kept for API compat. */
    hideLineBelow?: boolean;
    /** @deprecated Main spine is drawn by FeedTimelineTrack; kept for API compat. */
    hideLineAbove?: boolean;
    /** Activity rows stay tight; comments breathe a bit more. */
    density?: FeedRowDensity;
    children: ReactNode;
    className?: string;
};

/**
 * Feed row. Root rows sit on FeedTimelineTrack's continuous spine.
 * Nested rows keep the L-branch connector + a short nested rail for question threads.
 */
export function FeedTimelineRow({
    node,
    nested = false,
    density = "comment",
    children,
    className = "",
}: FeedTimelineRowProps) {
    const bottomPad = density === "activity" ? "pb-[6px]" : "pb-[12px]";
    const nodeCenter = density === "activity" ? 12 : 13;
    const mainSpineX = FEED_RAIL_WIDTH / 2 - FEED_NESTED_OFFSET;
    const branchWidth = FEED_RAIL_WIDTH / 2 - mainSpineX;

    return (
        <div
            className={`relative grid ${bottomPad} ${className}`}
            style={{
                gridTemplateColumns: `${FEED_RAIL_WIDTH}px minmax(0, 1fr)`,
                marginLeft: nested ? FEED_NESTED_OFFSET : undefined,
            }}
        >
            <div className="relative flex justify-center self-stretch">
                {nested ? (
                    <>
                        {/* L-branch: horizontal from main track spine to nested node */}
                        <span
                            aria-hidden
                            className="absolute bg-[var(--adaptive-black300)]"
                            style={{
                                left: mainSpineX,
                                top: nodeCenter,
                                width: branchWidth,
                                height: 1,
                            }}
                        />
                        {/* Nested vertical rail among question replies */}
                        <span
                            aria-hidden
                            className="absolute bottom-0 left-1/2 top-0 w-px -translate-x-1/2 bg-[var(--adaptive-black300)]"
                        />
                    </>
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
