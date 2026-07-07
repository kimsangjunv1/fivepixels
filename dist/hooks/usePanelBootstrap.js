import { useEffect, useMemo, useState } from "react";
import { buildPanelBootstrapFromReports } from "../utils/panelBootstrap.js";
export function usePanelBootstrap({ enabled, params, fields, reports, pathname, onPanelBootstrap }) {
    const clientBootstrap = useMemo(() => {
        if (!enabled || onPanelBootstrap) {
            return null;
        }
        return buildPanelBootstrapFromReports(reports, fields, pathname);
    }, [enabled, fields, onPanelBootstrap, pathname, reports]);
    const [remoteBootstrap, setRemoteBootstrap] = useState(null);
    const [isFetching, setIsFetching] = useState(false);
    useEffect(() => {
        if (!enabled || !onPanelBootstrap) {
            setRemoteBootstrap(null);
            setIsFetching(false);
            return;
        }
        let cancelled = false;
        setIsFetching(true);
        void onPanelBootstrap(params)
            .then((result) => {
            if (!cancelled) {
                setRemoteBootstrap(result);
            }
        })
            .catch(() => {
            if (!cancelled) {
                setRemoteBootstrap(null);
            }
        })
            .finally(() => {
            if (!cancelled) {
                setIsFetching(false);
            }
        });
        return () => {
            cancelled = true;
        };
    }, [enabled, onPanelBootstrap, params]);
    return {
        bootstrap: onPanelBootstrap ? remoteBootstrap : clientBootstrap,
        isFetching,
        usesRemoteBootstrap: Boolean(onPanelBootstrap && remoteBootstrap),
    };
}
//# sourceMappingURL=usePanelBootstrap.js.map