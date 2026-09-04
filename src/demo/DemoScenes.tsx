"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import type { UserSelectablePanelTab } from "@/shared/constants/panelTabRegistry.js";
import {
    ReportDataContext,
    ReportPreferencesContext,
    ReportSessionContext,
    useReportData,
    useReportPreferences,
    useReportSession,
    type ReportDataValue,
    type ReportPreferencesValue,
    type ReportSessionValue,
} from "@/shared/providers/reportContext.js";
import type { NotificationItem } from "@/shared/types/notification.js";
import type { DraftReport, Marker, PickProbeFieldKey, PickProbeValues, ReportPanelTab } from "@/shared/types/report-ui.js";
import type { FeedbackCategory, ReportCase } from "@/shared/types/report.js";
import { MarkerButton, MarkerTooltipSurface } from "@/surfaces/marker/MarkerLayer.js";
import { Panel } from "@/surfaces/panel/Panel.js";
import { DraftTooltip } from "@/surfaces/tooltip/DraftTooltip.js";
import { ProbeTooltip } from "@/surfaces/tooltip/ProbeTooltip.js";
import { FeedbackWindow } from "@/surfaces/window/FeedbackWindow.js";
import { MobilePreviewWindow } from "@/surfaces/window/MobilePreviewWindow.js";
import { NotificationCenter } from "@/surfaces/window/NotificationCenter.js";
import { createDemoNotifications, DEMO_API_FLOW_ENTRIES, DEMO_DRAFT, DEMO_PROBE_VALUES, DEMO_REPORTS, DEMO_TARGET } from "./fixtures.js";
import type { FivePixelsDemoScene } from "./types.js";

const PANEL_TABS: UserSelectablePanelTab[] = ["route-details", "api-flow"];
const MEMO_PANEL_TABS: UserSelectablePanelTab[] = ["memo-list", "route-details"];
const DEMO_STOCK_NAMES = ["삼성전자", "SK하이닉스", "NAVER", "현대차", "한화오션"];
const DEMO_STOCK_NAMES_EN = ["Samsung", "SK Hynix", "NAVER", "Hyundai", "Hanwha Ocean"];
const DEMO_MARKER: Marker = {
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

function cloneDraft(category: FeedbackCategory = "suggestion"): DraftReport {
    return { ...structuredClone(DEMO_DRAFT), category };
}

type PanelSceneProps = {
    initialTab?: ReportPanelTab;
    visibleTabs?: UserSelectablePanelTab[];
    settingsInitialCategory?: "appearance";
};

function PanelScene({ initialTab, visibleTabs = PANEL_TABS, settingsInitialCategory }: PanelSceneProps) {
    const preferences = useReportPreferences();
    const baseSession = useReportSession();
    const baseData = useReportData();
    const [panelTab, setPanelTab] = useState<ReportPanelTab | null>(initialTab ?? null);
    const togglePanelTab = useCallback((nextTab: ReportPanelTab) => {
        setPanelTab((current) => (current === nextTab ? null : nextTab));
    }, []);
    const demoPreferences = useMemo<ReportPreferencesValue>(
        () => ({ ...preferences, visiblePanelTabs: visibleTabs }),
        [preferences, visibleTabs],
    );
    const demoSession = useMemo<ReportSessionValue>(
        () => ({
            ...baseSession,
            markers: [],
            panelTab,
            openPanelTab: togglePanelTab,
            togglePanelTab,
        }),
        [baseSession, panelTab, togglePanelTab],
    );
    const demoData = useMemo<ReportDataValue>(
        () => {
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
        },
        [baseData, initialTab],
    );

    return (
        <ReportPreferencesContext.Provider value={demoPreferences}>
            <ReportSessionContext.Provider value={demoSession}>
                <ReportDataContext.Provider value={demoData}>
                    <div className="flex h-full items-center justify-center p-[16px]">
                        <Panel embedded embeddedSettingsInitialCategory={settingsInitialCategory} />
                    </div>
                </ReportDataContext.Provider>
            </ReportSessionContext.Provider>
        </ReportPreferencesContext.Provider>
    );
}

function MarkerTooltipScene() {
    const { markerAppearance, typography, messages } = useReportPreferences();
    const [open, setOpen] = useState(true);

    return (
        <div className="relative h-full w-full">
            <MarkerButton
                markerItem={DEMO_MARKER}
                isHovered={open}
                isReportMode={false}
                isInteractive
                isProximityHighlighted={false}
                isWindowOpen={false}
                viewingWindowBadge={messages.marker.viewingWindowBadge}
                detachedAriaLabel={messages.marker.detachedAriaLabel}
                detachedModalAriaLabel={messages.marker.detachedModalAriaLabel}
                markerAppearance={markerAppearance}
                typography={typography}
                onActivate={() => setOpen((current) => !current)}
                onHoverStart={() => setOpen(true)}
                onHoverEnd={() => undefined}
                onPointerMove={() => undefined}
                positioning="absolute"
            />
            {open ? (
                <MarkerTooltipSurface
                    report={DEMO_REPORTS[0]}
                    detachedHint={messages.marker.detachedHint}
                    detachedModalHint={messages.marker.detachedModalHint}
                    positioning="absolute"
                    style={{ left: 82, top: 24 }}
                />
            ) : null}
        </div>
    );
}

function FeedbackComposerScene({ variant = "feedback" }: { variant?: "feedback" | "memo" }) {
    const baseSession = useReportSession();
    const baseData = useReportData();
    const draftCategory: FeedbackCategory = variant === "memo" ? "memo" : "suggestion";
    const [draft, setDraft] = useState<DraftReport | null>(() => cloneDraft(draftCategory));
    const [authorName, setAuthorName] = useState("김상준");

    const updateDraftCase = useCallback<ReportSessionValue["updateDraftCase"]>((caseId, text, mentions, userMentions) => {
        setDraft((current) =>
            current
                ? {
                      ...current,
                      cases: current.cases.map((item) =>
                          item.id === caseId ? { ...item, text, mentions, user_mentions: userMentions } : item,
                      ),
                  }
                : current,
        );
    }, []);
    const addDraftCase = useCallback(() => {
        setDraft((current) => {
            if (!current) {
                return current;
            }

            const now = new Date().toISOString();
            const nextCase: ReportCase = {
                id: `demo-draft-case-${current.cases.length + 1}`,
                text: "",
                status: "open",
                created_at: now,
                updated_at: now,
            };
            return { ...current, cases: [...current.cases, nextCase] };
        });
    }, []);
    const removeDraftCase = useCallback((caseId: string) => {
        setDraft((current) =>
            current && current.cases.length > 1
                ? { ...current, cases: current.cases.filter((item) => item.id !== caseId) }
                : current,
        );
    }, []);
    const updateDraftField = useCallback((key: string, value: string | boolean) => {
        setDraft((current) => (current ? { ...current, fieldValues: { ...current.fieldValues, [key]: value } } : current));
    }, []);
    const updateDraftCategory = useCallback((category: FeedbackCategory | null) => {
        setDraft((current) => (current ? { ...current, category } : current));
    }, []);
    const resetDraft = useCallback(() => setDraft(cloneDraft(draftCategory)), [draftCategory]);
    const session = useMemo<ReportSessionValue>(
        () => ({
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
        }),
        [addDraftCase, authorName, baseSession, draft, removeDraftCase, resetDraft, updateDraftCase, updateDraftCategory, updateDraftField],
    );
    const data = useMemo<ReportDataValue>(
        () => ({
            ...baseData,
            handleCreateSubmit: async () => undefined,
            handleCreateSubmitWithGitHubIssue: async () => undefined,
        }),
        [baseData],
    );

    return (
        <ReportSessionContext.Provider value={session}>
            <ReportDataContext.Provider value={data}>
                <div className="relative h-full w-full p-[12px]">
                    <DraftTooltip embedded />
                </div>
            </ReportDataContext.Provider>
        </ReportSessionContext.Provider>
    );
}

function ElementInspectorScene() {
    const { locale } = useReportPreferences();
    const baseSession = useReportSession();
    const baselineValues = useMemo<PickProbeValues>(
        () => ({
            ...DEMO_PROBE_VALUES,
            textContent: locale === "ko" ? "자세히 살펴보기" : "Explore details",
            fontSize: "13px",
            padding: "7px 12px",
            textColor: "#4e5968",
            backgroundColor: "#f2f4f6",
            borderColor: "#e5e8eb",
            justifyContent: "center",
        }),
        [locale],
    );
    const initialValues = useMemo<PickProbeValues>(
        () => ({ ...DEMO_PROBE_VALUES, textContent: locale === "ko" ? "무료로 시작하기" : "Start for free" }),
        [locale],
    );
    const [values, setValues] = useState<PickProbeValues>(initialValues);
    const [open, setOpen] = useState(true);
    const [compareMode, setCompareMode] = useState<"before" | "after">("after");
    const hasEdits = (Object.keys(values) as PickProbeFieldKey[]).some((key) => values[key] !== baselineValues[key]);
    const previewValues = compareMode === "before" ? baselineValues : values;
    const previewStyle: CSSProperties = {
        display: "flex",
        alignItems: previewValues.alignItems,
        justifyContent: previewValues.justifyContent,
        flexDirection: previewValues.flexDirection as CSSProperties["flexDirection"],
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

    const updatePickProbeValue = useCallback((key: PickProbeFieldKey, value: string) => {
        setValues((current) => ({ ...current, [key]: value }));
        setCompareMode("after");
    }, []);
    const resetPickProbeValues = useCallback(() => {
        setValues(baselineValues);
        setCompareMode("after");
    }, [baselineValues]);
    const closePickProbe = useCallback(() => setOpen(false), []);
    const session = useMemo<ReportSessionValue>(
        () => ({
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
        }),
        [baseSession, closePickProbe, compareMode, hasEdits, open, resetPickProbeValues, updatePickProbeValue, values],
    );
    const isKorean = locale === "ko";

    return (
        <ReportSessionContext.Provider value={session}>
            <div className="grid h-full w-full grid-cols-[minmax(230px,1fr)_320px] gap-[14px] p-[12px]">
                <section
                    className="flex min-w-0 flex-col overflow-hidden rounded-[18px] border border-[var(--adaptive-border-subtle)] bg-[var(--adaptive-surface)] shadow-[0_18px_44px_rgba(15,23,42,0.08)]"
                    aria-label={isKorean ? "시안 조정 미리보기" : "Design adjustment preview"}
                >
                    <header className="flex h-[52px] items-center gap-[8px] border-b border-[var(--adaptive-border-subtle)] px-[14px]">
                        <span className="h-[8px] w-[74px] rounded-full bg-[var(--adaptive-black300)]" />
                        <span className="ml-auto h-[24px] w-[24px] rounded-full bg-[var(--adaptive-black100)]" />
                    </header>
                    <div className="flex flex-1 flex-col p-[16px]">
                        <span className="h-[8px] w-[56px] rounded-full bg-[var(--adaptive-blue200)]" />
                        <h3 className="mt-[13px] text-[20px] font-bold leading-[1.35] text-[var(--adaptive-black900)]">
                            {isKorean ? "더 빠른 피드백으로 완성하는 화면" : "Build better screens with faster feedback"}
                        </h3>
                        <p className="mt-[8px] text-[11px] leading-[1.65] text-[var(--adaptive-black500)]">
                            {isKorean ? "선택한 요소의 텍스트와 스타일을 직접 바꿔보세요." : "Select an element and adjust its copy and styles directly."}
                        </p>
                        <div className="mt-[18px] grid grid-cols-2 gap-[8px]">
                            <span className="h-[64px] rounded-[12px] bg-[var(--adaptive-black100)]" />
                            <span className="h-[64px] rounded-[12px] bg-[var(--adaptive-black100)]" />
                        </div>
                        <div className="relative mt-auto rounded-[13px] border border-dashed border-[var(--adaptive-blue400)] p-[5px]">
                            <button type="button" style={previewStyle} onClick={() => setOpen(true)} className="min-h-[34px] w-full outline-none">
                                <span>{previewValues.textContent}</span>
                                <span aria-hidden="true">→</span>
                            </button>
                            <span className="pointer-events-none absolute -left-[3px] -top-[3px] h-[6px] w-[6px] rounded-full bg-[var(--adaptive-blue500)]" />
                            <span className="pointer-events-none absolute -right-[3px] -top-[3px] h-[6px] w-[6px] rounded-full bg-[var(--adaptive-blue500)]" />
                            <span className="pointer-events-none absolute -bottom-[3px] -left-[3px] h-[6px] w-[6px] rounded-full bg-[var(--adaptive-blue500)]" />
                            <span className="pointer-events-none absolute -bottom-[3px] -right-[3px] h-[6px] w-[6px] rounded-full bg-[var(--adaptive-blue500)]" />
                        </div>
                        <p className="mt-[9px] text-center text-[10px] text-[var(--adaptive-black400)]">
                            {open ? (isKorean ? "오른쪽 값을 변경해보세요" : "Change a value on the right") : isKorean ? "버튼을 눌러 시안 조정을 다시 여세요" : "Press the button to reopen UI Edit"}
                        </p>
                    </div>
                </section>
                <div className="relative min-h-0">
                    <ProbeTooltip embedded />
                </div>
            </div>
        </ReportSessionContext.Provider>
    );
}

function DemoMobileContent() {
    const { locale } = useReportPreferences();
    const isKorean = locale === "ko";

    return (
        <div className="h-full w-full bg-white p-[20px] text-[#191f28]">
            <div className="flex items-center justify-between border-b border-[#e5e8eb] pb-[14px]">
                <strong className="text-[18px]">fivepixels.</strong>
                <button type="button" className="rounded-[8px] bg-[#3182f6] px-[12px] py-[7px] text-[12px] font-bold text-white">
                    {isKorean ? "로그인" : "Sign in"}
                </button>
            </div>
            <div className="grid grid-cols-2 gap-[12px] py-[18px]">
                <div className="rounded-[12px] bg-[#f2f4f6] p-[14px]">
                    <p className="text-[11px] text-[#8b95a1]">KOSPI</p>
                    <strong className="mt-[6px] block text-[18px]">6,792.12</strong>
                    <span className="text-[11px] text-[#f04452]">+5.45%</span>
                </div>
                <div className="rounded-[12px] bg-[#f2f4f6] p-[14px]">
                    <p className="text-[11px] text-[#8b95a1]">NASDAQ</p>
                    <strong className="mt-[6px] block text-[18px]">26,331.09</strong>
                    <span className="text-[11px] text-[#3182f6]">-0.59%</span>
                </div>
            </div>
            <p className="mb-[10px] text-[13px] font-bold">{isKorean ? "실시간 종목" : "Live market"}</p>
            {DEMO_STOCK_NAMES.map((name, index) => (
                <div key={name} className="flex items-center border-t border-[#f2f4f6] py-[11px] text-[12px]">
                    <span className="w-[24px] text-[#8b95a1]">{index + 1}</span>
                    <strong>{isKorean ? name : DEMO_STOCK_NAMES_EN[index]}</strong>
                    <span className="ml-auto text-[#f04452]">+{(index + 2.4).toFixed(2)}%</span>
                </div>
            ))}
        </div>
    );
}

function DevicePreviewScene() {
    return (
        <div className="flex h-full items-start justify-center overflow-hidden pt-[8px]">
            <MobilePreviewWindow embedded embeddedContent={<DemoMobileContent />} />
        </div>
    );
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

    return (
        <div className="flex h-full items-center justify-center py-[20px]">
            <FeedbackWindow report={report} anchor={{ left: 0, top: 0 }} isFocused embedded />
        </div>
    );
}

function NotificationsScene() {
    const { locale } = useReportPreferences();
    const baseSession = useReportSession();
    const [notifications, setNotifications] = useState<NotificationItem[]>(() => createDemoNotifications(locale));

    useEffect(() => {
        setNotifications(createDemoNotifications(locale));
    }, [locale]);

    const markNotificationRead = useCallback((id: string) => {
        setNotifications((current) => current.map((item) => (item.id === id ? { ...item, read: true } : item)));
    }, []);
    const markAllNotificationsRead = useCallback(() => {
        setNotifications((current) => current.map((item) => ({ ...item, read: true })));
    }, []);
    const dismissNotification = useCallback((id: string) => {
        setNotifications((current) => current.filter((item) => item.id !== id));
    }, []);
    const clearNotifications = useCallback(() => setNotifications([]), []);
    const session = useMemo<ReportSessionValue>(
        () => ({
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
        }),
        [baseSession, clearNotifications, dismissNotification, markAllNotificationsRead, markNotificationRead, notifications],
    );

    return (
        <ReportSessionContext.Provider value={session}>
            <div className="relative h-full w-full overflow-hidden rounded-[16px]">
                <NotificationCenter embedded />
            </div>
        </ReportSessionContext.Provider>
    );
}

export function DemoScene({ scene }: { scene: FivePixelsDemoScene }) {
    switch (scene) {
        case "marker-tooltip":
            return <MarkerTooltipScene />;
        case "feedback-composer":
            return <FeedbackComposerScene />;
        case "memo-composer":
            return <FeedbackComposerScene variant="memo" />;
        case "panel-overview":
            return <PanelScene />;
        case "network-monitor":
            return <PanelScene initialTab="api-flow" />;
        case "memo-list":
            return <PanelScene initialTab="memo-list" visibleTabs={MEMO_PANEL_TABS} />;
        case "element-inspector":
            return <ElementInspectorScene />;
        case "device-preview":
            return <DevicePreviewScene />;
        case "feedback-thread":
            return <FeedbackThreadScene />;
        case "settings":
            return <PanelScene initialTab="settings" />;
        case "settings-customization":
            return <PanelScene initialTab="settings" settingsInitialCategory="appearance" />;
        case "notifications":
            return <NotificationsScene />;
    }
}
