import { useSyncExternalStore } from "react";
import { getCurrentPathname } from "@/utils/shared/pathname.js";
import { subscribeToPathnameChanges } from "@/utils/shared/pathnameNavigation.js";

function getServerPathname() {
    return "/";
}

export function useCurrentPathname(routeKey?: string) {
    const browserPathname = useSyncExternalStore(
        subscribeToPathnameChanges,
        getCurrentPathname,
        getServerPathname,
    );

    return routeKey !== undefined ? routeKey : browserPathname;
}
