export type ShortcutBinding = {
    key: string;
    mod?: boolean;
    shift?: boolean;
    alt?: boolean;
};

export function isMacPlatform(): boolean {
    if (typeof navigator === "undefined") {
        return false;
    }

    return /Mac|iPhone|iPad|iPod/i.test(navigator.platform) || /Mac OS/i.test(navigator.userAgent);
}

export function isModKey(event: KeyboardEvent): boolean {
    return isMacPlatform() ? event.metaKey : event.ctrlKey;
}

export function matchesShortcut(event: KeyboardEvent, binding: ShortcutBinding): boolean {
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

export function formatShortcutLabel(binding: ShortcutBinding): string {
    const parts: string[] = [];
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

function formatKeyLabel(key: string, mac: boolean): string {
    if (key === "Enter") {
        return mac ? "↩" : "Enter";
    }

    if (key === "Escape") {
        return mac ? "Esc" : "Esc";
    }

    return key.length === 1 ? key.toUpperCase() : key;
}

export function isEditableTarget(target: EventTarget | null): boolean {
    if (!(target instanceof HTMLElement)) {
        return false;
    }

    const tagName = target.tagName;

    if (tagName === "INPUT" || tagName === "TEXTAREA" || tagName === "SELECT") {
        return true;
    }

    return target.isContentEditable;
}
