import { useCallback, useLayoutEffect, useRef, useState } from "react";
import { useReportPreferences, useReportSession } from "@/providers/reportContext.js";
import { MOTION } from "@/constants/motionClasses.js";
import type { TargetSnapshot } from "@/types/report-ui.js";
import { HOVER_TOOLTIP_MARGIN } from "@/utils/marker/hoverTooltipLayout.js";

const TOOLTIP_SURFACE_CLASS =
    `pointer-events-none fixed z-[1000002] min-w-[220px] max-w-[min(320px,calc(100vw-16px))] overflow-hidden rounded-[12px] border border-[var(--adaptive-border-subtle)] bg-[var(--adaptive-surface-overlay)] px-[12px] py-[10px] shadow-[var(--adaptive-popup-shadow)] backdrop-blur-[20px] ${MOTION.tooltipIn}`;

const POINTER_OFFSET = 12;

type PickTargetHoverTooltipProps = {
    target: TargetSnapshot;
};

function InspectRow({ label, value, valueClassName = "" }: { label: string; value: string; valueClassName?: string }) {
    return (
        <div className="flex items-start justify-between gap-[12px] text-[11px] leading-[1.45]">
            <span className="shrink-0 text-[var(--adaptive-black500)]">{label}</span>
            <span className={`min-w-0 break-all text-right font-[var(--coding-font)] text-[var(--adaptive-black900)] ${valueClassName}`.trim()}>
                {value}
            </span>
        </div>
    );
}

function ReportIdStatusIcon({ tagged }: { tagged: boolean }) {
    if (tagged) {
        return (
            <span
                aria-hidden="true"
                className="inline-flex h-[16px] w-[16px] shrink-0 items-center justify-center rounded-full bg-[#22c55e1f] text-[11px] font-bold text-[#16a34a]"
            >
                ✓
            </span>
        );
    }

    return (
        <span
            aria-hidden="true"
            className="inline-flex h-[16px] w-[16px] shrink-0 items-center justify-center rounded-full bg-[#ef44441f] text-[11px] font-bold text-[#dc2626]"
        >
            ✕
        </span>
    );
}

function getPointerTooltipLayout(clientX: number, clientY: number, tooltipRect: DOMRect) {
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    let left = clientX + POINTER_OFFSET;
    let top = clientY + POINTER_OFFSET;

    if (left + tooltipRect.width > viewportWidth - HOVER_TOOLTIP_MARGIN) {
        left = clientX - POINTER_OFFSET - tooltipRect.width;
    }

    if (top + tooltipRect.height > viewportHeight - HOVER_TOOLTIP_MARGIN) {
        top = clientY - POINTER_OFFSET - tooltipRect.height;
    }

    left = Math.min(Math.max(left, HOVER_TOOLTIP_MARGIN), Math.max(HOVER_TOOLTIP_MARGIN, viewportWidth - HOVER_TOOLTIP_MARGIN - tooltipRect.width));
    top = Math.min(Math.max(top, HOVER_TOOLTIP_MARGIN), Math.max(HOVER_TOOLTIP_MARGIN, viewportHeight - HOVER_TOOLTIP_MARGIN - tooltipRect.height));

    return { top, left };
}

export function PickTargetHoverTooltip({ target }: PickTargetHoverTooltipProps) {
    const { messages } = useReportPreferences();
    const { hoverPointer } = useReportSession();
    const tooltipRef = useRef<HTMLDivElement | null>(null);
    const [layout, setLayout] = useState<{ top: number; left: number } | null>(null);

    const updateLayout = useCallback(() => {
        const tooltip = tooltipRef.current;

        if (!tooltip || !hoverPointer) {
            return;
        }

        setLayout(getPointerTooltipLayout(hoverPointer.clientX, hoverPointer.clientY, tooltip.getBoundingClientRect()));
    }, [hoverPointer]);

    useLayoutEffect(() => {
        if (!hoverPointer) {
            setLayout(null);
            return;
        }

        updateLayout();
        const frameId = window.requestAnimationFrame(updateLayout);

        window.addEventListener("resize", updateLayout);
        window.addEventListener("scroll", updateLayout, true);

        return () => {
            window.cancelAnimationFrame(frameId);
            window.removeEventListener("resize", updateLayout);
            window.removeEventListener("scroll", updateLayout, true);
        };
    }, [hoverPointer, target, updateLayout]);

    if (!hoverPointer) {
        return null;
    }

    const tagName = target.tagName ?? "—";
    const sizeLabel = `${Math.round(target.rect.width)} × ${Math.round(target.rect.height)}`;
    const reportIdValue = target.reportIdAttribute ?? messages.pickTarget.tooltipNoReportId;

    return (
        <div
            ref={tooltipRef}
            className={TOOLTIP_SURFACE_CLASS}
            style={{
                top: layout?.top ?? hoverPointer.clientY + POINTER_OFFSET,
                left: layout?.left ?? hoverPointer.clientX + POINTER_OFFSET,
                visibility: layout ? "visible" : "hidden",
            }}
        >
            <div className="flex flex-col gap-[6px]">
                <InspectRow label={messages.pickTarget.tooltipTag} value={`<${tagName}>`} />
                <InspectRow label={messages.pickTarget.tooltipSize} value={sizeLabel} />
                {target.boxStyle ? (
                    <>
                        <InspectRow label={messages.pickTarget.tooltipDisplay} value={target.boxStyle.display} />
                        <InspectRow label={messages.pickTarget.tooltipPadding} value={target.boxStyle.padding} />
                        <InspectRow label={messages.pickTarget.tooltipMargin} value={target.boxStyle.margin} />
                    </>
                ) : null}

                {target.fontStyle ? (
                    <>
                        <InspectRow label={messages.pickTarget.tooltipFontFamily} value={target.fontStyle.fontFamily} />
                        <InspectRow label={messages.pickTarget.tooltipFontSize} value={target.fontStyle.fontSize} />
                        <InspectRow label={messages.pickTarget.tooltipFontWeight} value={target.fontStyle.fontWeight} />
                        <InspectRow label={messages.pickTarget.tooltipLineHeight} value={target.fontStyle.lineHeight} />
                    </>
                ) : null}

                <div className="mt-[2px] border-t border-[var(--adaptive-border-subtle)] pt-[6px]">
                    <div className="flex items-start justify-between gap-[8px] text-[11px] leading-[1.45]">
                        <span className="shrink-0 text-[var(--adaptive-black500)]">{messages.pickTarget.tooltipReportId}</span>
                        <div className="flex min-w-0 items-start justify-end gap-[6px]">
                            <ReportIdStatusIcon tagged={target.isTagged} />
                            <span className="min-w-0 break-all text-right font-[var(--coding-font)] text-[var(--adaptive-black900)]">
                                {reportIdValue}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
