const HEX_COLOR_PATTERN = /^#([0-9a-fA-F]{6})$/;
export function isValidHexColor(value) {
    return HEX_COLOR_PATTERN.test(value.trim());
}
export function hexToDisplay(value) {
    return value.trim().replace(/^#/, "").slice(0, 6);
}
export function displayToHex(raw) {
    const digits = raw.replace(/[^0-9a-fA-F]/g, "").slice(0, 6);
    if (digits.length !== 6) {
        return null;
    }
    return `#${digits.toLowerCase()}`;
}
export function sanitizeHexDisplayInput(raw) {
    return raw.replace(/[^0-9a-fA-F]/g, "").slice(0, 6);
}
export function getHexColorPreview(value) {
    const normalized = value.startsWith("#") ? value : displayToHex(value);
    return normalized && isValidHexColor(normalized) ? normalized : null;
}
export function hexToColorInputValue(value) {
    return getHexColorPreview(value) ?? "#000000";
}
//# sourceMappingURL=hexColor.js.map