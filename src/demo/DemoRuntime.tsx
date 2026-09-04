"use client";

import { useEffect, useState, type ReactNode } from "react";
import { ReportProvider } from "@/shared/providers/ReportProvider.js";
import { useReportPreferences } from "@/shared/providers/reportContext.js";
import type { ReportLocale } from "@/shared/i18n/types.js";
import type { ResolvedAppearance } from "@/shared/types/report-ui.js";
import { createDemoAdapter, DEMO_AUTHORS } from "./fixtures.js";
import type { FivePixelsDemoScene } from "./types.js";

type DemoRuntimeProps = {
    scene: FivePixelsDemoScene;
    locale: ReportLocale;
    appearance: ResolvedAppearance;
    children: ReactNode;
};

function DemoPreferenceSync({ locale, appearance, children }: Omit<DemoRuntimeProps, "scene">) {
    const {
        locale: activeLocale,
        setLocale,
        panelAppearance,
        setPanelAppearance,
        tooltipAppearance,
        setTooltipAppearance,
    } = useReportPreferences();

    useEffect(() => {
        if (activeLocale !== locale) {
            setLocale(locale);
        }
    }, [activeLocale, locale, setLocale]);

    useEffect(() => {
        if (panelAppearance !== appearance) {
            setPanelAppearance(appearance);
        }
        if (tooltipAppearance !== appearance) {
            setTooltipAppearance(appearance);
        }
    }, [appearance, panelAppearance, setPanelAppearance, setTooltipAppearance, tooltipAppearance]);

    return children;
}

export function DemoRuntime({ scene, locale, appearance, children }: DemoRuntimeProps) {
    const [adapter] = useState(createDemoAdapter);

    return (
        <ReportProvider
            project={{ id: `fivepixels-demo-${scene}`, env: "STAGED", version: "0.2.23" }}
            ui={{ locale, panelAppearance: appearance, tooltipAppearance: appearance, showFeedbackList: true }}
            visibility={{ enabled: true, routeKey: "/demo-showcase" }}
            team={{ user: { id: "demo-user", name: "김상준" }, reviewers: DEMO_AUTHORS }}
            mode="presentation"
            sync="api"
            require={{ authLogin: false, reviewerKey: false }}
            adapter={adapter}
            networkMonitor={false}
        >
            <DemoPreferenceSync locale={locale} appearance={appearance}>{children}</DemoPreferenceSync>
        </ReportProvider>
    );
}
