import { cssColorToProbeHex, isValidProbeHexColor } from "./probeColor.js";
import { findElementByProbeKey } from "./pickProbeSession.js";
import { getPickTargetBoxStyle, getPickTargetFontStyle, shouldInspectFontStyle } from "./pickTargetInspect.js";
const TEXT_PROBE_FIELD_KEYS = ["textContent", "fontSize", "lineHeight"];
const STYLE_PROBE_FIELD_KEYS = ["padding", "margin", "textColor", "backgroundColor", "borderColor"];
export function getProbeFieldKeys(supportsTextFields) {
    return supportsTextFields ? [...TEXT_PROBE_FIELD_KEYS, ...STYLE_PROBE_FIELD_KEYS] : STYLE_PROBE_FIELD_KEYS;
}
export function getProbeTextContent(element) {
    if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement) {
        return element.value;
    }
    return element.textContent?.trim() ?? "";
}
export function capturePickProbeValues(element) {
    const style = window.getComputedStyle(element);
    const boxStyle = getPickTargetBoxStyle(element);
    const fontStyle = getPickTargetFontStyle(element);
    const supportsTextFields = shouldInspectFontStyle(element);
    return {
        textContent: supportsTextFields ? getProbeTextContent(element) : "",
        fontSize: supportsTextFields ? (fontStyle?.fontSize ?? style.fontSize) : "",
        padding: boxStyle.padding,
        margin: boxStyle.margin,
        lineHeight: supportsTextFields ? (fontStyle?.lineHeight ?? style.lineHeight) : "",
        textColor: cssColorToProbeHex(style.color),
        backgroundColor: cssColorToProbeHex(style.backgroundColor),
        borderColor: cssColorToProbeHex(style.borderColor),
    };
}
function applyProbeColorProperty(element, property, value) {
    if (value === "") {
        element.style.removeProperty(property);
        return;
    }
    if (isValidProbeHexColor(value)) {
        element.style[property] = value;
    }
}
export function applyPickProbeValues(element, values) {
    const supportsTextFields = shouldInspectFontStyle(element);
    element.style.padding = values.padding;
    element.style.margin = values.margin;
    applyProbeColorProperty(element, "color", values.textColor);
    applyProbeColorProperty(element, "backgroundColor", values.backgroundColor);
    applyProbeColorProperty(element, "borderColor", values.borderColor);
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
export function getProposedChanges(baseline, current, supportsTextFields = true) {
    return getProbeFieldKeys(supportsTextFields)
        .filter((key) => baseline[key] !== current[key])
        .map((key) => ({
        key,
        before: baseline[key],
        after: current[key],
    }));
}
export function applyPickProbeCompareMode(element, mode, baseline, current) {
    applyPickProbeValues(element, mode === "before" ? baseline : current);
}
export function formatProbeElementKeyLabel(elementKey) {
    if (elementKey.startsWith("id:")) {
        const [, reportId] = elementKey.split(":");
        return reportId ?? elementKey;
    }
    if (elementKey.startsWith("selector:")) {
        return elementKey.slice("selector:".length);
    }
    return elementKey;
}
function formatProposedChangeLine(change, messages) {
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
    }
}
export function formatProposedChanges(changes, messages) {
    if (changes.length === 0) {
        return "";
    }
    const lines = changes.map((change) => `• ${formatProposedChangeLine(change, messages)}`);
    return [messages.pickTarget.probeSummaryTitle, ...lines].join("\n");
}
export function formatSavedProbeEditsSummary(edits, messages) {
    const sections = Object.values(edits)
        .map((entry) => {
        const element = findElementByProbeKey(entry.elementKey);
        const supportsTextFields = element
            ? shouldInspectFontStyle(element)
            : Boolean(entry.baseline.textContent || entry.baseline.fontSize || entry.baseline.lineHeight);
        const changes = getProposedChanges(entry.baseline, entry.applied, supportsTextFields);
        if (changes.length === 0) {
            return null;
        }
        const lines = changes.map((change) => `• ${formatProposedChangeLine(change, messages)}`);
        const label = formatProbeElementKeyLabel(entry.elementKey);
        return `${messages.pickTarget.probeSummaryElement(label)}\n${lines.join("\n")}`;
    })
        .filter((section) => Boolean(section));
    if (sections.length === 0) {
        return "";
    }
    if (sections.length === 1) {
        return `${messages.pickTarget.probeSummaryTitle}\n${sections[0]}`;
    }
    return [messages.pickTarget.probeSummaryTitle, ...sections].join("\n\n");
}
//# sourceMappingURL=pickProbe.js.map