import type { ReactNode } from "react";
import type { ReportMessages } from "@/i18n/types.js";
import type { PickProbeFieldKey, PickProbeLayoutMode, PickProbeValues } from "@/types/report-ui.js";
import {
    AlignHorizontalCenterIcon,
    AlignHorizontalLeftIcon,
    AlignHorizontalRightIcon,
    AlignJustifyCenterIcon,
    AlignJustifyFlexEndIcon,
    AlignJustifyFlexStartIcon,
    AlignJustifySpaceBetweenIcon,
    AlignVerticalBottomIcon,
    AlignVerticalCenterIcon,
    AlignVerticalTopIcon,
    SwapHorizIcon,
    SwapVertIcon,
    ViewColumnIcon,
    ViewStreamIcon,
} from "@/components/icons/ProbeLayoutIcons.js";
import {
    buildFlexDirection,
    FLEX_ALIGN_VALUES,
    FLEX_JUSTIFY_VALUES,
    getFlexAxis,
    isColumnFlexDirection,
    isFlexReversed,
    stepGridTrackCount,
    stepProbeGap,
    toggleFlexReverse,
} from "@/utils/probe/probeLayout.js";
import type { FlexAlignValue, FlexJustifyValue } from "@/utils/probe/probeLayout.js";

type ProbeLayoutControlsProps = {
    layoutMode: PickProbeLayoutMode;
    values: PickProbeValues;
    messages: ReportMessages;
    onChange: (key: PickProbeFieldKey, value: string) => void;
};

function ProbeLayoutSectionLabel({ children }: { children: ReactNode }) {
    return <span className="text-[11px] font-medium text-[var(--adaptive-black500)]">{children}</span>;
}

function ProbeIconToggleButton({
    active,
    label,
    onClick,
    children,
}: {
    active: boolean;
    label: string;
    onClick: () => void;
    children: ReactNode;
}) {
    return (
        <button
            type="button"
            data-fivepixels-interactive=""
            aria-label={label}
            title={label}
            onClick={onClick}
            className={`inline-flex h-[30px] w-[30px] items-center justify-center rounded-[8px] border transition-colors ${
                active
                    ? "border-[var(--adaptive-blue500)] bg-[var(--adaptive-blue500)]/10 text-[var(--adaptive-blue500)]"
                    : "border-[var(--adaptive-border-subtle)] bg-[var(--adaptive-black50)] text-[var(--adaptive-black700)] hover:bg-[var(--adaptive-black100)]"
            }`}
        >
            {children}
        </button>
    );
}

function ProbeIconToggleGroup({
    label,
    options,
    value,
    onChange,
}: {
    label: string;
    options: Array<{ value: string; label: string; icon: ReactNode }>;
    value: string;
    onChange: (value: string) => void;
}) {
    return (
        <div className="flex flex-col gap-[4px]">
            <ProbeLayoutSectionLabel>{label}</ProbeLayoutSectionLabel>
            <div className="flex flex-wrap gap-[4px]">
                {options.map((option) => (
                    <ProbeIconToggleButton
                        key={option.value}
                        active={value === option.value}
                        label={option.label}
                        onClick={() => onChange(option.value)}
                    >
                        {option.icon}
                    </ProbeIconToggleButton>
                ))}
            </div>
        </div>
    );
}

function ProbeCountStepperField({
    label,
    value,
    onChange,
}: {
    label: string;
    value: string;
    onChange: (value: string) => void;
}) {
    return (
        <div className="flex flex-col gap-[4px] text-[11px]">
            <ProbeLayoutSectionLabel>{label}</ProbeLayoutSectionLabel>
            <div className="flex items-center gap-[6px]">
                <button
                    type="button"
                    data-fivepixels-interactive=""
                    onClick={() => onChange(stepGridTrackCount(value, -1))}
                    className="inline-flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-[8px] border border-[var(--adaptive-border-subtle)] bg-[var(--adaptive-black50)] text-[14px] font-semibold text-[var(--adaptive-black900)]"
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
                    onClick={() => onChange(stepGridTrackCount(value, 1))}
                    className="inline-flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-[8px] border border-[var(--adaptive-border-subtle)] bg-[var(--adaptive-black50)] text-[14px] font-semibold text-[var(--adaptive-black900)]"
                    aria-label={`Increase ${label}`}
                >
                    +
                </button>
            </div>
        </div>
    );
}

function ProbeGapStepperField({
    label,
    value,
    onChange,
}: {
    label: string;
    value: string;
    onChange: (value: string) => void;
}) {
    return (
        <div className="flex flex-col gap-[4px] text-[11px]">
            <ProbeLayoutSectionLabel>{label}</ProbeLayoutSectionLabel>
            <div className="flex items-center gap-[6px]">
                <button
                    type="button"
                    data-fivepixels-interactive=""
                    onClick={() => onChange(stepProbeGap(value, -1))}
                    className="inline-flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-[8px] border border-[var(--adaptive-border-subtle)] bg-[var(--adaptive-black50)] text-[14px] font-semibold text-[var(--adaptive-black900)]"
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
                    onClick={() => onChange(stepProbeGap(value, 1))}
                    className="inline-flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-[8px] border border-[var(--adaptive-border-subtle)] bg-[var(--adaptive-black50)] text-[14px] font-semibold text-[var(--adaptive-black900)]"
                    aria-label={`Increase ${label}`}
                >
                    +
                </button>
            </div>
        </div>
    );
}

function getJustifyOptions(messages: ReportMessages, columnDirection: boolean) {
    const iconClass = "h-[18px] w-[18px]";

    if (columnDirection) {
        return FLEX_JUSTIFY_VALUES.map((value) => {
            const icon =
                value === "flex-start" ? (
                    <AlignVerticalTopIcon className={iconClass} />
                ) : value === "center" ? (
                    <AlignVerticalCenterIcon className={iconClass} />
                ) : value === "flex-end" ? (
                    <AlignVerticalBottomIcon className={iconClass} />
                ) : (
                    <AlignJustifySpaceBetweenIcon className={iconClass} />
                );

            return {
                value,
                label: messages.pickTarget.probeJustifyOptions[value as FlexJustifyValue],
                icon,
            };
        });
    }

    return FLEX_JUSTIFY_VALUES.map((value) => {
        const icon =
            value === "flex-start" ? (
                <AlignJustifyFlexStartIcon className={iconClass} />
            ) : value === "center" ? (
                <AlignJustifyCenterIcon className={iconClass} />
            ) : value === "flex-end" ? (
                <AlignJustifyFlexEndIcon className={iconClass} />
            ) : (
                <AlignJustifySpaceBetweenIcon className={iconClass} />
            );

        return {
            value,
            label: messages.pickTarget.probeJustifyOptions[value as FlexJustifyValue],
            icon,
        };
    });
}

function getAlignOptions(messages: ReportMessages, columnDirection: boolean) {
    const iconClass = "h-[18px] w-[18px]";

    if (columnDirection) {
        return FLEX_ALIGN_VALUES.map((value) => {
            const icon =
                value === "flex-start" ? (
                    <AlignHorizontalLeftIcon className={iconClass} />
                ) : value === "center" ? (
                    <AlignHorizontalCenterIcon className={iconClass} />
                ) : (
                    <AlignHorizontalRightIcon className={iconClass} />
                );

            return {
                value,
                label: messages.pickTarget.probeAlignOptions[value as FlexAlignValue],
                icon,
            };
        });
    }

    return FLEX_ALIGN_VALUES.map((value) => {
        const icon =
            value === "flex-start" ? (
                <AlignVerticalTopIcon className={iconClass} />
            ) : value === "center" ? (
                <AlignVerticalCenterIcon className={iconClass} />
            ) : (
                <AlignVerticalBottomIcon className={iconClass} />
            );

        return {
            value,
            label: messages.pickTarget.probeAlignOptions[value as FlexAlignValue],
            icon,
        };
    });
}

function FlexLayoutControls({ values, messages, onChange }: Omit<ProbeLayoutControlsProps, "layoutMode">) {
    const columnDirection = isColumnFlexDirection(values.flexDirection);
    const axis = getFlexAxis(values.flexDirection);
    const reversed = isFlexReversed(values.flexDirection);
    const iconClass = "h-[18px] w-[18px]";

    return (
        <div className="flex flex-col gap-[10px] border-t border-[var(--adaptive-border-subtle)] pt-[10px]">
            <ProbeIconToggleGroup
                label={messages.pickTarget.probeMainAlign}
                value={values.justifyContent}
                onChange={(value) => onChange("justifyContent", value)}
                options={getJustifyOptions(messages, columnDirection)}
            />
            <ProbeIconToggleGroup
                label={messages.pickTarget.probeCrossAlign}
                value={values.alignItems}
                onChange={(value) => onChange("alignItems", value)}
                options={getAlignOptions(messages, columnDirection)}
            />
            <div className="flex flex-col gap-[4px]">
                <ProbeLayoutSectionLabel>{messages.pickTarget.probeDirection}</ProbeLayoutSectionLabel>
                <div className="flex flex-wrap gap-[4px]">
                    <ProbeIconToggleButton
                        active={axis === "row"}
                        label={messages.pickTarget.probeDirectionRow}
                        onClick={() => onChange("flexDirection", buildFlexDirection("row", reversed))}
                    >
                        <ViewStreamIcon className={iconClass} />
                    </ProbeIconToggleButton>
                    <ProbeIconToggleButton
                        active={axis === "column"}
                        label={messages.pickTarget.probeDirectionColumn}
                        onClick={() => onChange("flexDirection", buildFlexDirection("column", reversed))}
                    >
                        <ViewColumnIcon className={iconClass} />
                    </ProbeIconToggleButton>
                    <ProbeIconToggleButton
                        active={reversed}
                        label={messages.pickTarget.probeDirectionReverse}
                        onClick={() => onChange("flexDirection", toggleFlexReverse(values.flexDirection))}
                    >
                        {columnDirection ? <SwapVertIcon className={iconClass} /> : <SwapHorizIcon className={iconClass} />}
                    </ProbeIconToggleButton>
                </div>
            </div>
            <ProbeGapStepperField label={messages.pickTarget.probeGap} value={values.gap} onChange={(value) => onChange("gap", value)} />
        </div>
    );
}

function GridLayoutControls({ values, messages, onChange }: Omit<ProbeLayoutControlsProps, "layoutMode">) {
    return (
        <div className="flex flex-col gap-[10px] border-t border-[var(--adaptive-border-subtle)] pt-[10px]">
            <ProbeCountStepperField
                label={messages.pickTarget.probeGridColumns}
                value={values.gridColumnCount}
                onChange={(value) => onChange("gridColumnCount", value)}
            />
            <ProbeCountStepperField
                label={messages.pickTarget.probeGridRows}
                value={values.gridRowCount}
                onChange={(value) => onChange("gridRowCount", value)}
            />
            <ProbeGapStepperField label={messages.pickTarget.probeGap} value={values.gap} onChange={(value) => onChange("gap", value)} />
        </div>
    );
}

export function ProbeLayoutControls({ layoutMode, values, messages, onChange }: ProbeLayoutControlsProps) {
    if (layoutMode === "flex") {
        return <FlexLayoutControls values={values} messages={messages} onChange={onChange} />;
    }

    if (layoutMode === "grid") {
        return <GridLayoutControls values={values} messages={messages} onChange={onChange} />;
    }

    return null;
}
