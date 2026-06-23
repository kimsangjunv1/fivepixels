const DEFAULT_VISIBILITY = {
    enabled: true,
    devOnly: false,
};
export function resolveReportVisibility({ visibility, enabled, devOnly, routeKey, pathname, }) {
    return {
        enabled: visibility?.enabled ?? enabled ?? DEFAULT_VISIBILITY.enabled,
        devOnly: visibility?.devOnly ?? devOnly ?? DEFAULT_VISIBILITY.devOnly,
        routeKey: visibility?.routeKey ?? routeKey ?? pathname,
    };
}
//# sourceMappingURL=reportVisibility.js.map