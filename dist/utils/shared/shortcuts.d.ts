export type ShortcutBinding = {
    key: string;
    mod?: boolean;
    shift?: boolean;
    alt?: boolean;
};
export declare function isMacPlatform(): boolean;
export declare function isModKey(event: KeyboardEvent): boolean;
export declare function matchesShortcut(event: KeyboardEvent, binding: ShortcutBinding): boolean;
export declare function formatShortcutLabel(binding: ShortcutBinding): string;
export declare function isEditableTarget(target: EventTarget | null): boolean;
//# sourceMappingURL=shortcuts.d.ts.map