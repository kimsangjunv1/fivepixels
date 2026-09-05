"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { ReportDataContext, ReportPreferencesContext, ReportSessionContext, useReportData, useReportPreferences, useReportSession, } from "../shared/providers/reportContext.js";
import { MarkerButton, MarkerTooltipSurface } from "../surfaces/marker/MarkerLayer.js";
import { Panel } from "../surfaces/panel/Panel.js";
import { DraftTooltip } from "../surfaces/tooltip/DraftTooltip.js";
import { PickTargetSavedBadges } from "../surfaces/tooltip/PickTargetSavedBadges.js";
import { ProbeTooltip } from "../surfaces/tooltip/ProbeTooltip.js";
import { TargetHighlights } from "../surfaces/tooltip/TargetHighlights.js";
import { useTooltipLayout } from "../surfaces/tooltip/useTooltipLayout.js";
import { FeedbackWindow } from "../surfaces/window/FeedbackWindow.js";
import { MobilePreviewWindow } from "../surfaces/window/MobilePreviewWindow.js";
import { NotificationCenter } from "../surfaces/window/NotificationCenter.js";
import { createDemoNotifications, DEMO_API_FLOW_ENTRIES, DEMO_DRAFT, DEMO_PROBE_VALUES, DEMO_REPORTS, DEMO_TARGET } from "./fixtures.js";
import { useDemoLocked } from "./DemoInteractionContext.js";
const DEMO_PROBE_ELEMENT_KEY = "id:checkout-actions:item";
function toDomRect(rect) {
    return {
        x: rect.x,
        y: rect.y,
        left: rect.left,
        top: rect.top,
        right: rect.right,
        bottom: rect.bottom,
        width: rect.width,
        height: rect.height,
        toJSON: () => ({ x: rect.x, y: rect.y, width: rect.width, height: rect.height }),
    };
}
const PANEL_TABS = ["route-details", "api-flow"];
const LIST_PANEL_TABS = ["feedback-list", "route-details"];
const MEMO_PANEL_TABS = ["memo-list", "route-details"];
const BRIEF_PANEL_TABS = ["page-brief", "route-details"];
const TASK_PANEL_TABS = ["my-tasks", "route-details"];
const HEALTH_PANEL_TABS = ["project-health", "route-details"];
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
function PanelScene({ initialTab = "route-details", visibleTabs = PANEL_TABS, settingsInitialCategory }) {
    const locked = useDemoLocked();
    const preferences = useReportPreferences();
    const baseSession = useReportSession();
    const baseData = useReportData();
    const [panelTab, setPanelTab] = useState(initialTab);
    const activeTab = locked ? initialTab : panelTab;
    const togglePanelTab = useCallback((nextTab) => {
        if (locked) {
            return;
        }
        setPanelTab((current) => (current === nextTab ? null : nextTab));
    }, [locked]);
    const openPanelTab = useCallback((nextTab) => {
        if (locked) {
            return;
        }
        setPanelTab(nextTab);
    }, [locked]);
    const demoPreferences = useMemo(() => ({ ...preferences, visiblePanelTabs: visibleTabs }), [preferences, visibleTabs]);
    const demoSession = useMemo(() => ({
        ...baseSession,
        markers: [],
        panelTab: activeTab,
        openPanelTab,
        togglePanelTab,
    }), [activeTab, baseSession, openPanelTab, togglePanelTab]);
    const demoData = useMemo(() => {
        const withReports = {
            ...baseData,
            reports: DEMO_REPORTS,
            currentPageReports: DEMO_REPORTS,
            filteredReports: DEMO_REPORTS,
            allPageReports: DEMO_REPORTS,
            listScope: "all",
        };
        if (initialTab === "api-flow") {
            return {
                ...withReports,
                apiFlowEntries: DEMO_API_FLOW_ENTRIES,
                activeApiFailureAlert: null,
                networkMonitorEnabled: true,
            };
        }
        return withReports;
    }, [baseData, initialTab]);
    return (_jsx(ReportPreferencesContext.Provider, { value: demoPreferences, children: _jsx(ReportSessionContext.Provider, { value: demoSession, children: _jsx(ReportDataContext.Provider, { value: demoData, children: _jsx("div", { className: "flex h-full items-center justify-center p-[16px]", children: _jsx(Panel, { embedded: true, embeddedSettingsInitialCategory: settingsInitialCategory }) }) }) }) }));
}
function MarkerTooltipScene() {
    const locked = useDemoLocked();
    const { markerAppearance, typography, messages } = useReportPreferences();
    const [open, setOpen] = useState(true);
    const markerOpen = locked ? true : open;
    const { layout: tooltipLayout, setTooltipElement } = useTooltipLayout(markerOpen ? DEMO_MARKER : null, false, markerOpen);
    const tooltipPosition = tooltipLayout?.position ?? null;
    const tooltipAnchorStyle = tooltipLayout?.anchorStyle;
    const bindHoverTooltipRef = useCallback((node) => {
        setTooltipElement(node);
    }, [setTooltipElement]);
    return (_jsxs("div", { className: "relative h-full w-full overflow-visible", children: [_jsx(MarkerButton, { markerItem: DEMO_MARKER, isHovered: markerOpen, isReportMode: false, isInteractive: !locked, isProximityHighlighted: false, isWindowOpen: false, viewingWindowBadge: messages.marker.viewingWindowBadge, detachedAriaLabel: messages.marker.detachedAriaLabel, detachedModalAriaLabel: messages.marker.detachedModalAriaLabel, markerAppearance: markerAppearance, typography: typography, onActivate: () => {
                    if (locked) {
                        return;
                    }
                    setOpen((current) => !current);
                }, onHoverStart: () => {
                    if (!locked) {
                        setOpen(true);
                    }
                }, onHoverEnd: () => undefined, onPointerMove: () => undefined, positioning: "absolute" }), markerOpen && tooltipPosition && tooltipAnchorStyle ? (_jsx(MarkerTooltipSurface, { containerRef: bindHoverTooltipRef, report: DEMO_REPORTS[0], detachedHint: messages.marker.detachedHint, detachedModalHint: messages.marker.detachedModalHint, positioning: "absolute", style: {
                    left: tooltipPosition.left,
                    top: tooltipPosition.top,
                    ...tooltipAnchorStyle,
                } })) : null] }));
}
function FeedbackComposerScene({ variant = "feedback" }) {
    const locked = useDemoLocked();
    const baseSession = useReportSession();
    const baseData = useReportData();
    const draftCategory = variant === "memo" ? "memo" : "suggestion";
    const [draft, setDraft] = useState(() => cloneDraft(draftCategory));
    const [authorName, setAuthorName] = useState("김상준");
    const updateDraftCase = useCallback((caseId, text, mentions, userMentions) => {
        if (locked) {
            return;
        }
        setDraft((current) => current
            ? {
                ...current,
                cases: current.cases.map((item) => (item.id === caseId ? { ...item, text, mentions, user_mentions: userMentions } : item)),
            }
            : current);
    }, [locked]);
    const addDraftCase = useCallback(() => {
        if (locked) {
            return;
        }
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
    }, [locked]);
    const removeDraftCase = useCallback((caseId) => {
        if (locked) {
            return;
        }
        setDraft((current) => (current && current.cases.length > 1 ? { ...current, cases: current.cases.filter((item) => item.id !== caseId) } : current));
    }, [locked]);
    const updateDraftField = useCallback((key, value) => {
        if (locked) {
            return;
        }
        setDraft((current) => (current ? { ...current, fieldValues: { ...current.fieldValues, [key]: value } } : current));
    }, [locked]);
    const updateDraftCategory = useCallback((category) => {
        if (locked) {
            return;
        }
        setDraft((current) => (current ? { ...current, category } : current));
    }, [locked]);
    const resetDraft = useCallback(() => {
        if (locked) {
            return;
        }
        setDraft(cloneDraft(draftCategory));
    }, [draftCategory, locked]);
    const session = useMemo(() => ({
        ...baseSession,
        mode: "report",
        draft,
        selectedTarget: DEMO_TARGET,
        draftAuthorName: authorName,
        setDraftAuthorName: locked ? () => undefined : setAuthorName,
        updateDraftCase,
        addDraftCase,
        removeDraftCase,
        updateDraftField,
        updateDraftCategory,
        cancelDraft: resetDraft,
    }), [addDraftCase, authorName, baseSession, draft, locked, removeDraftCase, resetDraft, updateDraftCase, updateDraftCategory, updateDraftField]);
    const data = useMemo(() => ({
        ...baseData,
        handleCreateSubmit: async () => undefined,
        handleCreateSubmitWithGitHubIssue: async () => undefined,
    }), [baseData]);
    return (_jsx(ReportSessionContext.Provider, { value: session, children: _jsx(ReportDataContext.Provider, { value: data, children: _jsx("div", { className: "relative h-full w-full p-[12px]", children: _jsx(DraftTooltip, { embedded: true }) }) }) }));
}
function ElementInspectorScene() {
    const locked = useDemoLocked();
    const { locale } = useReportPreferences();
    const baseSession = useReportSession();
    const buttonRef = useRef(null);
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
    const [targetRect, setTargetRect] = useState(DEMO_TARGET.rect);
    const [savedProbeEdits, setSavedProbeEdits] = useState({});
    const lockedOpen = locked ? true : open;
    const lockedCompare = locked ? "after" : compareMode;
    const lockedValues = locked ? initialValues : values;
    const hasEdits = Object.keys(lockedValues).some((key) => lockedValues[key] !== baselineValues[key]);
    const previewValues = lockedCompare === "before" ? baselineValues : lockedValues;
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
    const updateTargetRect = useCallback(() => {
        const node = buttonRef.current;
        if (!node) {
            return;
        }
        setTargetRect(toDomRect(node.getBoundingClientRect()));
    }, []);
    useEffect(() => {
        setValues(initialValues);
        setCompareMode("after");
        setOpen(true);
        setSavedProbeEdits({});
    }, [initialValues]);
    useLayoutEffect(() => {
        updateTargetRect();
        const frameId = window.requestAnimationFrame(() => {
            updateTargetRect();
            window.requestAnimationFrame(updateTargetRect);
        });
        const node = buttonRef.current;
        if (!node) {
            return () => window.cancelAnimationFrame(frameId);
        }
        const resizeObserver = new ResizeObserver(() => updateTargetRect());
        resizeObserver.observe(node);
        window.addEventListener("resize", updateTargetRect);
        window.addEventListener("scroll", updateTargetRect, true);
        return () => {
            window.cancelAnimationFrame(frameId);
            resizeObserver.disconnect();
            window.removeEventListener("resize", updateTargetRect);
            window.removeEventListener("scroll", updateTargetRect, true);
        };
    }, [previewValues, updateTargetRect]);
    const updatePickProbeValue = useCallback((key, value) => {
        if (locked) {
            return;
        }
        setValues((current) => ({ ...current, [key]: value }));
        setCompareMode("after");
    }, [locked]);
    const resetPickProbeValues = useCallback(() => {
        if (locked) {
            return;
        }
        setValues(baselineValues);
        setCompareMode("after");
        setSavedProbeEdits({});
    }, [baselineValues, locked]);
    const closePickProbe = useCallback(() => {
        if (locked) {
            return;
        }
        setOpen(false);
        if (!hasEdits) {
            setSavedProbeEdits({});
            return;
        }
        setSavedProbeEdits({
            [DEMO_PROBE_ELEMENT_KEY]: {
                elementKey: DEMO_PROBE_ELEMENT_KEY,
                baseline: baselineValues,
                applied: values,
                originalStyle: null,
                originalTextContent: baselineValues.textContent,
                originalInnerHTML: null,
                originalInputValue: null,
            },
        });
    }, [baselineValues, hasEdits, locked, values]);
    const openPickProbe = useCallback(() => {
        if (locked) {
            return;
        }
        setSavedProbeEdits({});
        setOpen(true);
    }, [locked]);
    const selectedTarget = useMemo(() => ({
        ...DEMO_TARGET,
        rect: targetRect,
        boxStyle: {
            display: "flex",
            padding: previewValues.padding,
            margin: previewValues.margin,
            borderRadius: "10px",
        },
    }), [previewValues.margin, previewValues.padding, targetRect]);
    const session = useMemo(() => ({
        ...baseSession,
        mode: "report",
        selectedTarget,
        pickProbeOpen: lockedOpen,
        pickProbeSupportsTextFields: true,
        pickProbeLayoutMode: "flex",
        pickProbeValues: lockedValues,
        pickProbeCompareMode: lockedCompare,
        pickProbeHasEdits: hasEdits,
        savedProbeEdits,
        setPickProbeCompareMode: locked ? () => undefined : setCompareMode,
        updatePickProbeValue,
        resetPickProbeValues,
        closePickProbe,
    }), [baseSession, closePickProbe, hasEdits, locked, lockedCompare, lockedOpen, lockedValues, resetPickProbeValues, savedProbeEdits, selectedTarget, updatePickProbeValue]);
    return (_jsxs(ReportSessionContext.Provider, { value: session, children: [_jsxs("div", { className: "grid h-full w-full grid-cols-[minmax(200px,1fr)_320px] gap-[14px] p-[12px]", children: [_jsx("div", { className: "relative flex min-h-0 items-center justify-center overflow-visible", children: _jsxs("button", { ref: buttonRef, type: "button", "data-report-id": DEMO_TARGET.reportIdAttribute ?? "checkout-actions", style: previewStyle, onClick: openPickProbe, className: "min-h-[34px] outline-none", children: [_jsx("span", { children: previewValues.textContent }), _jsx("span", { "aria-hidden": "true", children: "\u2192" })] }) }), _jsx("div", { className: "relative min-h-0", children: _jsx(ProbeTooltip, { embedded: true }) })] }), _jsx(TargetHighlights, { hoveredTarget: null, selectedTarget: selectedTarget, contextMenuTarget: lockedOpen ? selectedTarget : null, showPickProbeCompare: lockedOpen && hasEdits, activeMarkerTarget: null }), _jsx(PickTargetSavedBadges, {})] }));
}
function DemoMobileContent() {
    const { locale } = useReportPreferences();
    const isKorean = locale === "ko";
    return (_jsxs("div", { className: "h-full w-full bg-white p-[20px] text-[#191f28]", children: [_jsxs("div", { className: "flex items-center justify-between border-b border-[#e5e8eb] pb-[14px]", children: [_jsx("strong", { className: "text-[18px]", children: "fivepixels." }), _jsx("button", { type: "button", className: "rounded-[8px] bg-[#3182f6] px-[12px] py-[7px] text-[12px] font-bold text-white", children: isKorean ? "로그인" : "Sign in" })] }), _jsxs("div", { className: "grid grid-cols-2 gap-[12px] py-[18px]", children: [_jsxs("div", { className: "rounded-[12px] bg-[#f2f4f6] p-[14px]", children: [_jsx("p", { className: "text-[12px] text-[#8b95a1]", children: "KOSPI" }), _jsx("strong", { className: "mt-[6px] block text-[18px]", children: "6,792.12" }), _jsx("span", { className: "text-[12px] text-[#f04452]", children: "+5.45%" })] }), _jsxs("div", { className: "rounded-[12px] bg-[#f2f4f6] p-[14px]", children: [_jsx("p", { className: "text-[12px] text-[#8b95a1]", children: "NASDAQ" }), _jsx("strong", { className: "mt-[6px] block text-[18px]", children: "26,331.09" }), _jsx("span", { className: "text-[12px] text-[#3182f6]", children: "-0.59%" })] })] }), _jsx("p", { className: "mb-[10px] text-[14px] font-bold", children: isKorean ? "실시간 종목" : "Live market" }), DEMO_STOCK_NAMES.map((name, index) => (_jsxs("div", { className: "flex items-center border-t border-[#f2f4f6] py-[11px] text-[12px]", children: [_jsx("span", { className: "w-[24px] text-[#8b95a1]", children: index + 1 }), _jsx("strong", { children: isKorean ? name : DEMO_STOCK_NAMES_EN[index] }), _jsxs("span", { className: "ml-auto text-[#f04452]", children: ["+", (index + 2.4).toFixed(2), "%"] })] }, name)))] }));
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
    const locked = useDemoLocked();
    const { locale } = useReportPreferences();
    const baseSession = useReportSession();
    const [notifications, setNotifications] = useState(() => createDemoNotifications(locale));
    useEffect(() => {
        setNotifications(createDemoNotifications(locale));
    }, [locale]);
    const markNotificationRead = useCallback((id) => {
        if (locked) {
            return;
        }
        setNotifications((current) => current.map((item) => (item.id === id ? { ...item, read: true } : item)));
    }, [locked]);
    const markAllNotificationsRead = useCallback(() => {
        if (locked) {
            return;
        }
        setNotifications((current) => current.map((item) => ({ ...item, read: true })));
    }, [locked]);
    const dismissNotification = useCallback((id) => {
        if (locked || id.startsWith("status:")) {
            return;
        }
        setNotifications((current) => current.filter((item) => item.id !== id));
    }, [locked]);
    const clearNotifications = useCallback(() => {
        if (locked) {
            return;
        }
        setNotifications((current) => current.filter((item) => item.id.startsWith("status:")));
    }, [locked]);
    const runNotificationAction = useCallback((item, action) => {
        if (locked) {
            return;
        }
        setNotifications((current) => current.map((entry) => {
            if (entry.id !== item.id) {
                return entry;
            }
            if (action === "hide_markers" || action === "show_markers") {
                return {
                    ...entry,
                    read: true,
                    payload: {
                        ...entry.payload,
                        markersVisible: action === "show_markers",
                    },
                };
            }
            if (action === "probe_reset") {
                return {
                    ...entry,
                    read: true,
                    payload: { ...entry.payload, canUndo: false, canRedo: false },
                };
            }
            if (action === "probe_undo") {
                return {
                    ...entry,
                    read: true,
                    payload: {
                        ...entry.payload,
                        canUndo: false,
                        canRedo: true,
                    },
                };
            }
            if (action === "probe_redo") {
                return {
                    ...entry,
                    read: true,
                    payload: {
                        ...entry.payload,
                        canUndo: true,
                        canRedo: false,
                    },
                };
            }
            return { ...entry, read: true };
        }));
    }, [locked]);
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
        runNotificationAction,
    }), [baseSession, clearNotifications, dismissNotification, markAllNotificationsRead, markNotificationRead, notifications, runNotificationAction]);
    return (_jsx(ReportSessionContext.Provider, { value: session, children: _jsx("div", { className: "relative h-full w-full overflow-hidden rounded-[16px] bg-[linear-gradient(160deg,#1c1f24_0%,#2a3038_55%,#171a1f_100%)]", children: _jsx(NotificationCenter, { embedded: true }) }) }));
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
            return _jsx(PanelScene, { initialTab: "route-details" });
        case "network-monitor":
            return _jsx(PanelScene, { initialTab: "api-flow" });
        case "feedback-list":
            return _jsx(PanelScene, { initialTab: "feedback-list", visibleTabs: LIST_PANEL_TABS });
        case "memo-list":
            return (_jsx(PanelScene, { initialTab: "memo-list", visibleTabs: MEMO_PANEL_TABS }));
        case "page-brief":
            return _jsx(PanelScene, { initialTab: "page-brief", visibleTabs: BRIEF_PANEL_TABS });
        case "my-tasks":
            return _jsx(PanelScene, { initialTab: "my-tasks", visibleTabs: TASK_PANEL_TABS });
        case "project-health":
            return _jsx(PanelScene, { initialTab: "project-health", visibleTabs: HEALTH_PANEL_TABS });
        case "element-inspector":
            return _jsx(ElementInspectorScene, {});
        case "device-preview":
            return _jsx(DevicePreviewScene, {});
        case "feedback-thread":
            return _jsx(FeedbackThreadScene, {});
        case "settings":
            return _jsx(PanelScene, { initialTab: "settings" });
        case "settings-customization":
            return (_jsx(PanelScene, { initialTab: "settings", settingsInitialCategory: "appearance" }));
        case "notifications":
            return _jsx(NotificationsScene, {});
    }
}
//# sourceMappingURL=DemoScenes.js.map