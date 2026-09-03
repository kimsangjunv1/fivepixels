import { useSyncExternalStore } from "react";
import { getCurrentPathname } from "../../shared/utils/shared/pathname.js";
import { subscribeToPathnameChanges } from "../../shared/utils/shared/pathnameNavigation.js";
import { subscribePageDocumentBridge } from "../../shared/utils/overlay/pageDocumentBridge.js";
function getServerPathname() {
    return "/";
}
function subscribeToPathnameAndBridge(listener) {
    const unsubscribePathname = subscribeToPathnameChanges(listener);
    const unsubscribeBridge = subscribePageDocumentBridge(listener);
    return () => {
        unsubscribePathname();
        unsubscribeBridge();
    };
}
export function useCurrentPathname(routeKey) {
    const browserPathname = useSyncExternalStore(subscribeToPathnameAndBridge, getCurrentPathname, getServerPathname);
    return routeKey !== undefined ? routeKey : browserPathname;
}
//# sourceMappingURL=useCurrentPathname.js.map