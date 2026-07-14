const DEFAULT_VISIBILITY = {
    enabled: true,
    devOnly: false,
};
export function resolveReportVisibility({ visibility }) {
    return {
        enabled: visibility?.enabled ?? DEFAULT_VISIBILITY.enabled,
        devOnly: visibility?.devOnly ?? DEFAULT_VISIBILITY.devOnly,
        routeKey: visibility?.routeKey,
    };
}
//# sourceMappingURL=reportVisibility.js.map