import type { PickTargetFontStyle } from "@/types/report-ui.js";

const FONT_INSPECT_TAGS = new Set([
    "FONT",
    "P",
    "SPAN",
    "H1",
    "H2",
    "H3",
    "H4",
    "H5",
    "H6",
    "A",
    "LABEL",
    "BUTTON",
    "LI",
    "TD",
    "TH",
    "STRONG",
    "EM",
    "B",
    "I",
    "SMALL",
    "CODE",
    "PRE",
    "BLOCKQUOTE",
    "FIGCAPTION",
    "INPUT",
    "TEXTAREA",
    "SELECT",
    "LEGEND",
    "CAPTION",
]);

function formatBoxSides(style: CSSStyleDeclaration, prefix: "padding" | "margin") {
    const top = style.getPropertyValue(`${prefix}-top`);
    const right = style.getPropertyValue(`${prefix}-right`);
    const bottom = style.getPropertyValue(`${prefix}-bottom`);
    const left = style.getPropertyValue(`${prefix}-left`);

    if (top === right && right === bottom && bottom === left) {
        return top;
    }

    if (top === bottom && left === right) {
        return `${top} ${right}`;
    }

    return `${top} ${right} ${bottom} ${left}`;
}

export function getPickTargetBoxStyle(element: HTMLElement) {
    const style = window.getComputedStyle(element);

    return {
        display: style.display,
        padding: formatBoxSides(style, "padding"),
        margin: formatBoxSides(style, "margin"),
    };
}

export function shouldInspectFontStyle(element: HTMLElement) {
    return FONT_INSPECT_TAGS.has(element.tagName);
}

export function getPickTargetFontStyle(element: HTMLElement): PickTargetFontStyle | null {
    if (!shouldInspectFontStyle(element)) {
        return null;
    }

    const style = window.getComputedStyle(element);

    return {
        fontFamily: style.fontFamily,
        fontSize: style.fontSize,
        fontWeight: style.fontWeight,
        lineHeight: style.lineHeight,
    };
}

export function getPickTargetTagName(element: HTMLElement) {
    return element.tagName.toLowerCase();
}

export function getPickTargetReportIdAttribute(element: HTMLElement) {
    return element.dataset.reportId?.trim() || null;
}
