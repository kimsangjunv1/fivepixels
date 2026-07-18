import { useEffect, useState } from "react";
import { CloseIcon, ChevronDownIcon, FavoritePinIcon } from "@/components/icons/Icons.js";
import { useReportPreferences, useReportSession } from "@/providers/reportContext.js";
import type { PinnedFeedbackItem } from "@/types/pinnedFeedback.js";

function PinRailCard({
    item,
    index,
    onOpen,
    onRemove,
}: {
    item: PinnedFeedbackItem;
    index: number;
    onOpen: (item: PinnedFeedbackItem) => void;
    onRemove: (reportId: string) => void;
}) {
    const { messages } = useReportPreferences();
    const [pulsing, setPulsing] = useState(false);

    const handleOpen = () => {
        setPulsing(true);
        window.setTimeout(() => setPulsing(false), 180);
        onOpen(item);
    };

    return (
        <div
            className={`fivepixels-pin-card-enter group relative flex flex-col gap-[4px] rounded-[10px] border border-[var(--adaptive-border-subtle)] bg-[var(--adaptive-fillOpacity800)] px-[10px] py-[8px] shadow-[var(--adaptive-popup-shadow)] backdrop-blur-[8px] ${
                pulsing ? "fivepixels-pin-card-pulse" : ""
            }`}
            style={{ animationDelay: `${index * 35}ms` }}
        >
            <button
                type="button"
                data-fivepixels-interactive=""
                onClick={handleOpen}
                aria-label={messages.pins.openPinAriaLabel}
                className="flex w-full flex-col gap-[4px] text-left"
            >
                <p className="line-clamp-2 text-[12px] font-semibold leading-[1.35] text-[var(--adaptive-black900)]">{item.summary}</p>
                <p className="truncate text-[10px] text-[var(--adaptive-black500)]">{item.pathname}</p>
            </button>
            <button
                type="button"
                data-fivepixels-interactive=""
                onClick={() => onRemove(item.reportId)}
                aria-label={messages.pins.removePinAriaLabel}
                className="absolute right-[4px] top-[4px] flex h-[20px] w-[20px] items-center justify-center rounded-[6px] text-[var(--adaptive-black400)] opacity-0 transition-opacity hover:bg-[var(--adaptive-tintOpacity200)] hover:text-[var(--adaptive-black900)] group-hover:opacity-100"
            >
                <CloseIcon className="h-[12px] w-[12px]" />
            </button>
        </div>
    );
}

export function FloatingPinRail() {
    const { messages, pinnedFeedbackItems, pinRailCollapsed, setPinRailCollapsed, unpinFeedback } = useReportPreferences();
    const { openPinnedFeedback } = useReportSession();
    const [entered, setEntered] = useState(false);
    const hasPins = pinnedFeedbackItems.length > 0;

    useEffect(() => {
        if (!hasPins) {
            setEntered(false);
            return;
        }

        const frame = window.requestAnimationFrame(() => setEntered(true));
        return () => window.cancelAnimationFrame(frame);
    }, [hasPins]);

    if (!hasPins) {
        return null;
    }

    const expanded = !pinRailCollapsed;

    const handleOpen = (item: PinnedFeedbackItem) => {
        void openPinnedFeedback(item.reportId, {
            caseId: item.caseId,
            pathname: item.pathname,
        });
    };

    return (
        <div
            className={`pointer-events-auto fixed right-[16px] top-[20%] z-[1000002] flex w-[220px] flex-col gap-[8px] ${entered ? "fivepixels-pin-rail-enter" : ""}`}
        >
            <div
                className="fivepixels-pin-rail-shell overflow-hidden rounded-[14px] border border-[var(--adaptive-border-subtle)] bg-[var(--adaptive-fillOpacity700)] shadow-[var(--adaptive-popup-shadow)] backdrop-blur-[12px]"
                data-expanded={expanded ? "true" : "false"}
            >
                <button
                    type="button"
                    data-fivepixels-interactive=""
                    onClick={() => setPinRailCollapsed(!pinRailCollapsed)}
                    aria-expanded={expanded}
                    aria-label={expanded ? messages.pins.railCollapseAriaLabel : messages.pins.railExpandAriaLabel}
                    className="flex w-full items-center justify-between gap-[8px] px-[12px] py-[10px] text-left"
                >
                    <span className="flex min-w-0 items-center gap-[6px]">
                        <FavoritePinIcon
                            filled
                            className="h-[14px] w-[14px] shrink-0 text-[var(--adaptive-blue500)]"
                        />
                        <span className="truncate text-[12px] font-bold text-[var(--adaptive-black900)]">{messages.pins.railTitle}</span>
                        <span className="rounded-[999px] bg-[var(--adaptive-black100)] px-[6px] py-[1px] text-[10px] font-semibold tabular-nums text-[var(--adaptive-black600)]">
                            {messages.pins.railCountLabel(pinnedFeedbackItems.length)}
                        </span>
                    </span>
                    <ChevronDownIcon className={`h-[14px] w-[14px] shrink-0 text-[var(--adaptive-black500)] transition-transform duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] ${expanded ? "rotate-180" : ""}`} />
                </button>

                <div
                    className="fivepixels-pin-rail-body"
                    data-expanded={expanded ? "true" : "false"}
                >
                    <div className="fivepixels-pin-rail-body-inner">
                        <div className="flex flex-col gap-[8px] px-[10px] pb-[10px]">
                            {[...pinnedFeedbackItems].reverse().map((item, index) => (
                                <PinRailCard
                                    key={item.reportId}
                                    item={item}
                                    index={index}
                                    onOpen={handleOpen}
                                    onRemove={unpinFeedback}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
