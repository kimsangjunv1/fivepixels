import { useSyncExternalStore } from "react";
import { getCurrentPathname } from "../utils/pathname.js";
import { subscribeToPathnameChanges } from "../utils/pathnameNavigation.js";
function getServerPathname() {
    return "/";
}
export function useCurrentPathname(routeKey) {
    const browserPathname = useSyncExternalStore(subscribeToPathnameChanges, getCurrentPathname, getServerPathname);
    return routeKey !== undefined ? routeKey : browserPathname;
}
//# sourceMappingURL=useCurrentPathname.js.map