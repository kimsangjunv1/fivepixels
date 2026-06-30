import type { ReportMessages } from "@/i18n/types.js";
import type { PickProbeCompareMode, PickProbeFieldKey, PickProbeLayoutMode, PickProbeValues, ProposedChange, SavedProbeEntry } from "@/types/report-ui.js";
import { cssColorToProbeHex, isValidProbeHexColor } from "./probeColor.js";
import {
    captureProbeGap,
    formatGridTrackCount,
    getPickProbeLayoutMode,
    inferLayoutModeFromProbeValues,
    parseGridTrackCount,
} from "./probeLayout.js";
import { findElementByProbeKey } from "./pickProbeSession.js";
import { getPickTargetBoxStyle, getPickTargetFontStyle, shouldInspectFontStyle } from "./pickTargetInspect.js";

const TEXT_PROBE_FIELD_KEYS: PickProbeFieldKey[] = ["textContent", "fontSize", "lineHeight"];
const STYLE_PROBE_FIELD_KEYS: PickProbeFieldKey[] = ["padding", "margin", "textColor", "backgroundColor", "borderColor"];
const FLEX_PROBE_FIELD_KEYS: PickProbeFieldKey[] = ["justifyContent", "alignItems", "flexDirection", "gap"];
const GRID_PROBE_FIELD_KEYS: PickProbeFieldKey[] = ["gridColumnCount", "gridRowCount", "gap"];

export const EMPTY_PROBE_LAYOUT_VALUES = {
    justifyContent: "",
    alignItems: "",
    flexDirection: "",
    gap: "",
    gridColumnCount: "",
    gridRowCount: "",
} satisfies Pick<PickProbeValues, "justifyContent" | "alignItems" | "flexDirection" | "gap" | "gridColumnCount" | "gridRowCount">;

export function getProbeFieldKeys(supportsTextFields: boolean, layoutMode: PickProbeLayoutMode = null): PickProbeFieldKey[] {
    const keys = supportsTextFields ? [...TEXT_PROBE_FIELD_KEYS, ...STYLE_PROBE_FIELD_KEYS] : [...STYLE_PROBE_FIELD_KEYS];

    if (layoutMode === "flex") {
        return [...keys, ...FLEX_PROBE_FIELD_KEYS];
    }

    if (layoutMode === "grid") {
        return [...keys, ...GRID_PROBE_FIELD_KEYS];
    }

    return keys;
}

export function getProbeTextContent(element: HTMLElement) {
    if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement) {
        return element.value;
    }

    return element.textContent?.trim() ?? "";
}

function captureLayoutProbeValues(element: HTMLElement, layoutMode: PickProbeLayoutMode): Pick<PickProbeValues, keyof typeof EMPTY_PROBE_LAYOUT_VALUES> {
    if (!layoutMode) {
        return { ...EMPTY_PROBE_LAYOUT_VALUES };
    }

    const style = window.getComputedStyle(element);
    const gap = captureProbeGap(style);

    if (layoutMode === "flex") {
        return {
            ...EMPTY_PROBE_LAYOUT_VALUES,
            justifyContent: style.justifyContent,
            alignItems: style.alignItems,
            flexDirection: style.flexDirection,
            gap,
        };
    }

    return {
        ...EMPTY_PROBE_LAYOUT_VALUES,
        gridColumnCount: String(parseGridTrackCount(style.gridTemplateColumns)),
        gridRowCount: String(parseGridTrackCount(style.gridTemplateRows)),
        gap,
    };
}

export function capturePickProbeValues(element: HTMLElement): PickProbeValues {
    const style = window.getComputedStyle(element);
    const boxStyle = getPickTargetBoxStyle(element);
    const fontStyle = getPickTargetFontStyle(element);
    const supportsTextFields = shouldInspectFontStyle(element);
    const layoutMode = getPickProbeLayoutMode(element);

    return {
        textContent: supportsTextFields ? getProbeTextContent(element) : "",
        fontSize: supportsTextFields ? (fontStyle?.fontSize ?? style.fontSize) : "",
        padding: boxStyle.padding,
        margin: boxStyle.margin,
        lineHeight: supportsTextFields ? (fontStyle?.lineHeight ?? style.lineHeight) : "",
        textColor: cssColorToProbeHex(style.color),
        backgroundColor: cssColorToProbeHex(style.backgroundColor),
        borderColor: cssColorToProbeHex(style.borderColor),
        ...captureLayoutProbeValues(element, layoutMode),
    };
}

function applyProbeColorProperty(element: HTMLElement, property: "color" | "backgroundColor" | "borderColor", value: string) {
    if (value === "") {
        element.style.removeProperty(property);
        return;
    }

    if (isValidProbeHexColor(value)) {
        element.style[property] = value;
    }
}

function applyLayoutProbeValues(element: HTMLElement, values: PickProbeValues, layoutMode: PickProbeLayoutMode) {
    if (!layoutMode) {
        return;
    }

    if (values.gap) {
        element.style.gap = values.gap;
    }

    if (layoutMode === "flex") {
        if (values.justifyContent) {
            element.style.justifyContent = values.justifyContent;
        }

        if (values.alignItems) {
            element.style.alignItems = values.alignItems;
        }

        if (values.flexDirection) {
            element.style.flexDirection = values.flexDirection;
        }

        return;
    }

    if (values.gridColumnCount) {
        element.style.gridTemplateColumns = formatGridTrackCount(Number.parseInt(values.gridColumnCount, 10));
    }

    if (values.gridRowCount) {
        element.style.gridTemplateRows = formatGridTrackCount(Number.parseInt(values.gridRowCount, 10));
    }
}

export function applyPickProbeValues(element: HTMLElement, values: PickProbeValues) {
    const supportsTextFields = shouldInspectFontStyle(element);
    const layoutMode = getPickProbeLayoutMode(element);

    element.style.padding = values.padding;
    element.style.margin = values.margin;
    applyProbeColorProperty(element, "color", values.textColor);
    applyProbeColorProperty(element, "backgroundColor", values.backgroundColor);
    applyProbeColorProperty(element, "borderColor", values.borderColor);
    applyLayoutProbeValues(element, values, layoutMode);

    if (!supportsTextFields) {
        return;
    }

    element.style.fontSize = values.fontSize;
    element.style.lineHeight = values.lineHeight;

    if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement) {
        element.value = values.textContent;
        return;
    }

    element.textContent = values.textContent;
}

export function getProposedChanges(
    baseline: PickProbeValues,
    current: PickProbeValues,
    supportsTextFields = true,
    layoutMode: PickProbeLayoutMode = null,
): ProposedChange[] {
    return getProbeFieldKeys(supportsTextFields, layoutMode)
        .filter((key) => baseline[key] !== current[key])
        .map((key) => ({
            key,
            before: baseline[key],
            after: current[key],
        }));
}

export function applyPickProbeCompareMode(
    element: HTMLElement,
    mode: PickProbeCompareMode,
    baseline: PickProbeValues,
    current: PickProbeValues,
) {
    applyPickProbeValues(element, mode === "before" ? baseline : current);
}

export function formatProbeElementKeyLabel(elementKey: string) {
    if (elementKey.startsWith("id:")) {
        const [, reportId] = elementKey.split(":");

        return reportId ?? elementKey;
    }

    if (elementKey.startsWith("selector:")) {
        return elementKey.slice("selector:".length);
    }

    return elementKey;
}

function formatProposedChangeLine(change: ProposedChange, messages: ReportMessages) {
    switch (change.key) {
        case "textContent":
            return messages.pickTarget.probeChangeText(change.before, change.after);
        case "fontSize":
            return messages.pickTarget.probeChangeFontSize(change.before, change.after);
        case "padding":
            return messages.pickTarget.probeChangePadding(change.before, change.after);
        case "margin":
            return messages.pickTarget.probeChangeMargin(change.before, change.after);
        case "lineHeight":
            return messages.pickTarget.probeChangeLineHeight(change.before, change.after);
        case "textColor":
            return messages.pickTarget.probeChangeTextColor(change.before, change.after);
        case "backgroundColor":
            return messages.pickTarget.probeChangeBackgroundColor(change.before, change.after);
        case "borderColor":
            return messages.pickTarget.probeChangeBorderColor(change.before, change.after);
        case "justifyContent":
            return messages.pickTarget.probeChangeJustifyContent(change.before, change.after);
        case "alignItems":
            return messages.pickTarget.probeChangeAlignItems(change.before, change.after);
        case "flexDirection":
            return messages.pickTarget.probeChangeFlexDirection(change.before, change.after);
        case "gap":
            return messages.pickTarget.probeChangeGap(change.before, change.after);
        case "gridColumnCount":
            return messages.pickTarget.probeChangeGridColumns(change.before, change.after);
        case "gridRowCount":
            return messages.pickTarget.probeChangeGridRows(change.before, change.after);
    }
}

export function formatProposedChanges(changes: ProposedChange[], messages: ReportMessages): string {
    if (changes.length === 0) {
        return "";
    }

    const lines = changes.map((change) => `• ${formatProposedChangeLine(change, messages)}`);

    return [messages.pickTarget.probeSummaryTitle, ...lines].join("\n");
}

export function formatSavedProbeEditsSummary(edits: Record<string, SavedProbeEntry>, messages: ReportMessages): string {
    const sections = Object.values(edits)
        .map((entry) => {
            const element = findElementByProbeKey(entry.elementKey);
            const supportsTextFields = element
                ? shouldInspectFontStyle(element)
                : Boolean(entry.baseline.textContent || entry.baseline.fontSize || entry.baseline.lineHeight);
            const layoutMode = element ? getPickProbeLayoutMode(element) : inferLayoutModeFromProbeValues(entry.baseline);
            const changes = getProposedChanges(entry.baseline, entry.applied, supportsTextFields, layoutMode);

            if (changes.length === 0) {
                return null;
            }

            const lines = changes.map((change) => `• ${formatProposedChangeLine(change, messages)}`);
            const label = formatProbeElementKeyLabel(entry.elementKey);

            return `${messages.pickTarget.probeSummaryElement(label)}\n${lines.join("\n")}`;
        })
        .filter((section): section is string => Boolean(section));

    if (sections.length === 0) {
        return "";
    }

    if (sections.length === 1) {
        return `${messages.pickTarget.probeSummaryTitle}\n${sections[0]}`;
    }

    return [messages.pickTarget.probeSummaryTitle, ...sections].join("\n\n");
}
