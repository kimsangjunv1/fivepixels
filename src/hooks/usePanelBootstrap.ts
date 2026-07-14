import { useEffect, useMemo, useState } from "react";
import type { ReportField, ReportFeedback, ReportPanelBootstrapParams, ReportPanelBootstrapResult } from "@/types/report.js";
import { buildPanelBootstrapFromReports } from "@/utils/panelBootstrap.js";

type UsePanelBootstrapOptions = {
    enabled: boolean;
    params: ReportPanelBootstrapParams;
    fields: ReportField[];
    reports: ReportFeedback[];
    pathname: string;
    onPanelBootstrap?: (params: ReportPanelBootstrapParams) => Promise<ReportPanelBootstrapResult>;
};

export function usePanelBootstrap({ enabled, params, fields, reports, pathname, onPanelBootstrap }: UsePanelBootstrapOptions) {
    const clientBootstrap = useMemo(() => {
        if (!enabled || onPanelBootstrap) {
            return null;
        }

        return buildPanelBootstrapFromReports(reports, fields, pathname);
    }, [enabled, fields, onPanelBootstrap, pathname, reports]);
    const [remoteBootstrap, setRemoteBootstrap] = useState<ReportPanelBootstrapResult | null>(null);
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
