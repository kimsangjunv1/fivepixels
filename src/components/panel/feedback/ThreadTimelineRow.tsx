import type { ReactNode } from "react";

/** Fixed width of the left time-rail column shared across every thread entry. */
export const TIMELINE_RAIL_WIDTH = 46;

type ThreadTimelineRowProps = {
    time?: string;
    children: ReactNode;
    className?: string;
};

export function ThreadTimelineRow({ time, children, className = "" }: ThreadTimelineRowProps) {
    return (
        <div className={`grid grid-cols-[46px_minmax(0,1fr)] ${className}`}>
            {/* <div className="pt-[2px]"> */}
            <div>{time ? <p className="rounded-full bg-[var(--adaptive-black900)] px-[4px] py-[2px] text-center text-[12px] text-[var(--adaptive-black200)]">{time}</p> : null}</div>
            <div className="min-w-0 pb-[16px] pl-[14px] flex flex-col gap-[4px]">{children}</div>
        </div>
    );
}
