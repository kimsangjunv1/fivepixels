import { useCallback, useLayoutEffect, useRef, useState } from "react";
import { useReport } from "@/providers/reportContext.js";
import type { TargetSnapshot } from "@/types/report-ui.js";
import { getHoverTooltipLayout } from "@/utils/hoverTooltipLayout.js";

const TOOLTIP_SURFACE_CLASS =
    "pointer-events-none fixed z-[1000002] min-w-[220px] max-w-[min(320px,calc(100vw-16px))] overflow-hidden rounded-[12px] border border-[var(--adaptive-border-subtle)] bg-[var(--adaptive-surface-overlay)] px-[12px] py-[10px] shadow-[var(--adaptive-popup-shadow)] backdrop-blur-[20px]";

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

export function PickTargetHoverTooltip({ target }: PickTargetHoverTooltipProps) {
    const { messages } = useReport();
    const tooltipRef = useRef<HTMLDivElement | null>(null);
    const [layout, setLayout] = useState<{ top: number; left: number } | null>(null);

    const updateLayout = useCallback(() => {
        const tooltip = tooltipRef.current;

        if (!tooltip) {
            return;
        }

        setLayout(getHoverTooltipLayout(target.rect, tooltip.getBoundingClientRect()));
    }, [target.rect]);

    useLayoutEffect(() => {
        updateLayout();
        const frameId = window.requestAnimationFrame(updateLayout);

        window.addEventListener("resize", updateLayout);
        window.addEventListener("scroll", updateLayout, true);

        return () => {
            window.cancelAnimationFrame(frameId);
            window.removeEventListener("resize", updateLayout);
            window.removeEventListener("scroll", updateLayout, true);
        };
    }, [target, updateLayout]);

    const tagName = target.tagName ?? "—";
    const sizeLabel = `${Math.round(target.rect.width)} × ${Math.round(target.rect.height)}`;
    const reportIdValue = target.reportIdAttribute ?? messages.pickTarget.tooltipNoReportId;

    return (
        <div
            ref={tooltipRef}
            className={TOOLTIP_SURFACE_CLASS}
            style={{
                top: layout?.top ?? target.rect.top,
                left: layout?.left ?? target.rect.left,
                opacity: layout ? 1 : 0,
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
