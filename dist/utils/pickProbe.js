import { getPickTargetBoxStyle, getPickTargetFontStyle } from "./pickTargetInspect.js";
export function capturePickProbeValues(element) {
    const style = window.getComputedStyle(element);
    const boxStyle = getPickTargetBoxStyle(element);
    const fontStyle = getPickTargetFontStyle(element);
    return {
        textContent: element.textContent?.trim() ?? "",
        fontSize: fontStyle?.fontSize ?? style.fontSize,
        padding: boxStyle.padding,
        margin: boxStyle.margin,
        lineHeight: fontStyle?.lineHeight ?? style.lineHeight,
    };
}
export function applyPickProbeValues(element, values) {
    element.style.fontSize = values.fontSize;
    element.style.padding = values.padding;
    element.style.margin = values.margin;
    element.style.lineHeight = values.lineHeight;
    element.textContent = values.textContent;
}
export function getProposedChanges(baseline, current) {
    const keys = ["textContent", "fontSize", "padding", "margin", "lineHeight"];
    return keys
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
export function formatProposedChanges(changes, messages) {
    if (changes.length === 0) {
        return "";
    }
    const lines = changes.map((change) => {
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
        }
    });
    return [messages.pickTarget.probeSummaryTitle, ...lines.map((line) => `• ${line}`)].join("\n");
}
//# sourceMappingURL=pickProbe.js.map