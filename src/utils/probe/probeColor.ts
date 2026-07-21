const PROBE_HEX_COLOR_PATTERN = /^#([0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/;

export function isValidProbeHexColor(value: string) {
    return PROBE_HEX_COLOR_PATTERN.test(value.trim());
}

export function sanitizeProbeHexInput(raw: string) {
    if (!raw.trim()) {
        return "";
    }

    const withHash = raw.startsWith("#") ? raw : `#${raw}`;
    const digits = withHash.slice(1).replace(/[^0-9a-fA-F]/g, "").slice(0, 8);

    return digits ? `#${digits}` : "#";
}

export function getProbeColorPreview(value: string) {
    return isValidProbeHexColor(value) ? value.trim().toLowerCase() : null;
}

export function probeHexToColorInputValue(value: string) {
    const preview = getProbeColorPreview(value);

    if (!preview) {
        return "#000000";
    }

    return preview.length === 9 ? preview.slice(0, 7) : preview;
}

function channelToHex(channel: number) {
    return Math.max(0, Math.min(255, channel)).toString(16).padStart(2, "0");
}

export function cssColorToProbeHex(color: string) {
    const trimmed = color.trim();

    if (PROBE_HEX_COLOR_PATTERN.test(trimmed)) {
        return trimmed.toLowerCase();
    }

    const rgbMatch = trimmed.match(/^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)(?:\s*,\s*([\d.]+))?\s*\)$/);

    if (!rgbMatch) {
        return "#000000";
    }

    const red = Number(rgbMatch[1]);
    const green = Number(rgbMatch[2]);
    const blue = Number(rgbMatch[3]);
    const alphaRaw = rgbMatch[4];
    const hex = `#${channelToHex(red)}${channelToHex(green)}${channelToHex(blue)}`;

    if (alphaRaw === undefined) {
        return hex;
    }

    const alpha = Math.round(Number(alphaRaw) * 255);

    if (alpha >= 255) {
        return hex;
    }

    return `${hex}${channelToHex(alpha)}`;
}
