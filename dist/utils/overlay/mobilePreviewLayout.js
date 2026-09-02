export function resolveMobilePreviewScreenSize(preset, orientation) {
    if (orientation === "landscape") {
        return {
            width: preset.height,
            height: preset.width,
        };
    }
    return {
        width: preset.width,
        height: preset.height,
    };
}
//# sourceMappingURL=mobilePreviewLayout.js.map