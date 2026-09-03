import { CheckCircleIcon } from "@/shared/components/icons/Icons.js";
import { StyleInspectTooltip, StyleInspectTooltipRow } from "@/surfaces/tooltip/StyleInspectTooltip.js";
import { useReportPreferences, useReportSession } from "@/shared/providers/reportContext.js";
import { ACCENT_COLOR } from "@/shared/constants/accentColors.js";
import type { TargetSnapshot } from "@/shared/types/report-ui.js";

const TAGGED_REPORT_ID_COLOR = ACCENT_COLOR.green;

type InspectTooltipProps = {
    target: TargetSnapshot;
};

function ReportIdStatusIcon({ tagged }: { tagged: boolean }) {
    if (tagged) {
        return (
            <CheckCircleIcon
                className="h-[16px] w-[16px] shrink-0"
                fill={TAGGED_REPORT_ID_COLOR}
            />
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

export function InspectTooltip({ target }: InspectTooltipProps) {
    const { messages } = useReportPreferences();
    const { hoverPointer } = useReportSession();

    if (!hoverPointer) {
        return null;
    }

    const tagName = target.tagName ?? "—";
    const sizeLabel = `${Math.round(target.rect.width)} × ${Math.round(target.rect.height)}`;
    const reportIdValue = target.reportIdAttribute ?? messages.pickTarget.tooltipNoReportId;

    return (
        <StyleInspectTooltip
            open
            pointer={hoverPointer}
        >
            <StyleInspectTooltipRow
                label={messages.pickTarget.tooltipTag}
                value={`<${tagName}>`}
            />
            <StyleInspectTooltipRow
                label={messages.pickTarget.tooltipSize}
                value={sizeLabel}
            />
            {target.boxStyle ? (
                <>
                    <StyleInspectTooltipRow
                        label={messages.pickTarget.tooltipDisplay}
                        value={target.boxStyle.display}
                    />
                    <StyleInspectTooltipRow
                        label={messages.pickTarget.tooltipPadding}
                        value={target.boxStyle.padding}
                    />
                    <StyleInspectTooltipRow
                        label={messages.pickTarget.tooltipMargin}
                        value={target.boxStyle.margin}
                    />
                </>
            ) : null}

            {target.fontStyle ? (
                <>
                    <StyleInspectTooltipRow
                        label={messages.pickTarget.tooltipFontFamily}
                        value={target.fontStyle.fontFamily}
                    />
                    <StyleInspectTooltipRow
                        label={messages.pickTarget.tooltipFontSize}
                        value={target.fontStyle.fontSize}
                    />
                    <StyleInspectTooltipRow
                        label={messages.pickTarget.tooltipFontWeight}
                        value={target.fontStyle.fontWeight}
                    />
                    <StyleInspectTooltipRow
                        label={messages.pickTarget.tooltipLineHeight}
                        value={target.fontStyle.lineHeight}
                    />
                </>
            ) : null}

            <div className="flex flex-col gap-[6px] border-t border-[var(--adaptive-border-subtle)] pt-[8px] mt-[8px]">
                {target.fpOpenAttribute ? (
                    <StyleInspectTooltipRow
                        label={messages.pickTarget.tooltipFpOpen}
                        value={target.fpOpenAttribute}
                    />
                ) : null}
                {target.fpViewAttribute ? (
                    <StyleInspectTooltipRow
                        label={messages.pickTarget.tooltipFpView}
                        value={target.fpViewAttribute}
                    />
                ) : null}
                <div className="flex items-start justify-between gap-[8px] text-[14px]">
                    <span className="shrink-0 text-[var(--adaptive-black500)]">{messages.pickTarget.tooltipReportId}</span>
                    <div className="flex min-w-0 items-start justify-end gap-[6px]">
                        <ReportIdStatusIcon tagged={target.isTagged} />
                        <span className="min-w-0 break-all text-right font-[var(--coding-font)] text-[var(--adaptive-black700)]">{reportIdValue}</span>
                    </div>
                </div>
            </div>
        </StyleInspectTooltip>
    );
}
