function readNodeEnv(): string | undefined {
    const runtimeProcess = (globalThis as { process?: { env?: { NODE_ENV?: string } } }).process;

    return runtimeProcess?.env?.NODE_ENV;
}

export function isProductionEnv(): boolean {
    return readNodeEnv() === "production";
}

export function resolveReportEnabled(options: { enabled?: boolean; devOnly?: boolean } = {}): boolean {
    const { enabled = true, devOnly = false } = options;

    if (!enabled) {
        return false;
    }

    if (devOnly && isProductionEnv()) {
        return false;
    }

    return true;
}
