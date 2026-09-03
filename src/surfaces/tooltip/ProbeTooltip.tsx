import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { CheckIcon, CopyIcon } from "@/shared/components/icons/Icons.js";
import { STYLE_TOOLTIP_SURFACE_CLASS } from "@/surfaces/tooltip/PointerFollowTooltip.js";
import { OverlayShell } from "@/shared/components/ui/OverlayShell.js";
import { useReportPreferences, useReportSession } from "@/shared/providers/reportContext.js";
import { MOTION } from "@/shared/constants/motionClasses.js";
import type { PickProbeFieldKey, PickProbeValues } from "@/shared/types/report-ui.js";
import { isSteppableCssValue, stepCssBoxSides, stepCssPixel } from "@/shared/utils/probe/cssStepper.js";
import { copyTextToClipboard } from "@/shared/utils/feedback/feedbackDataTransfer.js";
import { getPickProbePanelLayout } from "@/shared/utils/probe/pickProbeLayout.js";
import { getProbeColorPreview, isValidProbeHexColor, probeHexToColorInputValue, sanitizeProbeHexInput } from "@/shared/utils/probe/probeColor.js";
import { PickTargetCompareSegment } from "./PickTargetCompareSegment.js";
import { ProbeLayoutControls } from "./ProbeLayoutControls.js";

const PANEL_SURFACE_CLASS = `${STYLE_TOOLTIP_SURFACE_CLASS} ${MOTION.tooltipIn}`;
const PANEL_Z_CLASS = "pointer-events-auto fixed z-[1000002] w-[min(320px,calc(100vw-16px))]";

const PROBE_HEADER_ACTION_CLASS =
    "shrink-0 rounded-[8px] border border-solid border-[var(--adaptive-border-subtle)] px-[8px] py-[4px] text-[14px] font-medium text-[var(--adaptive-black700)] hover:bg-[var(--adaptive-black100)]";

const PROBE_FIELD_LABEL_CLASS = "font-medium text-[var(--adaptive-black500)]";
const PROBE_CONTROL_CLASS =
    "rounded-[8px] border border-solid border-[var(--adaptive-border-subtle)] bg-[var(--adaptive-black50)] text-[var(--adaptive-black900)] outline-none focus:border-[var(--adaptive-border-subtle)]";
const PROBE_INPUT_CLASS = `w-full ${PROBE_CONTROL_CLASS} px-[8px] py-[6px] font-[var(--coding-font)] text-[14px]`;
const PROBE_STEPPER_BUTTON_CLASS = `inline-flex h-[30px] w-[30px] shrink-0 items-center justify-center ${PROBE_CONTROL_CLASS} text-[14px] font-semibold disabled:opacity-40`;

const STEPPER_STEP_PX = 1;

type ProbeTextFieldProps = {
    label: string;
    value: string;
    onChange: (value: string) => void;
};

function ProbeTextField({ label, value, onChange }: ProbeTextFieldProps) {
    return (
        <label className="flex flex-col gap-[4px] text-[14px] leading-[1.45]">
            <span className={PROBE_FIELD_LABEL_CLASS}>{label}</span>
            <input
                type="text"
                data-fivepixels-interactive=""
                value={value}
                onChange={(event) => onChange(event.target.value)}
                className={PROBE_INPUT_CLASS}
            />
        </label>
    );
}

type ProbeColorFieldProps = {
    label: string;
    value: string;
    onChange: (value: string) => void;
};

function ProbeColorField({ label, value, onChange }: ProbeColorFieldProps) {
    const { messages } = useReportPreferences();
    const colorInputRef = useRef<HTMLInputElement | null>(null);
    const copyTimeoutRef = useRef<number | null>(null);
    const [copied, setCopied] = useState(false);
    const preview = getProbeColorPreview(value);
    const canCopy = isValidProbeHexColor(value);

    useEffect(() => {
        return () => {
            if (copyTimeoutRef.current !== null) {
                window.clearTimeout(copyTimeoutRef.current);
            }
        };
    }, []);

    const handleCopy = () => {
        if (!preview) {
            return;
        }

        void copyTextToClipboard(preview)
            .then(() => {
                setCopied(true);

                if (copyTimeoutRef.current !== null) {
                    window.clearTimeout(copyTimeoutRef.current);
                }

                copyTimeoutRef.current = window.setTimeout(() => {
                    setCopied(false);
                    copyTimeoutRef.current = null;
                }, 1000);
            })
            .catch(() => {
                setCopied(false);
            });
    };

    return (
        <label className="flex flex-col gap-[4px] text-[14px] leading-[1.45]">
            <span className={PROBE_FIELD_LABEL_CLASS}>{label}</span>
            <div className="flex items-center gap-[6px]">
                <button
                    type="button"
                    data-fivepixels-interactive=""
                    onClick={() => colorInputRef.current?.click()}
                    className="relative h-[30px] w-[30px] shrink-0 overflow-hidden rounded-[8px] border border-solid border-[var(--adaptive-border-subtle)]"
                    aria-label={label}
                >
                    <span
                        className="absolute inset-0"
                        style={{ backgroundColor: preview ?? "transparent" }}
                        aria-hidden
                    />
                    <input
                        ref={colorInputRef}
                        type="color"
                        data-fivepixels-interactive=""
                        value={probeHexToColorInputValue(value)}
                        onChange={(event) => onChange(event.target.value)}
                        className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                        tabIndex={-1}
                    />
                </button>
                <input
                    type="text"
                    data-fivepixels-interactive=""
                    value={value}
                    onChange={(event) => onChange(sanitizeProbeHexInput(event.target.value))}
                    placeholder="#ededed"
                    className={`min-w-0 flex-1 ${PROBE_CONTROL_CLASS} px-[8px] py-[6px] font-[var(--coding-font)] text-[14px]`}
                />
                <button
                    type="button"
                    data-fivepixels-interactive=""
                    onClick={handleCopy}
                    disabled={!canCopy}
                    aria-label={copied ? messages.common.copied : messages.common.copy}
                    className={`inline-flex h-[30px] w-[30px] shrink-0 items-center justify-center ${PROBE_CONTROL_CLASS} text-[var(--adaptive-black700)] disabled:opacity-40`}
                >
                    {copied ? <CheckIcon className="h-[14px] w-[14px] text-[var(--adaptive-green500)]" /> : <CopyIcon className="h-[14px] w-[14px]" />}
                </button>
            </div>
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
        <div className="flex flex-col gap-[4px] text-[14px] leading-[1.45]">
            <span className={PROBE_FIELD_LABEL_CLASS}>{label}</span>
            <div className="flex items-center gap-[6px]">
                <button
                    type="button"
                    data-fivepixels-interactive=""
                    disabled={!steppable}
                    onClick={() => handleStep(-1)}
                    className={PROBE_STEPPER_BUTTON_CLASS}
                    aria-label={`Decrease ${label}`}
                >
                    −
                </button>
                <div className={`min-w-0 flex-1 ${PROBE_CONTROL_CLASS} px-[8px] py-[6px] text-center font-[var(--coding-font)] text-[14px]`}>{value}</div>
                <button
                    type="button"
                    data-fivepixels-interactive=""
                    disabled={!steppable}
                    onClick={() => handleStep(1)}
                    className={PROBE_STEPPER_BUTTON_CLASS}
                    aria-label={`Increase ${label}`}
                >
                    +
                </button>
            </div>
        </div>
    );
}

export function ProbeTooltip() {
    const { messages } = useReportPreferences();
    const { selectedTarget, pickProbeOpen, pickProbeValues, pickProbeSupportsTextFields, pickProbeLayoutMode, pickProbeCompareMode, pickProbeHasEdits, setPickProbeCompareMode, updatePickProbeValue, resetPickProbeValues, closePickProbe } = useReportSession();

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
        <OverlayShell
            shell="anchored"
            containerRef={panelRef}
            position={{
                left: layout?.left ?? selectedTarget.rect.left,
                top: layout?.top ?? selectedTarget.rect.bottom + 8,
                opacity: layout ? 1 : 0,
            }}
            resizable={false}
            showResizeHandles={false}
            zIndexClassName={PANEL_Z_CLASS}
            surfaceClassName={PANEL_SURFACE_CLASS}
            dataChrome="pick-target-probe"
            onClick={(event) => event.stopPropagation()}
        >
            <div
                className="flex max-h-[min(70vh,560px)] flex-col gap-[6px] overflow-y-auto"
                onContextMenu={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                }}
            >
                <div className="flex items-center justify-between gap-[8px]">
                    <p className="min-w-0 shrink text-[14px] font-semibold leading-[1.45] text-[var(--adaptive-black900)]">{messages.pickTarget.probeTitle}</p>
                    <div className="flex shrink-0 items-center gap-[6px]">
                        {pickProbeHasEdits ? (
                            <PickTargetCompareSegment
                                mode={pickProbeCompareMode}
                                onChange={setPickProbeCompareMode}
                                beforeLabel={messages.pickTarget.probeBefore}
                                afterLabel={messages.pickTarget.probeAfter}
                            />
                        ) : null}
                        <button
                            type="button"
                            data-fivepixels-interactive=""
                            onClick={resetPickProbeValues}
                            className={PROBE_HEADER_ACTION_CLASS}
                        >
                            {messages.pickTarget.probeReset}
                        </button>
                        <button
                            type="button"
                            data-fivepixels-interactive=""
                            onClick={closePickProbe}
                            className={PROBE_HEADER_ACTION_CLASS}
                        >
                            {messages.pickTarget.probeClose}
                        </button>
                    </div>
                </div>

                {pickProbeSupportsTextFields ? (
                    <>
                        <ProbeTextField
                            label={messages.pickTarget.probeText}
                            value={values.textContent}
                            onChange={handleChange("textContent")}
                        />
                        <ProbeStepperField
                            label={messages.pickTarget.probeFontSize}
                            value={values.fontSize}
                            onChange={handleChange("fontSize")}
                        />
                        <ProbeTextField
                            label={messages.pickTarget.probeLineHeight}
                            value={values.lineHeight}
                            onChange={handleChange("lineHeight")}
                        />
                    </>
                ) : null}

                <section className="flex">
                    <ProbeStepperField
                        label={messages.pickTarget.probePadding}
                        value={values.padding}
                        onChange={handleChange("padding")}
                    />
                    <ProbeStepperField
                        label={messages.pickTarget.probeMargin}
                        value={values.margin}
                        onChange={handleChange("margin")}
                    />
                </section>

                <ProbeColorField
                    label={messages.pickTarget.probeTextColor}
                    value={values.textColor}
                    onChange={handleChange("textColor")}
                />
                <ProbeColorField
                    label={messages.pickTarget.probeBackgroundColor}
                    value={values.backgroundColor}
                    onChange={handleChange("backgroundColor")}
                />
                <ProbeColorField
                    label={messages.pickTarget.probeBorderColor}
                    value={values.borderColor}
                    onChange={handleChange("borderColor")}
                />

                <ProbeLayoutControls
                    layoutMode={pickProbeLayoutMode}
                    values={values}
                    messages={messages}
                    onChange={(key, value) => handleChange(key)(value)}
                />
            </div>
        </OverlayShell>
    );
}
