"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ReportDataContext, ReportPreferencesContext, ReportSessionContext, useReportData, useReportPreferences, useReportSession, } from "../shared/providers/reportContext.js";
import { MarkerButton, MarkerTooltipSurface } from "../surfaces/marker/MarkerLayer.js";
import { Panel } from "../surfaces/panel/Panel.js";
import { DraftTooltip } from "../surfaces/tooltip/DraftTooltip.js";
import { ProbeTooltip } from "../surfaces/tooltip/ProbeTooltip.js";
import { FeedbackWindow } from "../surfaces/window/FeedbackWindow.js";
import { MobilePreviewWindow } from "../surfaces/window/MobilePreviewWindow.js";
import { NotificationCenter } from "../surfaces/window/NotificationCenter.js";
import { createDemoNotifications, DEMO_API_FLOW_ENTRIES, DEMO_DRAFT, DEMO_PROBE_VALUES, DEMO_REPORTS, DEMO_TARGET } from "./fixtures.js";
const PANEL_TABS = ["route-details", "api-flow"];
const MEMO_PANEL_TABS = ["memo-list", "route-details"];
const DEMO_STOCK_NAMES = ["삼성전자", "SK하이닉스", "NAVER", "현대차", "한화오션"];
const DEMO_STOCK_NAMES_EN = ["Samsung", "SK Hynix", "NAVER", "Hyundai", "Hanwha Ocean"];
const DEMO_MARKER = {
    id: "demo-marker-1",
    left: 40,
    top: 156,
    rect: null,
    detached: false,
    detachedKind: null,
    clampedEdge: null,
    clampBounds: null,
    clampContainerId: null,
    aggregateCount: 1,
    report: DEMO_REPORTS[0],
};
function cloneDraft(category = "suggestion") {
    return { ...structuredClone(DEMO_DRAFT), category };
}
function PanelScene({ initialTab, visibleTabs = PANEL_TABS, settingsInitialCategory }) {
    const preferences = useReportPreferences();
    const baseSession = useReportSession();
    const baseData = useReportData();
    const [panelTab, setPanelTab] = useState(initialTab ?? null);
    const togglePanelTab = useCallback((nextTab) => {
        setPanelTab((current) => (current === nextTab ? null : nextTab));
    }, []);
    const demoPreferences = useMemo(() => ({ ...preferences, visiblePanelTabs: visibleTabs }), [preferences, visibleTabs]);
    const demoSession = useMemo(() => ({
        ...baseSession,
        markers: [],
        panelTab,
        openPanelTab: togglePanelTab,
        togglePanelTab,
    }), [baseSession, panelTab, togglePanelTab]);
    const demoData = useMemo(() => {
        if (initialTab === "api-flow") {
            return {
                ...baseData,
                apiFlowEntries: DEMO_API_FLOW_ENTRIES,
                activeApiFailureAlert: null,
                networkMonitorEnabled: true,
            };
        }
        if (initialTab === "memo-list") {
            return {
                ...baseData,
                reports: DEMO_REPORTS,
                currentPageReports: DEMO_REPORTS,
                filteredReports: DEMO_REPORTS,
            };
        }
        return baseData;
    }, [baseData, initialTab]);
    return (_jsx(ReportPreferencesContext.Provider, { value: demoPreferences, children: _jsx(ReportSessionContext.Provider, { value: demoSession, children: _jsx(ReportDataContext.Provider, { value: demoData, children: _jsx("div", { className: "flex h-full items-center justify-center p-[16px]", children: _jsx(Panel, { embedded: true, embeddedSettingsInitialCategory: settingsInitialCategory }) }) }) }) }));
}
function MarkerTooltipScene() {
    const { markerAppearance, typography, messages } = useReportPreferences();
    const [open, setOpen] = useState(true);
    return (_jsxs("div", { className: "relative h-full w-full", children: [_jsx(MarkerButton, { markerItem: DEMO_MARKER, isHovered: open, isReportMode: false, isInteractive: true, isProximityHighlighted: false, isWindowOpen: false, viewingWindowBadge: messages.marker.viewingWindowBadge, detachedAriaLabel: messages.marker.detachedAriaLabel, detachedModalAriaLabel: messages.marker.detachedModalAriaLabel, markerAppearance: markerAppearance, typography: typography, onActivate: () => setOpen((current) => !current), onHoverStart: () => setOpen(true), onHoverEnd: () => undefined, onPointerMove: () => undefined, positioning: "absolute" }), open ? (_jsx(MarkerTooltipSurface, { report: DEMO_REPORTS[0], detachedHint: messages.marker.detachedHint, detachedModalHint: messages.marker.detachedModalHint, positioning: "absolute", style: { left: 82, top: 24 } })) : null] }));
}
function FeedbackComposerScene({ variant = "feedback" }) {
    const baseSession = useReportSession();
    const baseData = useReportData();
    const draftCategory = variant === "memo" ? "memo" : "suggestion";
    const [draft, setDraft] = useState(() => cloneDraft(draftCategory));
    const [authorName, setAuthorName] = useState("김상준");
    const updateDraftCase = useCallback((caseId, text, mentions, userMentions) => {
        setDraft((current) => current
            ? {
                ...current,
                cases: current.cases.map((item) => item.id === caseId ? { ...item, text, mentions, user_mentions: userMentions } : item),
            }
            : current);
    }, []);
    const addDraftCase = useCallback(() => {
        setDraft((current) => {
            if (!current) {
                return current;
            }
            const now = new Date().toISOString();
            const nextCase = {
                id: `demo-draft-case-${current.cases.length + 1}`,
                text: "",
                status: "open",
                created_at: now,
                updated_at: now,
            };
            return { ...current, cases: [...current.cases, nextCase] };
        });
    }, []);
    const removeDraftCase = useCallback((caseId) => {
        setDraft((current) => current && current.cases.length > 1
            ? { ...current, cases: current.cases.filter((item) => item.id !== caseId) }
            : current);
    }, []);
    const updateDraftField = useCallback((key, value) => {
        setDraft((current) => (current ? { ...current, fieldValues: { ...current.fieldValues, [key]: value } } : current));
    }, []);
    const updateDraftCategory = useCallback((category) => {
        setDraft((current) => (current ? { ...current, category } : current));
    }, []);
    const resetDraft = useCallback(() => setDraft(cloneDraft(draftCategory)), [draftCategory]);
    const session = useMemo(() => ({
        ...baseSession,
        mode: "report",
        draft,
        selectedTarget: DEMO_TARGET,
        draftAuthorName: authorName,
        setDraftAuthorName: setAuthorName,
        updateDraftCase,
        addDraftCase,
        removeDraftCase,
        updateDraftField,
        updateDraftCategory,
        cancelDraft: resetDraft,
    }), [addDraftCase, authorName, baseSession, draft, removeDraftCase, resetDraft, updateDraftCase, updateDraftCategory, updateDraftField]);
    const data = useMemo(() => ({
        ...baseData,
        handleCreateSubmit: async () => undefined,
        handleCreateSubmitWithGitHubIssue: async () => undefined,
    }), [baseData]);
    return (_jsx(ReportSessionContext.Provider, { value: session, children: _jsx(ReportDataContext.Provider, { value: data, children: _jsx("div", { className: "relative h-full w-full p-[12px]", children: _jsx(DraftTooltip, { embedded: true }) }) }) }));
}
function ElementInspectorScene() {
    const { locale } = useReportPreferences();
    const baseSession = useReportSession();
    const baselineValues = useMemo(() => ({
        ...DEMO_PROBE_VALUES,
        textContent: locale === "ko" ? "자세히 살펴보기" : "Explore details",
        fontSize: "13px",
        padding: "7px 12px",
        textColor: "#4e5968",
        backgroundColor: "#f2f4f6",
        borderColor: "#e5e8eb",
        justifyContent: "center",
    }), [locale]);
    const initialValues = useMemo(() => ({ ...DEMO_PROBE_VALUES, textContent: locale === "ko" ? "무료로 시작하기" : "Start for free" }), [locale]);
    const [values, setValues] = useState(initialValues);
    const [open, setOpen] = useState(true);
    const [compareMode, setCompareMode] = useState("after");
    const hasEdits = Object.keys(values).some((key) => values[key] !== baselineValues[key]);
    const previewValues = compareMode === "before" ? baselineValues : values;
    const previewStyle = {
        display: "flex",
        alignItems: previewValues.alignItems,
        justifyContent: previewValues.justifyContent,
        flexDirection: previewValues.flexDirection,
        gap: previewValues.gap,
        margin: previewValues.margin,
        padding: previewValues.padding,
        border: `1px solid ${previewValues.borderColor}`,
        borderRadius: "10px",
        backgroundColor: previewValues.backgroundColor,
        color: previewValues.textColor,
        fontSize: previewValues.fontSize,
        lineHeight: previewValues.lineHeight,
    };
    useEffect(() => {
        setValues(initialValues);
        setCompareMode("after");
        setOpen(true);
    }, [initialValues]);
    const updatePickProbeValue = useCallback((key, value) => {
        setValues((current) => ({ ...current, [key]: value }));
        setCompareMode("after");
    }, []);
    const resetPickProbeValues = useCallback(() => {
        setValues(baselineValues);
        setCompareMode("after");
    }, [baselineValues]);
    const closePickProbe = useCallback(() => setOpen(false), []);
    const session = useMemo(() => ({
        ...baseSession,
        selectedTarget: DEMO_TARGET,
        pickProbeOpen: open,
        pickProbeSupportsTextFields: true,
        pickProbeLayoutMode: "flex",
        pickProbeValues: values,
        pickProbeCompareMode: compareMode,
        pickProbeHasEdits: hasEdits,
        setPickProbeCompareMode: setCompareMode,
        updatePickProbeValue,
        resetPickProbeValues,
        closePickProbe,
    }), [baseSession, closePickProbe, compareMode, hasEdits, open, resetPickProbeValues, updatePickProbeValue, values]);
    const isKorean = locale === "ko";
    return (_jsx(ReportSessionContext.Provider, { value: session, children: _jsxs("div", { className: "grid h-full w-full grid-cols-[minmax(230px,1fr)_320px] gap-[14px] p-[12px]", children: [_jsxs("section", { className: "flex min-w-0 flex-col overflow-hidden rounded-[18px] border border-[var(--adaptive-border-subtle)] bg-[var(--adaptive-surface)] shadow-[0_18px_44px_rgba(15,23,42,0.08)]", "aria-label": isKorean ? "시안 조정 미리보기" : "Design adjustment preview", children: [_jsxs("header", { className: "flex h-[52px] items-center gap-[8px] border-b border-[var(--adaptive-border-subtle)] px-[14px]", children: [_jsx("span", { className: "h-[8px] w-[74px] rounded-full bg-[var(--adaptive-black300)]" }), _jsx("span", { className: "ml-auto h-[24px] w-[24px] rounded-full bg-[var(--adaptive-black100)]" })] }), _jsxs("div", { className: "flex flex-1 flex-col p-[16px]", children: [_jsx("span", { className: "h-[8px] w-[56px] rounded-full bg-[var(--adaptive-blue200)]" }), _jsx("h3", { className: "mt-[13px] text-[20px] font-bold leading-[1.35] text-[var(--adaptive-black900)]", children: isKorean ? "더 빠른 피드백으로 완성하는 화면" : "Build better screens with faster feedback" }), _jsx("p", { className: "mt-[8px] text-[11px] leading-[1.65] text-[var(--adaptive-black500)]", children: isKorean ? "선택한 요소의 텍스트와 스타일을 직접 바꿔보세요." : "Select an element and adjust its copy and styles directly." }), _jsxs("div", { className: "mt-[18px] grid grid-cols-2 gap-[8px]", children: [_jsx("span", { className: "h-[64px] rounded-[12px] bg-[var(--adaptive-black100)]" }), _jsx("span", { className: "h-[64px] rounded-[12px] bg-[var(--adaptive-black100)]" })] }), _jsxs("div", { className: "relative mt-auto rounded-[13px] border border-dashed border-[var(--adaptive-blue400)] p-[5px]", children: [_jsxs("button", { type: "button", style: previewStyle, onClick: () => setOpen(true), className: "min-h-[34px] w-full outline-none", children: [_jsx("span", { children: previewValues.textContent }), _jsx("span", { "aria-hidden": "true", children: "\u2192" })] }), _jsx("span", { className: "pointer-events-none absolute -left-[3px] -top-[3px] h-[6px] w-[6px] rounded-full bg-[var(--adaptive-blue500)]" }), _jsx("span", { className: "pointer-events-none absolute -right-[3px] -top-[3px] h-[6px] w-[6px] rounded-full bg-[var(--adaptive-blue500)]" }), _jsx("span", { className: "pointer-events-none absolute -bottom-[3px] -left-[3px] h-[6px] w-[6px] rounded-full bg-[var(--adaptive-blue500)]" }), _jsx("span", { className: "pointer-events-none absolute -bottom-[3px] -right-[3px] h-[6px] w-[6px] rounded-full bg-[var(--adaptive-blue500)]" })] }), _jsx("p", { className: "mt-[9px] text-center text-[10px] text-[var(--adaptive-black400)]", children: open ? (isKorean ? "오른쪽 값을 변경해보세요" : "Change a value on the right") : isKorean ? "버튼을 눌러 시안 조정을 다시 여세요" : "Press the button to reopen UI Edit" })] })] }), _jsx("div", { className: "relative min-h-0", children: _jsx(ProbeTooltip, { embedded: true }) })] }) }));
}
function DemoMobileContent() {
    const { locale } = useReportPreferences();
    const isKorean = locale === "ko";
    return (_jsxs("div", { className: "h-full w-full bg-white p-[20px] text-[#191f28]", children: [_jsxs("div", { className: "flex items-center justify-between border-b border-[#e5e8eb] pb-[14px]", children: [_jsx("strong", { className: "text-[18px]", children: "fivepixels." }), _jsx("button", { type: "button", className: "rounded-[8px] bg-[#3182f6] px-[12px] py-[7px] text-[12px] font-bold text-white", children: isKorean ? "로그인" : "Sign in" })] }), _jsxs("div", { className: "grid grid-cols-2 gap-[12px] py-[18px]", children: [_jsxs("div", { className: "rounded-[12px] bg-[#f2f4f6] p-[14px]", children: [_jsx("p", { className: "text-[11px] text-[#8b95a1]", children: "KOSPI" }), _jsx("strong", { className: "mt-[6px] block text-[18px]", children: "6,792.12" }), _jsx("span", { className: "text-[11px] text-[#f04452]", children: "+5.45%" })] }), _jsxs("div", { className: "rounded-[12px] bg-[#f2f4f6] p-[14px]", children: [_jsx("p", { className: "text-[11px] text-[#8b95a1]", children: "NASDAQ" }), _jsx("strong", { className: "mt-[6px] block text-[18px]", children: "26,331.09" }), _jsx("span", { className: "text-[11px] text-[#3182f6]", children: "-0.59%" })] })] }), _jsx("p", { className: "mb-[10px] text-[13px] font-bold", children: isKorean ? "실시간 종목" : "Live market" }), DEMO_STOCK_NAMES.map((name, index) => (_jsxs("div", { className: "flex items-center border-t border-[#f2f4f6] py-[11px] text-[12px]", children: [_jsx("span", { className: "w-[24px] text-[#8b95a1]", children: index + 1 }), _jsx("strong", { children: isKorean ? name : DEMO_STOCK_NAMES_EN[index] }), _jsxs("span", { className: "ml-auto text-[#f04452]", children: ["+", (index + 2.4).toFixed(2), "%"] })] }, name)))] }));
}
function DevicePreviewScene() {
    return (_jsx("div", { className: "flex h-full items-start justify-center overflow-hidden pt-[8px]", children: _jsx(MobilePreviewWindow, { embedded: true, embeddedContent: _jsx(DemoMobileContent, {}) }) }));
}
function FeedbackThreadScene() {
    const session = useReportSession();
    const openedRef = useRef(false);
    const report = DEMO_REPORTS[0];
    useEffect(() => {
        if (openedRef.current) {
            return;
        }
        openedRef.current = true;
        session.openReplyComposer(report);
    }, [report, session]);
    return (_jsx("div", { className: "flex h-full items-center justify-center py-[20px]", children: _jsx(FeedbackWindow, { report: report, anchor: { left: 0, top: 0 }, isFocused: true, embedded: true }) }));
}
function NotificationsScene() {
    const { locale } = useReportPreferences();
    const baseSession = useReportSession();
    const [notifications, setNotifications] = useState(() => createDemoNotifications(locale));
    useEffect(() => {
        setNotifications(createDemoNotifications(locale));
    }, [locale]);
    const markNotificationRead = useCallback((id) => {
        setNotifications((current) => current.map((item) => (item.id === id ? { ...item, read: true } : item)));
    }, []);
    const markAllNotificationsRead = useCallback(() => {
        setNotifications((current) => current.map((item) => ({ ...item, read: true })));
    }, []);
    const dismissNotification = useCallback((id) => {
        setNotifications((current) => current.filter((item) => item.id !== id));
    }, []);
    const clearNotifications = useCallback(() => setNotifications([]), []);
    const session = useMemo(() => ({
        ...baseSession,
        notifications,
        unreadNotificationCount: notifications.filter((item) => !item.read).length,
        notificationUiOpen: true,
        closeNotificationUi: () => undefined,
        markNotificationRead,
        markAllNotificationsRead,
        dismissNotification,
        clearNotifications,
        activateNotification: (item) => markNotificationRead(item.id),
    }), [baseSession, clearNotifications, dismissNotification, markAllNotificationsRead, markNotificationRead, notifications]);
    return (_jsx(ReportSessionContext.Provider, { value: session, children: _jsx("div", { className: "relative h-full w-full overflow-hidden rounded-[16px]", children: _jsx(NotificationCenter, { embedded: true }) }) }));
}
export function DemoScene({ scene }) {
    switch (scene) {
        case "marker-tooltip":
            return _jsx(MarkerTooltipScene, {});
        case "feedback-composer":
            return _jsx(FeedbackComposerScene, {});
        case "memo-composer":
            return _jsx(FeedbackComposerScene, { variant: "memo" });
        case "panel-overview":
            return _jsx(PanelScene, {});
        case "network-monitor":
            return _jsx(PanelScene, { initialTab: "api-flow" });
        case "memo-list":
            return _jsx(PanelScene, { initialTab: "memo-list", visibleTabs: MEMO_PANEL_TABS });
        case "element-inspector":
            return _jsx(ElementInspectorScene, {});
        case "device-preview":
            return _jsx(DevicePreviewScene, {});
        case "feedback-thread":
            return _jsx(FeedbackThreadScene, {});
        case "settings":
            return _jsx(PanelScene, { initialTab: "settings" });
        case "settings-customization":
            return _jsx(PanelScene, { initialTab: "settings", settingsInitialCategory: "appearance" });
        case "notifications":
            return _jsx(NotificationsScene, {});
    }
}
//# sourceMappingURL=DemoScenes.js.map