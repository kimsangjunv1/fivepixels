import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { AlignHorizontalCenterIcon, AlignHorizontalLeftIcon, AlignHorizontalRightIcon, AlignJustifyCenterIcon, AlignJustifyFlexEndIcon, AlignJustifyFlexStartIcon, AlignJustifySpaceBetweenIcon, AlignVerticalBottomIcon, AlignVerticalCenterIcon, AlignVerticalTopIcon, SwapHorizIcon, SwapVertIcon, ViewColumnIcon, ViewStreamIcon, } from "../../components/icons/ProbeLayoutIcons.js";
import { buildFlexDirection, FLEX_ALIGN_VALUES, FLEX_JUSTIFY_VALUES, getFlexAxis, isColumnFlexDirection, isFlexReversed, stepGridTrackCount, stepProbeGap, toggleFlexReverse, } from "../../utils/probe/probeLayout.js";
function ProbeLayoutSectionLabel({ children }) {
    return _jsx("span", { className: "text-[11px] font-medium text-[var(--adaptive-black500)]", children: children });
}
function ProbeIconToggleButton({ active, label, onClick, children, }) {
    return (_jsx("button", { type: "button", "data-fivepixels-interactive": "", "aria-label": label, title: label, onClick: onClick, className: `inline-flex h-[30px] w-[30px] items-center justify-center rounded-[8px] border transition-colors ${active
            ? "border-[var(--adaptive-blue500)] bg-[var(--adaptive-blue500)]/10 text-[var(--adaptive-blue500)]"
            : "border-[var(--adaptive-border-subtle)] bg-[var(--adaptive-black50)] text-[var(--adaptive-black700)] hover:bg-[var(--adaptive-black100)]"}`, children: children }));
}
function ProbeIconToggleGroup({ label, options, value, onChange, }) {
    return (_jsxs("div", { className: "flex flex-col gap-[4px]", children: [_jsx(ProbeLayoutSectionLabel, { children: label }), _jsx("div", { className: "flex flex-wrap gap-[4px]", children: options.map((option) => (_jsx(ProbeIconToggleButton, { active: value === option.value, label: option.label, onClick: () => onChange(option.value), children: option.icon }, option.value))) })] }));
}
function ProbeCountStepperField({ label, value, onChange, }) {
    return (_jsxs("div", { className: "flex flex-col gap-[4px] text-[11px]", children: [_jsx(ProbeLayoutSectionLabel, { children: label }), _jsxs("div", { className: "flex items-center gap-[6px]", children: [_jsx("button", { type: "button", "data-fivepixels-interactive": "", onClick: () => onChange(stepGridTrackCount(value, -1)), className: "inline-flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-[8px] border border-[var(--adaptive-border-subtle)] bg-[var(--adaptive-black50)] text-[14px] font-semibold text-[var(--adaptive-black900)]", "aria-label": `Decrease ${label}`, children: "\u2212" }), _jsx("div", { className: "min-w-0 flex-1 rounded-[8px] border border-[var(--adaptive-border-subtle)] bg-[var(--adaptive-black50)] px-[8px] py-[6px] text-center font-[var(--coding-font)] text-[12px] text-[var(--adaptive-black900)]", children: value }), _jsx("button", { type: "button", "data-fivepixels-interactive": "", onClick: () => onChange(stepGridTrackCount(value, 1)), className: "inline-flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-[8px] border border-[var(--adaptive-border-subtle)] bg-[var(--adaptive-black50)] text-[14px] font-semibold text-[var(--adaptive-black900)]", "aria-label": `Increase ${label}`, children: "+" })] })] }));
}
function ProbeGapStepperField({ label, value, onChange, }) {
    return (_jsxs("div", { className: "flex flex-col gap-[4px] text-[11px]", children: [_jsx(ProbeLayoutSectionLabel, { children: label }), _jsxs("div", { className: "flex items-center gap-[6px]", children: [_jsx("button", { type: "button", "data-fivepixels-interactive": "", onClick: () => onChange(stepProbeGap(value, -1)), className: "inline-flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-[8px] border border-[var(--adaptive-border-subtle)] bg-[var(--adaptive-black50)] text-[14px] font-semibold text-[var(--adaptive-black900)]", "aria-label": `Decrease ${label}`, children: "\u2212" }), _jsx("div", { className: "min-w-0 flex-1 rounded-[8px] border border-[var(--adaptive-border-subtle)] bg-[var(--adaptive-black50)] px-[8px] py-[6px] text-center font-[var(--coding-font)] text-[12px] text-[var(--adaptive-black900)]", children: value }), _jsx("button", { type: "button", "data-fivepixels-interactive": "", onClick: () => onChange(stepProbeGap(value, 1)), className: "inline-flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-[8px] border border-[var(--adaptive-border-subtle)] bg-[var(--adaptive-black50)] text-[14px] font-semibold text-[var(--adaptive-black900)]", "aria-label": `Increase ${label}`, children: "+" })] })] }));
}
function getJustifyOptions(messages, columnDirection) {
    const iconClass = "h-[18px] w-[18px]";
    if (columnDirection) {
        return FLEX_JUSTIFY_VALUES.map((value) => {
            const icon = value === "flex-start" ? (_jsx(AlignVerticalTopIcon, { className: iconClass })) : value === "center" ? (_jsx(AlignVerticalCenterIcon, { className: iconClass })) : value === "flex-end" ? (_jsx(AlignVerticalBottomIcon, { className: iconClass })) : (_jsx(AlignJustifySpaceBetweenIcon, { className: iconClass }));
            return {
                value,
                label: messages.pickTarget.probeJustifyOptions[value],
                icon,
            };
        });
    }
    return FLEX_JUSTIFY_VALUES.map((value) => {
        const icon = value === "flex-start" ? (_jsx(AlignJustifyFlexStartIcon, { className: iconClass })) : value === "center" ? (_jsx(AlignJustifyCenterIcon, { className: iconClass })) : value === "flex-end" ? (_jsx(AlignJustifyFlexEndIcon, { className: iconClass })) : (_jsx(AlignJustifySpaceBetweenIcon, { className: iconClass }));
        return {
            value,
            label: messages.pickTarget.probeJustifyOptions[value],
            icon,
        };
    });
}
function getAlignOptions(messages, columnDirection) {
    const iconClass = "h-[18px] w-[18px]";
    if (columnDirection) {
        return FLEX_ALIGN_VALUES.map((value) => {
            const icon = value === "flex-start" ? (_jsx(AlignHorizontalLeftIcon, { className: iconClass })) : value === "center" ? (_jsx(AlignHorizontalCenterIcon, { className: iconClass })) : (_jsx(AlignHorizontalRightIcon, { className: iconClass }));
            return {
                value,
                label: messages.pickTarget.probeAlignOptions[value],
                icon,
            };
        });
    }
    return FLEX_ALIGN_VALUES.map((value) => {
        const icon = value === "flex-start" ? (_jsx(AlignVerticalTopIcon, { className: iconClass })) : value === "center" ? (_jsx(AlignVerticalCenterIcon, { className: iconClass })) : (_jsx(AlignVerticalBottomIcon, { className: iconClass }));
        return {
            value,
            label: messages.pickTarget.probeAlignOptions[value],
            icon,
        };
    });
}
function FlexLayoutControls({ values, messages, onChange }) {
    const columnDirection = isColumnFlexDirection(values.flexDirection);
    const axis = getFlexAxis(values.flexDirection);
    const reversed = isFlexReversed(values.flexDirection);
    const iconClass = "h-[18px] w-[18px]";
    return (_jsxs("div", { className: "flex flex-col gap-[10px] border-t border-[var(--adaptive-border-subtle)] pt-[10px]", children: [_jsx(ProbeIconToggleGroup, { label: messages.pickTarget.probeMainAlign, value: values.justifyContent, onChange: (value) => onChange("justifyContent", value), options: getJustifyOptions(messages, columnDirection) }), _jsx(ProbeIconToggleGroup, { label: messages.pickTarget.probeCrossAlign, value: values.alignItems, onChange: (value) => onChange("alignItems", value), options: getAlignOptions(messages, columnDirection) }), _jsxs("div", { className: "flex flex-col gap-[4px]", children: [_jsx(ProbeLayoutSectionLabel, { children: messages.pickTarget.probeDirection }), _jsxs("div", { className: "flex flex-wrap gap-[4px]", children: [_jsx(ProbeIconToggleButton, { active: axis === "row", label: messages.pickTarget.probeDirectionRow, onClick: () => onChange("flexDirection", buildFlexDirection("row", reversed)), children: _jsx(ViewStreamIcon, { className: iconClass }) }), _jsx(ProbeIconToggleButton, { active: axis === "column", label: messages.pickTarget.probeDirectionColumn, onClick: () => onChange("flexDirection", buildFlexDirection("column", reversed)), children: _jsx(ViewColumnIcon, { className: iconClass }) }), _jsx(ProbeIconToggleButton, { active: reversed, label: messages.pickTarget.probeDirectionReverse, onClick: () => onChange("flexDirection", toggleFlexReverse(values.flexDirection)), children: columnDirection ? _jsx(SwapVertIcon, { className: iconClass }) : _jsx(SwapHorizIcon, { className: iconClass }) })] })] }), _jsx(ProbeGapStepperField, { label: messages.pickTarget.probeGap, value: values.gap, onChange: (value) => onChange("gap", value) })] }));
}
function GridLayoutControls({ values, messages, onChange }) {
    return (_jsxs("div", { className: "flex flex-col gap-[10px] border-t border-[var(--adaptive-border-subtle)] pt-[10px]", children: [_jsx(ProbeCountStepperField, { label: messages.pickTarget.probeGridColumns, value: values.gridColumnCount, onChange: (value) => onChange("gridColumnCount", value) }), _jsx(ProbeCountStepperField, { label: messages.pickTarget.probeGridRows, value: values.gridRowCount, onChange: (value) => onChange("gridRowCount", value) }), _jsx(ProbeGapStepperField, { label: messages.pickTarget.probeGap, value: values.gap, onChange: (value) => onChange("gap", value) })] }));
}
export function ProbeLayoutControls({ layoutMode, values, messages, onChange }) {
    if (layoutMode === "flex") {
        return _jsx(FlexLayoutControls, { values: values, messages: messages, onChange: onChange });
    }
    if (layoutMode === "grid") {
        return _jsx(GridLayoutControls, { values: values, messages: messages, onChange: onChange });
    }
    return null;
}
//# sourceMappingURL=ProbeLayoutControls.js.map