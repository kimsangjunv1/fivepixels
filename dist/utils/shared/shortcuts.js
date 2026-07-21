export function isMacPlatform() {
    if (typeof navigator === "undefined") {
        return false;
    }
    return /Mac|iPhone|iPad|iPod/i.test(navigator.platform) || /Mac OS/i.test(navigator.userAgent);
}
export function isModKey(event) {
    return isMacPlatform() ? event.metaKey : event.ctrlKey;
}
export function matchesShortcut(event, binding) {
    const modRequired = binding.mod ?? false;
    const shiftRequired = binding.shift ?? false;
    const altRequired = binding.alt ?? false;
    if (modRequired !== isModKey(event)) {
        return false;
    }
    if (shiftRequired !== event.shiftKey) {
        return false;
    }
    if (altRequired !== event.altKey) {
        return false;
    }
    return event.key.toLowerCase() === binding.key.toLowerCase();
}
export function formatShortcutLabel(binding) {
    const parts = [];
    const mac = isMacPlatform();
    if (binding.mod) {
        parts.push(mac ? "⌘" : "Ctrl");
    }
    if (binding.shift) {
        parts.push(mac ? "⇧" : "Shift");
    }
    if (binding.alt) {
        parts.push(mac ? "⌥" : "Alt");
    }
    parts.push(formatKeyLabel(binding.key, mac));
    return mac ? parts.join("") : parts.join("+");
}
function formatKeyLabel(key, mac) {
    if (key === "Enter") {
        return mac ? "↩" : "Enter";
    }
    if (key === "Escape") {
        return mac ? "Esc" : "Esc";
    }
    return key.length === 1 ? key.toUpperCase() : key;
}
export function isEditableTarget(target) {
    if (!(target instanceof HTMLElement)) {
        return false;
    }
    const tagName = target.tagName;
    if (tagName === "INPUT" || tagName === "TEXTAREA" || tagName === "SELECT") {
        return true;
    }
    return target.isContentEditable;
}
//# sourceMappingURL=shortcuts.js.map