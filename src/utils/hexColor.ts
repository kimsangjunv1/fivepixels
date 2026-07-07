const HEX_COLOR_PATTERN = /^#([0-9a-fA-F]{6})$/;

export function isValidHexColor(value: string) {
    return HEX_COLOR_PATTERN.test(value.trim());
}

export function hexToDisplay(value: string) {
    return value.trim().replace(/^#/, "").slice(0, 6);
}

export function displayToHex(raw: string) {
    const digits = raw.replace(/[^0-9a-fA-F]/g, "").slice(0, 6);

    if (digits.length !== 6) {
        return null;
    }

    return `#${digits.toLowerCase()}`;
}

export function sanitizeHexDisplayInput(raw: string) {
    return raw.replace(/[^0-9a-fA-F]/g, "").slice(0, 6);
}

export function getHexColorPreview(value: string) {
    const normalized = value.startsWith("#") ? value : displayToHex(value);

    return normalized && isValidHexColor(normalized) ? normalized : null;
}

export function hexToColorInputValue(value: string) {
    return getHexColorPreview(value) ?? "#000000";
}
