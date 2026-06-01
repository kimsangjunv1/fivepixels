const listeners = new Set();
let isInstalled = false;
let originalPushState = null;
let originalReplaceState = null;
function notifyPathnameListeners() {
    for (const listener of listeners) {
        listener();
    }
}
function installPathnameListeners() {
    if (isInstalled || typeof window === "undefined") {
        return;
    }
    isInstalled = true;
    originalPushState = history.pushState.bind(history);
    originalReplaceState = history.replaceState.bind(history);
    window.addEventListener("popstate", notifyPathnameListeners);
    history.pushState = (...args) => {
        originalPushState(...args);
        notifyPathnameListeners();
    };
    history.replaceState = (...args) => {
        originalReplaceState(...args);
        notifyPathnameListeners();
    };
}
function uninstallPathnameListeners() {
    if (!isInstalled || typeof window === "undefined") {
        return;
    }
    window.removeEventListener("popstate", notifyPathnameListeners);
    if (originalPushState) {
        history.pushState = originalPushState;
    }
    if (originalReplaceState) {
        history.replaceState = originalReplaceState;
    }
    originalPushState = null;
    originalReplaceState = null;
    isInstalled = false;
}
export function subscribeToPathnameChanges(listener) {
    listeners.add(listener);
    installPathnameListeners();
    return () => {
        listeners.delete(listener);
        if (listeners.size === 0) {
            uninstallPathnameListeners();
        }
    };
}
//# sourceMappingURL=pathnameNavigation.js.map