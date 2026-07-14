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

function applyProbeTextContent(element: HTMLElement, value: string) {
    if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement) {
        element.value = value;
        return;
    }

    element.textContent = value;
}

function removeProbeFieldInlineStyle(element: HTMLElement, key: PickProbeFieldKey) {
    const propertyMap: Partial<Record<PickProbeFieldKey, string>> = {
        padding: "padding",
        margin: "margin",
        textColor: "color",
        backgroundColor: "background-color",
        borderColor: "border-color",
        fontSize: "font-size",
        lineHeight: "line-height",
        justifyContent: "justify-content",
        alignItems: "align-items",
        flexDirection: "flex-direction",
        gap: "gap",
        gridColumnCount: "grid-template-columns",
        gridRowCount: "grid-template-rows",
    };

    const property = propertyMap[key];

    if (property) {
        element.style.removeProperty(property);
    }
}

function applyProbeFieldValue(element: HTMLElement, key: PickProbeFieldKey, value: string, layoutMode: PickProbeLayoutMode) {
    switch (key) {
        case "padding":
            element.style.padding = value;
            return;
        case "margin":
            element.style.margin = value;
            return;
        case "textColor":
            applyProbeColorProperty(element, "color", value);
            return;
        case "backgroundColor":
            applyProbeColorProperty(element, "backgroundColor", value);
            return;
        case "borderColor":
            applyProbeColorProperty(element, "borderColor", value);
            return;
        case "fontSize":
            element.style.fontSize = value;
            return;
        case "lineHeight":
            element.style.lineHeight = value;
            return;
        case "justifyContent":
            element.style.justifyContent = value;
            return;
        case "alignItems":
            element.style.alignItems = value;
            return;
        case "flexDirection":
            element.style.flexDirection = value;
            return;
        case "gap":
            if (value) {
                element.style.gap = value;
            } else {
                element.style.removeProperty("gap");
            }

            return;
        case "gridColumnCount":
            if (layoutMode === "grid" && value) {
                element.style.gridTemplateColumns = formatGridTrackCount(Number.parseInt(value, 10));
            }

            return;
        case "gridRowCount":
            if (layoutMode === "grid" && value) {
                element.style.gridTemplateRows = formatGridTrackCount(Number.parseInt(value, 10));
            }

            return;
        case "textContent":
            applyProbeTextContent(element, value);
            return;
    }
}

export function applyPickProbeValueDiff(
    element: HTMLElement,
    baseline: PickProbeValues,
    current: PickProbeValues,
    mode: PickProbeCompareMode = "after",
) {
    const supportsTextFields = shouldInspectFontStyle(element);
    const layoutMode = getPickProbeLayoutMode(element);

    for (const key of getProbeFieldKeys(supportsTextFields, layoutMode)) {
        const baselineValue = baseline[key];
        const currentValue = current[key];
        const targetValue = mode === "before" ? baselineValue : currentValue;

        if (baselineValue === currentValue) {
            if (key === "textContent") {
                if (supportsTextFields) {
                    applyProbeTextContent(element, baselineValue);
                }
            } else {
                removeProbeFieldInlineStyle(element, key);
            }

            continue;
        }

        if (key === "textContent") {
            if (supportsTextFields) {
                applyProbeTextContent(element, targetValue);
            }

            continue;
        }

        if (mode === "before") {
            removeProbeFieldInlineStyle(element, key);
            continue;
        }

        applyProbeFieldValue(element, key, targetValue, layoutMode);
    }
}

export function applyPickProbeValues(element: HTMLElement, values: PickProbeValues, baseline?: PickProbeValues) {
    applyPickProbeValueDiff(element, baseline ?? capturePickProbeValues(element), values, "after");
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
    applyPickProbeValueDiff(element, baseline, current, mode);
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
