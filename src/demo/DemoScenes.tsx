"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties } from "react";
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
import type { NotificationActionId, NotificationItem } from "@/shared/types/notification.js";
import type { DraftReport, Marker, PickProbeFieldKey, PickProbeValues, ReportPanelTab, SavedProbeEntry, TargetSnapshot } from "@/shared/types/report-ui.js";
import type { FeedbackCategory, ReportCase } from "@/shared/types/report.js";
import { MarkerButton, MarkerTooltipSurface } from "@/surfaces/marker/MarkerLayer.js";
import type { PanelSettingsInitialAppearanceSection, PanelSettingsInitialCategory } from "@/surfaces/panel/PanelSettings.js";
import { Panel } from "@/surfaces/panel/Panel.js";
import { DraftTooltip } from "@/surfaces/tooltip/DraftTooltip.js";
import { PickTargetSavedBadges } from "@/surfaces/tooltip/PickTargetSavedBadges.js";
import { ProbeTooltip } from "@/surfaces/tooltip/ProbeTooltip.js";
import { TargetHighlights } from "@/surfaces/tooltip/TargetHighlights.js";
import { useTooltipLayout } from "@/surfaces/tooltip/useTooltipLayout.js";
import { FeedbackWindow } from "@/surfaces/window/FeedbackWindow.js";
import { MobilePreviewWindow } from "@/surfaces/window/MobilePreviewWindow.js";
import { NotificationCenter } from "@/surfaces/window/NotificationCenter.js";
import { createDemoNotifications, DEMO_API_FLOW_ENTRIES, DEMO_DRAFT, DEMO_FEATURED_REPORTS, DEMO_MEMO_DRAFT, DEMO_PROBE_VALUES, DEMO_REPORTS, DEMO_TARGET } from "./fixtures.js";
import { useDemoLocked, useDemoProbeEditable } from "./DemoInteractionContext.js";
import type { FivePixelsDemoScene } from "./types.js";

const DEMO_PROBE_ELEMENT_KEY = "id:checkout-actions:item";

function toDomRect(rect: DOMRectReadOnly): DOMRect {
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
    } as DOMRect;
}

const PANEL_TABS: UserSelectablePanelTab[] = ["route-details", "api-flow"];
const LIST_PANEL_TABS: UserSelectablePanelTab[] = ["feedback-list", "route-details"];
const MEMO_PANEL_TABS: UserSelectablePanelTab[] = ["memo-list", "route-details"];
const BRIEF_PANEL_TABS: UserSelectablePanelTab[] = ["page-brief", "route-details"];
const TASK_PANEL_TABS: UserSelectablePanelTab[] = ["my-tasks", "route-details"];
const HEALTH_PANEL_TABS: UserSelectablePanelTab[] = ["project-health", "route-details"];
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
    report: DEMO_FEATURED_REPORTS[0],
};

function cloneDraft(category: FeedbackCategory = "suggestion"): DraftReport {
    if (category === "memo") {
        return structuredClone(DEMO_MEMO_DRAFT);
    }
    return { ...structuredClone(DEMO_DRAFT), category };
}

const LIST_PANEL_REPORT_TABS = new Set<ReportPanelTab>(["feedback-list", "memo-list", "my-tasks"]);

type PanelSceneProps = {
    initialTab?: ReportPanelTab;
    visibleTabs?: UserSelectablePanelTab[];
    settingsInitialCategory?: PanelSettingsInitialCategory;
    settingsInitialAppearanceSection?: PanelSettingsInitialAppearanceSection;
};

function PanelScene({
    initialTab = "route-details",
    visibleTabs = PANEL_TABS,
    settingsInitialCategory,
    settingsInitialAppearanceSection,
}: PanelSceneProps) {
    const locked = useDemoLocked();
    const preferences = useReportPreferences();
    const baseSession = useReportSession();
    const baseData = useReportData();
    const [panelTab, setPanelTab] = useState<ReportPanelTab | null>(initialTab);
    const activeTab = locked ? initialTab : panelTab;

    const togglePanelTab = useCallback(
        (nextTab: ReportPanelTab) => {
            if (locked) {
                return;
            }
            setPanelTab((current) => (current === nextTab ? null : nextTab));
        },
        [locked],
    );
    const openPanelTab = useCallback(
        (nextTab: ReportPanelTab) => {
            if (locked) {
                return;
            }
            setPanelTab(nextTab);
        },
        [locked],
    );

    const demoPreferences = useMemo<ReportPreferencesValue>(
        () => ({
            ...preferences,
            visiblePanelTabs: visibleTabs,
            panelView: "ready",
        }),
        [preferences, visibleTabs],
    );
    const demoSession = useMemo<ReportSessionValue>(
        () => ({
            ...baseSession,
            markers: [],
            panelTab: activeTab,
            openPanelTab,
            togglePanelTab,
        }),
        [activeTab, baseSession, openPanelTab, togglePanelTab],
    );
    const demoData = useMemo<ReportDataValue>(() => {
        const panelReports = LIST_PANEL_REPORT_TABS.has(initialTab) ? DEMO_FEATURED_REPORTS : DEMO_REPORTS;
        const withReports: ReportDataValue = {
            ...baseData,
            reports: panelReports,
            currentPageReports: panelReports,
            filteredReports: panelReports,
            allPageReports: panelReports,
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

    return (
        <ReportPreferencesContext.Provider value={demoPreferences}>
            <ReportSessionContext.Provider value={demoSession}>
                <ReportDataContext.Provider value={demoData}>
                    <div className="flex h-full items-center justify-center p-[16px]">
                        <Panel
                            embedded
                            embeddedSettingsInitialCategory={settingsInitialCategory}
                            embeddedSettingsInitialAppearanceSection={settingsInitialAppearanceSection}
                        />
                    </div>
                </ReportDataContext.Provider>
            </ReportSessionContext.Provider>
        </ReportPreferencesContext.Provider>
    );
}

function MarkerTooltipScene() {
    const locked = useDemoLocked();
    const { markerAppearance, typography, messages } = useReportPreferences();
    const [open, setOpen] = useState(true);
    const markerOpen = locked ? true : open;
    const { layout: tooltipLayout, setTooltipElement } = useTooltipLayout(markerOpen ? DEMO_MARKER : null, false, markerOpen);
    const tooltipPosition = tooltipLayout?.position ?? null;
    const tooltipAnchorStyle = tooltipLayout?.anchorStyle;

    const bindHoverTooltipRef = useCallback(
        (node: HTMLDivElement | null) => {
            setTooltipElement(node);
        },
        [setTooltipElement],
    );

    return (
        <div className="relative h-full w-full overflow-visible">
            <MarkerButton
                markerItem={DEMO_MARKER}
                isHovered={markerOpen}
                isReportMode={false}
                isInteractive={!locked}
                isProximityHighlighted={false}
                isWindowOpen={false}
                viewingWindowBadge={messages.marker.viewingWindowBadge}
                detachedAriaLabel={messages.marker.detachedAriaLabel}
                detachedModalAriaLabel={messages.marker.detachedModalAriaLabel}
                markerAppearance={markerAppearance}
                typography={typography}
                onActivate={() => {
                    if (locked) {
                        return;
                    }
                    setOpen((current) => !current);
                }}
                onHoverStart={() => {
                    if (!locked) {
                        setOpen(true);
                    }
                }}
                onHoverEnd={() => undefined}
                onPointerMove={() => undefined}
                positioning="absolute"
            />
            {markerOpen && tooltipPosition && tooltipAnchorStyle ? (
                <MarkerTooltipSurface
                    containerRef={bindHoverTooltipRef}
                    report={DEMO_FEATURED_REPORTS[0]}
                    detachedHint={messages.marker.detachedHint}
                    detachedModalHint={messages.marker.detachedModalHint}
                    positioning="absolute"
                    style={{
                        left: tooltipPosition.left,
                        top: tooltipPosition.top,
                        ...tooltipAnchorStyle,
                    }}
                />
            ) : null}
        </div>
    );
}

function FeedbackComposerScene({ variant = "feedback" }: { variant?: "feedback" | "memo" }) {
    const locked = useDemoLocked();
    const baseSession = useReportSession();
    const baseData = useReportData();
    const draftCategory: FeedbackCategory = variant === "memo" ? "memo" : "suggestion";
    const [draft, setDraft] = useState<DraftReport | null>(() => cloneDraft(draftCategory));
    const [authorName, setAuthorName] = useState("김상준");

    const updateDraftCase = useCallback<ReportSessionValue["updateDraftCase"]>((caseId, text, mentions, userMentions) => {
        if (locked) {
            return;
        }
        setDraft((current) =>
            current
                ? {
                      ...current,
                      cases: current.cases.map((item) => (item.id === caseId ? { ...item, text, mentions, user_mentions: userMentions } : item)),
                  }
                : current,
        );
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
            const nextCase: ReportCase = {
                id: `demo-draft-case-${current.cases.length + 1}`,
                text: "",
                status: "open",
                created_at: now,
                updated_at: now,
            };
            return { ...current, cases: [...current.cases, nextCase] };
        });
    }, [locked]);
    const removeDraftCase = useCallback((caseId: string) => {
        if (locked) {
            return;
        }
        setDraft((current) => (current && current.cases.length > 1 ? { ...current, cases: current.cases.filter((item) => item.id !== caseId) } : current));
    }, [locked]);
    const updateDraftField = useCallback((key: string, value: string | boolean) => {
        if (locked) {
            return;
        }
        setDraft((current) => (current ? { ...current, fieldValues: { ...current.fieldValues, [key]: value } } : current));
    }, [locked]);
    const updateDraftCategory = useCallback((category: FeedbackCategory | null) => {
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
    const session = useMemo<ReportSessionValue>(
        () => ({
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
        }),
        [addDraftCase, authorName, baseSession, draft, locked, removeDraftCase, resetDraft, updateDraftCase, updateDraftCategory, updateDraftField],
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

function buildHoverTargetFromElement(element: HTMLElement, reportId: string): TargetSnapshot {
    const style = window.getComputedStyle(element);
    return {
        id: reportId,
        type: "item",
        rect: toDomRect(element.getBoundingClientRect()),
        isTagged: true,
        targetSelector: `[data-report-id="${reportId}"]`,
        suggestedReportId: reportId,
        tagName: element.tagName.toLowerCase(),
        reportIdAttribute: reportId,
        boxStyle: {
            display: style.display,
            padding: style.padding,
            margin: style.margin,
            borderRadius: style.borderRadius,
        },
        fontStyle: {
            fontFamily: style.fontFamily,
            fontSize: style.fontSize,
            fontWeight: style.fontWeight,
            lineHeight: style.lineHeight,
        },
    };
}

type HoverInspectCard = {
    id: string;
    title: string;
    tag: string;
    tagTone: "bug" | "task" | "done";
};

const HOVER_INSPECT_CARDS: HoverInspectCard[] = [
    { id: "demo-kanban-card-03", title: "Notification stack collapse", tag: "TASK", tagTone: "task" },
    { id: "demo-kanban-card-04", title: "Modal z-index stacking", tag: "BUG", tagTone: "bug" },
    { id: "demo-kanban-card-05", title: "Marker badge spacing", tag: "DONE", tagTone: "done" },
];

function ElementHoverInspectScene() {
    const { locale } = useReportPreferences();
    const baseSession = useReportSession();
    const boardRef = useRef<HTMLDivElement | null>(null);
    const cardRefs = useRef<Record<string, HTMLButtonElement | null>>({});
    const defaultCardId = HOVER_INSPECT_CARDS[1]!.id;
    const [hoveredId, setHoveredId] = useState(defaultCardId);
    const [hoveredTarget, setHoveredTarget] = useState<TargetSnapshot | null>(null);
    const [hoverPointer, setHoverPointer] = useState<{ clientX: number; clientY: number } | null>(null);

    const syncTarget = useCallback((cardId: string, pointer?: { clientX: number; clientY: number }) => {
        const node = cardRefs.current[cardId];
        if (!node) {
            return;
        }

        const nextTarget = buildHoverTargetFromElement(node, cardId);
        setHoveredId(cardId);
        setHoveredTarget(nextTarget);
        const rect = nextTarget.rect;
        setHoverPointer(pointer ?? { clientX: rect.left + rect.width * 0.72, clientY: rect.top + rect.height * 0.35 });
    }, []);

    useLayoutEffect(() => {
        syncTarget(defaultCardId);
        const frameId = window.requestAnimationFrame(() => syncTarget(defaultCardId));
        return () => window.cancelAnimationFrame(frameId);
    }, [defaultCardId, locale, syncTarget]);

    useEffect(() => {
        const onResize = () => syncTarget(hoveredId);
        window.addEventListener("resize", onResize);
        return () => window.removeEventListener("resize", onResize);
    }, [hoveredId, syncTarget]);

    const session = useMemo<ReportSessionValue>(
        () => ({
            ...baseSession,
            mode: "report",
            hoveredTarget,
            hoverPointer,
            setHoveredTarget: () => undefined,
            setHoverPointer: () => undefined,
        }),
        [baseSession, hoverPointer, hoveredTarget],
    );

    const isKorean = locale === "ko";

    return (
        <ReportSessionContext.Provider value={session}>
            <div
                ref={boardRef}
                className="relative h-full w-full overflow-hidden rounded-[16px] bg-[#f4f6f8] p-[16px]"
            >
                <div className="mb-[12px] flex items-center justify-between">
                    <div>
                        <p className="text-[12px] font-semibold uppercase tracking-[0.04em] text-[#8b95a1]">{isKorean ? "피드백 모드" : "Feedback mode"}</p>
                        <h3 className="text-[16px] font-bold text-[#191f28]">{isKorean ? "요소에 올리면 스타일이 보여요" : "Hover an element to inspect styles"}</h3>
                    </div>
                    <span className="rounded-full bg-[#fff1f0] px-[10px] py-[4px] text-[11px] font-bold text-[#f04452]">{isKorean ? "In Review" : "In Review"}</span>
                </div>

                <div className="grid grid-cols-1 gap-[10px]">
                    {HOVER_INSPECT_CARDS.map((card) => {
                        const tagClass =
                            card.tagTone === "bug"
                                ? "bg-[#fff1f0] text-[#f04452]"
                                : card.tagTone === "done"
                                  ? "bg-[#e8f8ef] text-[#1f8a4c]"
                                  : "bg-[#eef3ff] text-[#3182f6]";

                        return (
                            <button
                                key={card.id}
                                ref={(node) => {
                                    cardRefs.current[card.id] = node;
                                }}
                                type="button"
                                data-report-id={card.id}
                                className="w-full rounded-[12px] border border-[#e5e8eb] bg-white px-[14px] py-[12px] text-left shadow-[0_8px_24px_rgba(25,31,40,0.06)] outline-none"
                                onPointerMove={(event) => {
                                    syncTarget(card.id, { clientX: event.clientX, clientY: event.clientY });
                                }}
                                onPointerEnter={(event) => {
                                    syncTarget(card.id, { clientX: event.clientX, clientY: event.clientY });
                                }}
                            >
                                <span className={`mb-[8px] inline-flex rounded-[6px] px-[6px] py-[2px] text-[10px] font-extrabold ${tagClass}`}>{card.tag}</span>
                                <p className="text-[15px] font-semibold leading-[1.35] text-[#191f28]">{card.title}</p>
                            </button>
                        );
                    })}
                </div>
            </div>

            <TargetHighlights
                hoveredTarget={hoveredTarget}
                selectedTarget={null}
                showHoverInspect={Boolean(hoveredTarget)}
                activeMarkerTarget={null}
            />
        </ReportSessionContext.Provider>
    );
}

function ElementInspectorScene() {
    const stateLocked = useDemoLocked();
    const probeEditable = useDemoProbeEditable();
    const { locale } = useReportPreferences();
    const baseSession = useReportSession();
    const buttonRef = useRef<HTMLButtonElement | null>(null);
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
    const initialValues = useMemo<PickProbeValues>(() => ({ ...DEMO_PROBE_VALUES, textContent: locale === "ko" ? "무료로 시작하기" : "Start for free" }), [locale]);
    const [values, setValues] = useState<PickProbeValues>(initialValues);
    const [open, setOpen] = useState(true);
    const [compareMode, setCompareMode] = useState<"before" | "after">("after");
    const [targetRect, setTargetRect] = useState<DOMRect>(DEMO_TARGET.rect);
    const [savedProbeEdits, setSavedProbeEdits] = useState<Record<string, SavedProbeEntry>>({});
    const lockedOpen = stateLocked ? true : open;
    const lockedCompare = probeEditable ? compareMode : "after";
    const lockedValues = probeEditable ? values : initialValues;
    const hasEdits = (Object.keys(lockedValues) as PickProbeFieldKey[]).some((key) => lockedValues[key] !== baselineValues[key]);
    const previewValues = lockedCompare === "before" ? baselineValues : lockedValues;
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

    const updatePickProbeValue = useCallback((key: PickProbeFieldKey, value: string) => {
        if (!probeEditable) {
            return;
        }
        setValues((current) => ({ ...current, [key]: value }));
        setCompareMode("after");
    }, [probeEditable]);
    const resetPickProbeValues = useCallback(() => {
        if (!probeEditable) {
            return;
        }
        setValues(baselineValues);
        setCompareMode("after");
        setSavedProbeEdits({});
    }, [baselineValues, probeEditable]);
    const closePickProbe = useCallback(() => {
        if (stateLocked) {
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
    }, [baselineValues, hasEdits, stateLocked, values]);
    const openPickProbe = useCallback(() => {
        if (stateLocked) {
            return;
        }
        setSavedProbeEdits({});
        setOpen(true);
    }, [stateLocked]);

    const selectedTarget = useMemo<TargetSnapshot>(
        () => ({
            ...DEMO_TARGET,
            rect: targetRect,
            boxStyle: {
                display: "flex",
                padding: previewValues.padding,
                margin: previewValues.margin,
                borderRadius: "10px",
            },
        }),
        [previewValues.margin, previewValues.padding, targetRect],
    );

    const session = useMemo<ReportSessionValue>(
        () => ({
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
            setPickProbeCompareMode: probeEditable ? setCompareMode : () => undefined,
            updatePickProbeValue,
            resetPickProbeValues,
            closePickProbe,
        }),
        [baseSession, closePickProbe, hasEdits, lockedCompare, lockedOpen, lockedValues, probeEditable, resetPickProbeValues, savedProbeEdits, selectedTarget, updatePickProbeValue],
    );

    return (
        <ReportSessionContext.Provider value={session}>
            <div className="grid h-full w-full grid-cols-[minmax(200px,1fr)_320px] gap-[14px] p-[12px]">
                <div className="relative flex min-h-0 items-center justify-center overflow-visible">
                    <button
                        ref={buttonRef}
                        type="button"
                        data-report-id={DEMO_TARGET.reportIdAttribute ?? "checkout-actions"}
                        style={previewStyle}
                        onClick={openPickProbe}
                        className="min-h-[34px] outline-none"
                    >
                        <span>{previewValues.textContent}</span>
                        <span aria-hidden="true">→</span>
                    </button>
                </div>
                <div className="relative min-h-0">
                    <ProbeTooltip embedded />
                </div>
            </div>
            <TargetHighlights
                hoveredTarget={null}
                selectedTarget={selectedTarget}
                contextMenuTarget={lockedOpen ? selectedTarget : null}
                showPickProbeCompare={lockedOpen && hasEdits}
                activeMarkerTarget={null}
            />
            <PickTargetSavedBadges />
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
                <button
                    type="button"
                    className="rounded-[8px] bg-[#3182f6] px-[12px] py-[7px] text-[12px] font-bold text-white"
                >
                    {isKorean ? "로그인" : "Sign in"}
                </button>
            </div>
            <div className="grid grid-cols-2 gap-[12px] py-[18px]">
                <div className="rounded-[12px] bg-[#f2f4f6] p-[14px]">
                    <p className="text-[12px] text-[#8b95a1]">KOSPI</p>
                    <strong className="mt-[6px] block text-[18px]">6,792.12</strong>
                    <span className="text-[12px] text-[#f04452]">+5.45%</span>
                </div>
                <div className="rounded-[12px] bg-[#f2f4f6] p-[14px]">
                    <p className="text-[12px] text-[#8b95a1]">NASDAQ</p>
                    <strong className="mt-[6px] block text-[18px]">26,331.09</strong>
                    <span className="text-[12px] text-[#3182f6]">-0.59%</span>
                </div>
            </div>
            <p className="mb-[10px] text-[14px] font-bold">{isKorean ? "실시간 종목" : "Live market"}</p>
            {DEMO_STOCK_NAMES.map((name, index) => (
                <div
                    key={name}
                    className="flex items-center border-t border-[#f2f4f6] py-[11px] text-[12px]"
                >
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
            <MobilePreviewWindow
                embedded
                embeddedContent={<DemoMobileContent />}
            />
        </div>
    );
}

function FeedbackThreadScene() {
    const session = useReportSession();
    const openedRef = useRef(false);
    const report = DEMO_FEATURED_REPORTS[0];

    useEffect(() => {
        if (openedRef.current) {
            return;
        }

        openedRef.current = true;
        session.openReplyComposer(report);
    }, [report, session]);

    return (
        <div className="flex h-full items-center justify-center py-[20px]">
            <FeedbackWindow
                report={report}
                anchor={{ left: 0, top: 0 }}
                isFocused
                embedded
            />
        </div>
    );
}

function NotificationsScene() {
    const locked = useDemoLocked();
    const { locale } = useReportPreferences();
    const baseSession = useReportSession();
    const [notifications, setNotifications] = useState<NotificationItem[]>(() => createDemoNotifications(locale));

    useEffect(() => {
        setNotifications(createDemoNotifications(locale));
    }, [locale]);

    const markNotificationRead = useCallback((id: string) => {
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
    const dismissNotification = useCallback((id: string) => {
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
    const runNotificationAction = useCallback((item: NotificationItem, action: NotificationActionId) => {
        if (locked) {
            return;
        }
        setNotifications((current) =>
            current.map((entry) => {
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
            }),
        );
    }, [locked]);
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
            runNotificationAction,
        }),
        [baseSession, clearNotifications, dismissNotification, markAllNotificationsRead, markNotificationRead, notifications, runNotificationAction],
    );

    return (
        <ReportSessionContext.Provider value={session}>
            <div className="relative h-full w-full overflow-hidden rounded-[16px] bg-[linear-gradient(160deg,#1c1f24_0%,#2a3038_55%,#171a1f_100%)]">
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
            return <PanelScene initialTab="route-details" />;
        case "network-monitor":
            return <PanelScene initialTab="api-flow" />;
        case "feedback-list":
            return <PanelScene initialTab="feedback-list" visibleTabs={LIST_PANEL_TABS} />;
        case "memo-list":
            return (
                <PanelScene
                    initialTab="memo-list"
                    visibleTabs={MEMO_PANEL_TABS}
                />
            );
        case "page-brief":
            return <PanelScene initialTab="page-brief" visibleTabs={BRIEF_PANEL_TABS} />;
        case "my-tasks":
            return <PanelScene initialTab="my-tasks" visibleTabs={TASK_PANEL_TABS} />;
        case "project-health":
            return <PanelScene initialTab="project-health" visibleTabs={HEALTH_PANEL_TABS} />;
        case "element-hover-inspect":
            return <ElementHoverInspectScene />;
        case "element-inspector":
            return <ElementInspectorScene />;
        case "device-preview":
            return <DevicePreviewScene />;
        case "feedback-thread":
            return <FeedbackThreadScene />;
        case "settings":
            return <PanelScene initialTab="settings" />;
        case "settings-customization":
            return (
                <PanelScene
                    initialTab="settings"
                    settingsInitialCategory="appearance"
                />
            );
        case "settings-marker":
            return (
                <PanelScene
                    initialTab="settings"
                    settingsInitialCategory="appearance"
                    settingsInitialAppearanceSection="marker"
                />
            );
        case "notifications":
            return <NotificationsScene />;
    }
}
