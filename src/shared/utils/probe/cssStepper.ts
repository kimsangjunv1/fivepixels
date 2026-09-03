const PIXEL_PATTERN = /^(-?\d+(?:\.\d+)?)px$/;

export function parseCssPixel(value: string, fallback = 0) {
    const match = value.trim().match(PIXEL_PATTERN);

    if (!match) {
        return fallback;
    }

    return Number.parseFloat(match[1]);
}

export function formatCssPixel(value: number) {
    return `${Math.max(0, Math.round(value * 10) / 10)}px`;
}

export function stepCssPixel(value: string, delta: number, fallback = 16) {
    return formatCssPixel(parseCssPixel(value, fallback) + delta);
}

export function stepCssBoxSides(value: string, delta: number) {
    if (!value.trim()) {
        return formatCssPixel(delta);
    }

    if (PIXEL_PATTERN.test(value.trim())) {
        return stepCssPixel(value, delta);
    }

    const parts = value.trim().split(/\s+/);

    if (parts.length === 0) {
        return formatCssPixel(delta);
    }

    return parts
        .map((part) => (PIXEL_PATTERN.test(part) ? stepCssPixel(part, delta, 0) : part))
        .join(" ");
}

export function isSteppableCssValue(value: string) {
    const trimmed = value.trim();

    if (!trimmed || trimmed === "normal" || trimmed === "auto") {
        return false;
    }

    if (PIXEL_PATTERN.test(trimmed)) {
        return true;
    }

    return trimmed.split(/\s+/).every((part) => PIXEL_PATTERN.test(part));
}
