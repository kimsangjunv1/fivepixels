export function getDocumentY(position) {
    return position.scrollY + position.viewport.y * position.viewport.height;
}
export function createReportPosition(overrides = {}) {
    return {
        target: overrides.target ?? { x: 0.25, y: 0.75 },
        viewport: {
            x: 0.5,
            y: 0.5,
            width: 1024,
            height: 768,
            ...overrides.viewport,
        },
        scrollY: overrides.scrollY ?? 0,
        anchor: overrides.anchor ?? null,
    };
}
//# sourceMappingURL=reportPosition.js.map