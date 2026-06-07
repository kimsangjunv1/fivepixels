import { useEffect, useState } from "react";
import { getCurrentPathname } from "@/utils/pathname.js";
import { subscribeToPathnameChanges } from "@/utils/pathnameNavigation.js";

export function useCurrentPathname(routeKey?: string) {
    const isControlled = routeKey !== undefined;
    const [browserPathname, setBrowserPathname] = useState(() => getCurrentPathname());

    useEffect(() => {
        if (isControlled) {
            return;
        }

        const syncPathname = () => {
            setBrowserPathname(getCurrentPathname());
        };

        return subscribeToPathnameChanges(syncPathname);
    }, [isControlled]);

    return isControlled ? routeKey : browserPathname;
}
