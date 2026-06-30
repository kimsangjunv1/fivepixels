import { useCallback, useLayoutEffect, useRef, useState } from "react";
import { useReport } from "@/providers/reportContext.js";
import type { PickProbeFieldKey, PickProbeValues } from "@/types/report-ui.js";
import { isSteppableCssValue, stepCssBoxSides, stepCssPixel } from "@/utils/cssStepper.js";
import { getPickProbePanelLayout } from "@/utils/pickProbeLayout.js";
import { PickTargetCompareSegment } from "./PickTargetCompareSegment.js";

const PANEL_SURFACE_CLASS =
    "pointer-events-auto fixed z-[1000002] w-[min(320px,calc(100vw-16px))] overflow-hidden rounded-[12px] border border-[var(--adaptive-border-subtle)] bg-[var(--adaptive-surface-overlay)] shadow-[var(--adaptive-popup-shadow)] backdrop-blur-[20px]";

const STEPPER_STEP_PX = 1;

type ProbeTextFieldProps = {
    label: string;
    value: string;
    onChange: (value: string) => void;
};

function ProbeTextField({ label, value, onChange }: ProbeTextFieldProps) {
    return (
        <label className="flex flex-col gap-[4px] text-[11px]">
            <span className="font-medium text-[var(--adaptive-black500)]">{label}</span>
            <input
                type="text"
                data-fivepixels-interactive=""
                value={value}
                onChange={(event) => onChange(event.target.value)}
                className="w-full rounded-[8px] border border-[var(--adaptive-border-subtle)] bg-[var(--adaptive-black50)] px-[8px] py-[6px] font-[var(--coding-font)] text-[12px] text-[var(--adaptive-black900)] outline-none focus:border-[var(--adaptive-blue500)]"
            />
        </label>
    );
}

type ProbeStepperFieldProps = {
    label: string;
    value: string;
    onChange: (value: string) => void;
};

function ProbeStepperField({ label, value, onChange }: ProbeStepperFieldProps) {
    const steppable = isSteppableCssValue(value);
    const isSinglePixel = /^\d/.test(value.trim()) && !value.trim().includes(" ");

    const handleStep = (delta: number) => {
        if (!steppable) {
            return;
        }

        onChange(isSinglePixel ? stepCssPixel(value, delta * STEPPER_STEP_PX) : stepCssBoxSides(value, delta * STEPPER_STEP_PX));
    };

    return (
        <div className="flex flex-col gap-[4px] text-[11px]">
            <span className="font-medium text-[var(--adaptive-black500)]">{label}</span>
            <div className="flex items-center gap-[6px]">
                <button
                    type="button"
                    data-fivepixels-interactive=""
                    disabled={!steppable}
                    onClick={() => handleStep(-1)}
                    className="inline-flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-[8px] border border-[var(--adaptive-border-subtle)] bg-[var(--adaptive-black50)] text-[14px] font-semibold text-[var(--adaptive-black900)] disabled:opacity-40"
                    aria-label={`Decrease ${label}`}
                >
                    −
                </button>
                <div className="min-w-0 flex-1 rounded-[8px] border border-[var(--adaptive-border-subtle)] bg-[var(--adaptive-black50)] px-[8px] py-[6px] text-center font-[var(--coding-font)] text-[12px] text-[var(--adaptive-black900)]">
                    {value}
                </div>
                <button
                    type="button"
                    data-fivepixels-interactive=""
                    disabled={!steppable}
                    onClick={() => handleStep(1)}
                    className="inline-flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-[8px] border border-[var(--adaptive-border-subtle)] bg-[var(--adaptive-black50)] text-[14px] font-semibold text-[var(--adaptive-black900)] disabled:opacity-40"
                    aria-label={`Increase ${label}`}
                >
                    +
                </button>
            </div>
        </div>
    );
}

export function PickTargetProbePanel() {
    const {
        messages,
        selectedTarget,
        pickProbeOpen,
        pickProbeValues,
        pickProbeCompareMode,
        pickProbeHasEdits,
        draft,
        setPickProbeCompareMode,
        updatePickProbeValue,
        resetPickProbeValues,
        insertPickProbeSummaryToDraft,
    } = useReport();

    const panelRef = useRef<HTMLDivElement | null>(null);
    const [layout, setLayout] = useState<ReturnType<typeof getPickProbePanelLayout> | null>(null);

    const updateLayout = useCallback(() => {
        const panel = panelRef.current;

        if (!panel || !selectedTarget) {
            return;
        }

        const rect = panel.getBoundingClientRect();
        setLayout(getPickProbePanelLayout(selectedTarget.rect, rect.width, rect.height));
    }, [selectedTarget]);

    useLayoutEffect(() => {
        if (!pickProbeOpen || !selectedTarget) {
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
    }, [pickProbeOpen, selectedTarget, pickProbeValues, updateLayout]);

    if (!pickProbeOpen || !selectedTarget || !pickProbeValues) {
        return null;
    }

    const handleChange = (key: PickProbeFieldKey) => (value: string) => {
        updatePickProbeValue(key, value);
    };

    const values: PickProbeValues = pickProbeValues;

    return (
        <div
            ref={panelRef}
            data-fivepixels-interactive=""
            onClick={(event) => event.stopPropagation()}
            onContextMenu={(event) => {
                event.preventDefault();
                event.stopPropagation();
            }}
            className={PANEL_SURFACE_CLASS}
            style={{
                top: layout?.top ?? selectedTarget.rect.bottom + 8,
                left: layout?.left ?? selectedTarget.rect.left,
                opacity: layout ? 1 : 0,
            }}
        >
            <div className="flex flex-col gap-[10px] px-[12px] py-[10px]">
                <div className="flex items-center justify-between gap-[8px]">
                    <p className="text-[12px] font-semibold text-[var(--adaptive-black900)]">{messages.pickTarget.probeTitle}</p>
                    {pickProbeHasEdits ? (
                        <PickTargetCompareSegment
                            mode={pickProbeCompareMode}
                            onChange={setPickProbeCompareMode}
                            beforeLabel={messages.pickTarget.probeBefore}
                            afterLabel={messages.pickTarget.probeAfter}
                        />
                    ) : null}
                </div>

                <ProbeTextField label={messages.pickTarget.probeText} value={values.textContent} onChange={handleChange("textContent")} />
                <ProbeStepperField label={messages.pickTarget.probeFontSize} value={values.fontSize} onChange={handleChange("fontSize")} />
                <ProbeStepperField label={messages.pickTarget.probePadding} value={values.padding} onChange={handleChange("padding")} />
                <ProbeStepperField label={messages.pickTarget.probeMargin} value={values.margin} onChange={handleChange("margin")} />
                <ProbeTextField label={messages.pickTarget.probeLineHeight} value={values.lineHeight} onChange={handleChange("lineHeight")} />

                <div className="flex flex-wrap items-center justify-end gap-[6px] border-t border-[var(--adaptive-border-subtle)] pt-[8px]">
                    <button
                        type="button"
                        data-fivepixels-interactive=""
                        onClick={resetPickProbeValues}
                        className="rounded-[8px] border border-[var(--adaptive-border-subtle)] px-[10px] py-[5px] text-[11px] font-medium text-[var(--adaptive-black700)]"
                    >
                        {messages.pickTarget.probeReset}
                    </button>
                    <button
                        type="button"
                        data-fivepixels-interactive=""
                        disabled={!pickProbeHasEdits || !draft}
                        onClick={() => insertPickProbeSummaryToDraft()}
                        className="rounded-[8px] bg-[var(--adaptive-blue500)] px-[10px] py-[5px] text-[11px] font-semibold text-white disabled:opacity-50"
                    >
                        {messages.pickTarget.probeInsertSummary}
                    </button>
                </div>
            </div>
        </div>
    );
}
