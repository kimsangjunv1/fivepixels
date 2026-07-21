function readNodeEnv() {
    const runtimeProcess = globalThis.process;
    return runtimeProcess?.env?.NODE_ENV;
}
export function isProductionEnv() {
    return readNodeEnv() === "production";
}
export function resolveReportEnabled(options = {}) {
    const { enabled = true, devOnly = false } = options;
    if (!enabled) {
        return false;
    }
    if (devOnly && isProductionEnv()) {
        return false;
    }
    return true;
}
//# sourceMappingURL=env.js.map