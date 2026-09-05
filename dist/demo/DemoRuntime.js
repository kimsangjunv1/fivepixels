"use client";
import { jsx as _jsx } from "react/jsx-runtime";
import { useEffect, useRef, useState } from "react";
import { ReportProvider } from "../shared/providers/ReportProvider.js";
import { useReportPreferences } from "../shared/providers/reportContext.js";
import { createDemoAdapter, DEMO_AUTHORS } from "./fixtures.js";
function DemoPreferenceSync({ locale, appearance, children }) {
    const { locale: activeLocale, setLocale, panelAppearance, setPanelAppearance, tooltipAppearance, setTooltipAppearance, } = useReportPreferences();
    const appliedLocaleRef = useRef(null);
    const appliedAppearanceRef = useRef(null);
    useEffect(() => {
        if (appliedLocaleRef.current !== locale) {
            appliedLocaleRef.current = locale;
            setLocale(locale);
        }
    }, [activeLocale, locale, setLocale]);
    useEffect(() => {
        if (appliedAppearanceRef.current !== appearance) {
            appliedAppearanceRef.current = appearance;
            setPanelAppearance(appearance);
            setTooltipAppearance(appearance);
        }
    }, [appearance, panelAppearance, setPanelAppearance, setTooltipAppearance, tooltipAppearance]);
    return children;
}
export function DemoRuntime({ scene, locale, appearance, children }) {
    const [adapter] = useState(createDemoAdapter);
    return (_jsx(ReportProvider, { project: { id: `fivepixels-demo-${scene}`, env: "STAGED", version: "0.2.23" }, ui: { locale, panelAppearance: appearance, tooltipAppearance: appearance, showFeedbackList: true }, visibility: { enabled: true, routeKey: "/demo-showcase" }, team: { user: { id: "demo-user", name: "김상준" }, reviewers: DEMO_AUTHORS }, mode: "default", sync: "api", require: { authLogin: false, reviewerKey: false }, adapter: adapter, networkMonitor: false, children: _jsx(DemoPreferenceSync, { locale: locale, appearance: appearance, children: children }) }));
}
//# sourceMappingURL=DemoRuntime.js.map