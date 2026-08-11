import { useEffect, useMemo, useState } from "react";
import { CloseIcon, ChevronDownIcon } from "@/components/icons/Icons.js";
import { PinDockGuides } from "@/components/overlay/PinDockGuides.js";
import { MOTION } from "@/constants/motionClasses.js";
import { getStoredPanelPlacement } from "@/hooks/usePanelDock.js";
import { usePinRailDock } from "@/hooks/usePinRailDock.js";
import { useReportData, useReportPreferences, useReportSession } from "@/providers/reportContext.js";
import type { PanelPlacement } from "@/hooks/usePanelDock.js";
import type { PinnedFeedbackItem } from "@/types/pinnedFeedback.js";
import { formatFeedbackCaseId } from "@/utils/feedback/feedbackCaseId.js";
import { getPinnedFeedbackCaseProgress, type PinnedFeedbackCaseProgress } from "@/utils/pinned/pinnedFeedback.js";

function CircularProgress({ progress, size = 30, showPercentLabel = false }: { progress: PinnedFeedbackCaseProgress; size?: number; showPercentLabel?: boolean }) {
    const { messages } = useReportPreferences();
    const strokeWidth = showPercentLabel ? 1.5 : 1.3;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (progress.percentage / 100) * circumference;
    const labelSize = Math.max(9, Math.round(size * 0.28));

    return (
        <span
            className="relative inline-flex shrink-0 items-center justify-center"
            style={{ width: size, height: size }}
            role="img"
            aria-label={messages.pins.progressAriaLabel(progress.resolved, progress.total, progress.percentage)}
        >
            <svg
                viewBox={`0 0 ${size} ${size}`}
                className="h-full w-full -rotate-90"
                aria-hidden
            >
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke="var(--adaptive-black500)"
                    strokeWidth={strokeWidth}
                />
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke="var(--adaptive-blue500)"
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    className="transition-[stroke-dashoffset] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
                />
            </svg>
            {showPercentLabel ? (
                <span
                    className="absolute inset-0 flex items-center justify-center font-bold tabular-nums text-[var(--adaptive-blue500)]"
                    style={{ fontSize: `${labelSize}px` }}
                    aria-hidden
                >
                    {progress.percentage}%
                </span>
            ) : null}
        </span>
    );
}

function PinRailCard({ item, index, onOpen, onRemove }: { item: PinnedFeedbackItem; index: number; onOpen: (item: PinnedFeedbackItem) => void; onRemove: (reportId: string) => void }) {
    const { messages } = useReportPreferences();
    const [pulsing, setPulsing] = useState(false);

    const handleOpen = () => {
        setPulsing(true);
        window.setTimeout(() => setPulsing(false), 180);
        onOpen(item);
    };

    return (
        <div
            className={`${MOTION.pinCardEnter} group relative flex border-b border-[var(--adaptive-border-subtle)] last:border-b-0 bg-[var(--adaptive-tintOpacity50)] ${
                pulsing ? MOTION.pinCardPulse : ""
            }`}
            style={{ animationDelay: `${index * 35}ms` }}
        >
            <button
                type="button"
                data-fivepixels-interactive=""
                onClick={handleOpen}
                aria-label={messages.pins.openPinAriaLabel}
                className="flex min-w-0 flex-1 text-left hover:bg-[var(--adaptive-black300)]"
            >
                <span className="flex min-w-[72px] shrink-0 items-center justify-center border-r border-r-[var(--adaptive-border-subtle)] px-[8px] py-[8px] text-[12px] font-semibold text-[var(--adaptive-black900)]">
                    {item.fcNumber ? formatFeedbackCaseId(item.fcNumber) : "#FC-—"}
                </span>
                <span className="min-w-0 flex-1 truncate px-[12px] py-[8px] pr-[28px] text-[11px] leading-[1.35] text-[var(--adaptive-black500)]">{item.summary}</span>
            </button>
            <button
                type="button"
                data-fivepixels-interactive=""
                onClick={() => onRemove(item.reportId)}
                aria-label={messages.pins.removePinAriaLabel}
                className="absolute right-[6px] top-1/2 z-[1] flex h-[20px] w-[20px] -translate-y-1/2 items-center justify-center rounded-[4px] text-[var(--adaptive-black400)] opacity-0 transition-opacity hover:bg-[var(--adaptive-tintOpacity200)] hover:text-[var(--adaptive-black900)] group-hover:opacity-100"
            >
                <CloseIcon className="h-[12px] w-[12px]" />
            </button>
        </div>
    );
}

type PinnedRouteGroup = {
    pathname: string;
    items: PinnedFeedbackItem[];
    progress: PinnedFeedbackCaseProgress;
};

function PinnedRouteAccordion({
    group,
    collapsed,
    isFirst,
    onToggle,
    onOpen,
    onRemove,
}: {
    group: PinnedRouteGroup;
    collapsed: boolean;
    isFirst: boolean;
    onToggle: () => void;
    onOpen: (item: PinnedFeedbackItem) => void;
    onRemove: (reportId: string) => void;
}) {
    const { messages } = useReportPreferences();
    const expanded = !collapsed;

    return (
        <section className="overflow-hidden">
            <button
                type="button"
                data-fivepixels-interactive=""
                onClick={onToggle}
                aria-expanded={expanded}
                aria-label={messages.pins.routeToggleAriaLabel(group.pathname)}
                className={`sticky top-0 z-10 flex w-full items-center justify-between gap-[8px] bg-[var(--adaptive-black300)] p-[4px_12px] text-left ${
                    isFirst ? "border-b border-b-[var(--adaptive-border-subtle)]" : "border-y border-y-[var(--adaptive-border-subtle)]"
                }`}
            >
                <span className="flex min-w-0 items-center gap-[7px]">
                    <CircularProgress
                        progress={group.progress}
                        size={22}
                    />
                    <span className="min-w-0">
                        <span className="block truncate text-[11px] font-semibold text-[var(--adaptive-black900)]">{group.pathname}</span>
                        <span className="block text-[10px] tabular-nums text-[var(--adaptive-black500)]">{messages.pins.completedCasesLabel(group.progress.resolved, group.progress.total)}</span>
                    </span>
                </span>
                <ChevronDownIcon
                    className={`h-[13px] w-[13px] shrink-0 text-[var(--adaptive-black500)] transition-transform duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] ${expanded ? "rotate-180" : ""}`}
                />
            </button>

            <div
                className={MOTION.pinRailBody}
                data-expanded={expanded ? "true" : "false"}
            >
                <div className={MOTION.pinRailBodyInner}>
                    <div className="flex flex-col">
                        {group.items.map((item, index) => (
                            <PinRailCard
                                key={item.reportId}
                                item={item}
                                index={index}
                                onOpen={onOpen}
                                onRemove={onRemove}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}

export function FloatingPinRail() {
    const {
        messages,
        pinnedFeedbackItems,
        pinRailCollapsed,
        pinRailPlacement,
        setPinRailCollapsed,
        setPinRailPlacement,
        unpinFeedback,
        syncPinnedFeedbackReports,
        isMobileViewport,
    } = useReportPreferences();
    const { openPinnedFeedback } = useReportSession();
    const { reports, allPageReports } = useReportData();
    const [entered, setEntered] = useState(false);
    const [collapsedRoutes, setCollapsedRoutes] = useState<Set<string>>(() => new Set());
    const [hovered, setHovered] = useState(false);
    const [panelPlacement, setPanelPlacement] = useState<PanelPlacement | null>(() => (typeof window === "undefined" ? null : getStoredPanelPlacement()));
    const hasPins = pinnedFeedbackItems.length > 0;
    const expanded = !pinRailCollapsed;
    const peeking = !expanded && !hovered;

    const { railRef, railStyle, isDragging, activeEdge, handleDragHandlePointerDown, consumeClickSuppressed } = usePinRailDock({
        enabled: hasPins && !isMobileViewport,
        collapsed: !expanded,
        peeking,
        placement: pinRailPlacement,
        onPlacementChange: setPinRailPlacement,
        onTap: () => setPinRailCollapsed(expanded),
        panelPlacement,
    });

    const enrichedItems = useMemo(() => {
        const reportById = new Map([...allPageReports, ...reports].map((report) => [report.id, report]));

        return [...pinnedFeedbackItems].reverse().map((item) => {
            const report = reportById.get(item.reportId);

            if (!report) {
                return item;
            }

            return {
                ...item,
                fcNumber: report.fc_number ?? item.fcNumber ?? null,
                pathname: report.pathname,
                cases: report.cases.map((caseItem) => ({
                    id: caseItem.id,
                    status: caseItem.status,
                })),
            };
        });
    }, [allPageReports, pinnedFeedbackItems, reports]);
    const routeGroups = useMemo<PinnedRouteGroup[]>(() => {
        const groups = new Map<string, PinnedFeedbackItem[]>();

        for (const item of enrichedItems) {
            const current = groups.get(item.pathname);

            if (current) {
                current.push(item);
            } else {
                groups.set(item.pathname, [item]);
            }
        }

        return [...groups].map(([pathname, items]) => ({
            pathname,
            items,
            progress: getPinnedFeedbackCaseProgress(items),
        }));
    }, [enrichedItems]);
    const overallProgress = useMemo(() => getPinnedFeedbackCaseProgress(enrichedItems), [enrichedItems]);

    useEffect(() => {
        syncPinnedFeedbackReports([...allPageReports, ...reports]);
    }, [allPageReports, reports, syncPinnedFeedbackReports]);

    useEffect(() => {
        if (!hasPins) {
            setEntered(false);
            return;
        }

        const frame = window.requestAnimationFrame(() => setEntered(true));
        return () => window.cancelAnimationFrame(frame);
    }, [hasPins]);

    useEffect(() => {
        const syncPlacement = () => setPanelPlacement(getStoredPanelPlacement());

        syncPlacement();
        window.addEventListener("storage", syncPlacement);
        window.addEventListener("resize", syncPlacement);
        window.addEventListener("fivepixels:panel-placement", syncPlacement);

        return () => {
            window.removeEventListener("storage", syncPlacement);
            window.removeEventListener("resize", syncPlacement);
            window.removeEventListener("fivepixels:panel-placement", syncPlacement);
        };
    }, []);

    useEffect(() => {
        if (isDragging) {
            setPanelPlacement(getStoredPanelPlacement());
        }
    }, [isDragging]);

    if (!hasPins) {
        return null;
    }

    const handleOpen = (item: PinnedFeedbackItem) => {
        void openPinnedFeedback(item.reportId, {
            caseId: item.caseId,
            pathname: item.pathname,
        });
    };

    return (
        <>
            <PinDockGuides
                visible={isDragging}
                activeEdge={activeEdge}
            />

            <div
                ref={railRef}
                data-fp-chrome="pin"
                data-collapsed={expanded ? "false" : "true"}
                data-dragging={isDragging ? "true" : "false"}
                onPointerEnter={() => setHovered(true)}
                onPointerLeave={() => setHovered(false)}
                className={`pointer-events-auto z-[1000002] ${MOTION.pinRailDock} ${isDragging ? MOTION.pinRailDockDragging : ""} ${entered ? MOTION.pinRailEnter : ""} ${
                    expanded
                        ? "flex flex-col backdrop-blur-[10px] rounded-[16px] bg-[var(--adaptive-neutralTintOpacity900)] border border-[var(--adaptive-border-subtle)] shadow-[var(--adaptive-popup-shadow)]"
                        : ""
                }`}
                style={railStyle}
            >
                {!expanded ? (
                    <button
                        type="button"
                        data-fivepixels-interactive=""
                        onClick={() => {
                            if (consumeClickSuppressed()) {
                                return;
                            }

                            setPinRailCollapsed(false);
                        }}
                        onPointerDown={handleDragHandlePointerDown}
                        aria-expanded={false}
                        aria-label={messages.pins.railExpandAriaLabel}
                        title={messages.pins.repositionTitle}
                        className="flex h-[52px] w-[52px] items-center justify-center rounded-full border border-[var(--adaptive-border-subtle)] bg-[var(--adaptive-neutralTintOpacity900)] shadow-[var(--adaptive-popup-shadow)] backdrop-blur-[10px] transition-transform duration-200 ease-[cubic-bezier(0.34,1.28,0.64,1)] hover:scale-[1.04] cursor-grab active:cursor-grabbing"
                    >
                        <CircularProgress
                            progress={overallProgress}
                            size={44}
                            showPercentLabel
                        />
                    </button>
                ) : (
                    <div
                        className={`${MOTION.pinRailShell} overflow-hidden`}
                        data-expanded="true"
                    >
                        <button
                            type="button"
                            data-fivepixels-interactive=""
                            onClick={() => {
                                if (consumeClickSuppressed()) {
                                    return;
                                }

                                setPinRailCollapsed(true);
                            }}
                            onPointerDown={handleDragHandlePointerDown}
                            aria-expanded={true}
                            aria-label={messages.pins.railCollapseAriaLabel}
                            title={messages.pins.repositionTitle}
                            className="flex w-full cursor-grab items-center justify-between gap-[8px] border-b border-b-[var(--adaptive-border-subtle)] px-[12px] py-[8px] text-left active:cursor-grabbing"
                        >
                            <span className="flex min-w-0 items-center gap-[7px]">
                                <span className="truncate text-[12px] font-bold text-[var(--adaptive-black900)]">{messages.pins.railTitle}</span>
                                <span className="rounded-[4px] border border-[var(--adaptive-border-subtle)] bg-[var(--adaptive-black100)] px-[5px] py-[1px] text-[10px] font-semibold tabular-nums text-[var(--adaptive-black600)]">
                                    {messages.pins.railCountLabel(pinnedFeedbackItems.length)}
                                </span>
                                <CircularProgress
                                    progress={overallProgress}
                                    size={20}
                                    showPercentLabel
                                />
                            </span>
                            <ChevronDownIcon className="h-[14px] w-[14px] shrink-0 rotate-180 text-[var(--adaptive-black500)] transition-transform duration-200 ease-[cubic-bezier(0.22,1,0.36,1)]" />
                        </button>

                        <div
                            className={MOTION.pinRailBody}
                            data-expanded="true"
                        >
                            <div className={MOTION.pinRailBodyInner}>
                                <div className="max-h-[min(60vh,520px)] overflow-y-auto">
                                    {routeGroups.map((group, index) => (
                                        <PinnedRouteAccordion
                                            key={group.pathname}
                                            group={group}
                                            isFirst={index === 0}
                                            collapsed={collapsedRoutes.has(group.pathname)}
                                            onToggle={() => {
                                                setCollapsedRoutes((current) => {
                                                    const next = new Set(current);

                                                    if (next.has(group.pathname)) {
                                                        next.delete(group.pathname);
                                                    } else {
                                                        next.add(group.pathname);
                                                    }

                                                    return next;
                                                });
                                            }}
                                            onOpen={handleOpen}
                                            onRemove={unpinFeedback}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}
