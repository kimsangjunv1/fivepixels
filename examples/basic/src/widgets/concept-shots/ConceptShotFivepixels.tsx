import { useEffect, useLayoutEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent, type ReactNode } from "react";
import {
    ReportProvider,
    useReportPreferences,
    useReportSession,
    type FivePixelsAdapter,
    type ReportAppearance,
    type ReportCase,
    type ReportFeedback,
    type ReportLocale,
    type ReportReply,
} from "@fivepixels-js/react";
import { ShadowReportRoot } from "@/core/ShadowReportRoot.js";
import { ThemeScope } from "@/core/ThemeScope.js";
import { MarkerLayer } from "@/surfaces/marker/MarkerLayer.js";
import { DraftMarker } from "@/surfaces/marker/DraftMarker.js";
import { Panel } from "@/surfaces/panel/Panel.js";
import { DraftTooltip } from "@/surfaces/tooltip/DraftTooltip.js";
import { TooltipLayer } from "@/surfaces/tooltip/TooltipLayer.js";
import { WindowLayer } from "@/surfaces/window/WindowLayer.js";

import type { ConceptShotSceneId } from "./conceptShotConfig";

type FeedbackSeed = {
    targetId: string;
    text: string;
    category: ReportFeedback["category"];
    status?: ReportFeedback["status"];
    assignee?: string;
    /** Normalized pin inside the target (human-ish, not dead-center). */
    pin?: { x: number; y: number };
};

const CREATED_AT = "2026-09-09T01:30:00.000Z";
const PATHNAME = "/concept-shots";
const QA_AUTHOR = { id: "concept-qa", name: "Sora, QA" } as const;
const ASSIGNEES = ["Noah, Frontend", "Mina, Design", "Jules, Product", "Evan, Data"] as const;
const CASE_CONTEXTS = [
    "Primary flow",
    "Laptop · 1280px",
    "Mobile · 390px",
    "Dark mode",
    "Keyboard navigation",
    "Safari",
    "Slow network",
    "Localization",
] as const;
const CASE_COUNTS_BY_SCENE: Record<ConceptShotSceneId, number[]> = {
    checkout: [6, 3, 5, 8, 1],
    analytics: [8, 4, 6, 2, 7],
    landing: [5, 2, 7, 1],
    mobile: [7, 4, 6, 3, 8],
    incident: [8, 5, 1, 6, 3],
    agent: [5, 3, 6, 2, 4],
};

const FEEDBACK_BY_SCENE: Record<ConceptShotSceneId, FeedbackSeed[]> = {
    checkout: [
        { targetId: "checkout-brand", text: "Keep the Northstar wordmark tighter to the top-left capture edge.", category: "suggestion", assignee: "Mina, Design", pin: { x: 0.22, y: 0.48 } },
        { targetId: "checkout-title", text: "Headline hierarchy feels soft next to the secure-checkout label.", category: "suggestion", assignee: "Mina, Design", pin: { x: 0.34, y: 0.62 } },
        { targetId: "checkout-product", text: "Product row needs clearer size/color summary for reviewers.", category: "problem", assignee: "Jules, Product", pin: { x: 0.18, y: 0.4 } },
        { targetId: "checkout-product-options", text: "Selected size is easy to miss after returning from the cart.", category: "suggestion", assignee: "Mina, Design", pin: { x: 0.71, y: 0.55 } },
        { targetId: "checkout-payment-fields", text: "Card validation message overlaps the expiry field on narrow screens.", category: "problem", assignee: "Noah, Frontend", pin: { x: 0.28, y: 0.32 } },
    ],
    analytics: [
        { targetId: "analytics-revenue", text: "Revenue total differs from the billing export by 2.4%.", category: "problem", assignee: "Evan, Data", pin: { x: 0.24, y: 0.38 } },
        { targetId: "analytics-chart", text: "The trend chart needs a comparison line for the previous period.", category: "suggestion", assignee: "Mina, Design", pin: { x: 0.62, y: 0.44 } },
        { targetId: "analytics-date-filter", text: "Keep the selected range when navigating between reports.", category: "problem", assignee: "Noah, Frontend", pin: { x: 0.7, y: 0.5 } },
        { targetId: "analytics-export", text: "Should export respect the active channel filters?", category: "question", assignee: "Jules, Product", pin: { x: 0.55, y: 0.42 } },
        { targetId: "analytics-table", text: "Conversion values need tooltips explaining attribution windows.", category: "suggestion", assignee: "Evan, Data", pin: { x: 0.3, y: 0.28 } },
    ],
    landing: [
        { targetId: "landing-hero-copy", text: "The headline wraps too early at common laptop widths.", category: "problem", assignee: "Noah, Frontend", pin: { x: 0.26, y: 0.36 } },
        { targetId: "landing-primary-cta", text: "Test ‘Create your workspace’ against the current generic CTA.", category: "suggestion", assignee: "Mina, Design", pin: { x: 0.42, y: 0.58 } },
        { targetId: "landing-proof", text: "Add one customer outcome before the logo wall.", category: "suggestion", assignee: "Jules, Product", pin: { x: 0.2, y: 0.45 } },
        { targetId: "landing-pricing", text: "Does the price include guest collaborators?", category: "question", assignee: "Sora, Growth", pin: { x: 0.68, y: 0.4 } },
    ],
    mobile: [
        { targetId: "mobile-header", text: "Increase the touch target around the profile control.", category: "suggestion", assignee: "Mina, Design", pin: { x: 0.78, y: 0.5 } },
        { targetId: "mobile-balance", text: "Hide balance amount from the app switcher snapshot.", category: "incident", assignee: "Noah, Frontend", pin: { x: 0.32, y: 0.42 } },
        { targetId: "mobile-quick-actions", text: "Quick actions clip at 320px and need a compact layout.", category: "problem", assignee: "Noah, Frontend", pin: { x: 0.22, y: 0.55 } },
        { targetId: "mobile-chart", text: "Use the portfolio currency in the chart accessibility label.", category: "suggestion", assignee: "Mina, Design", pin: { x: 0.58, y: 0.35 } },
        { targetId: "mobile-bottom-nav", text: "Active state contrast now passes AA.", category: "suggestion", status: "resolved", assignee: "Mina, Design", pin: { x: 0.18, y: 0.48 } },
    ],
    incident: [
        { targetId: "incident-status", text: "Add the incident commander and next update time to this status.", category: "suggestion", assignee: "Jules, Product", pin: { x: 0.64, y: 0.48 } },
        { targetId: "incident-latency", text: "P95 jumped immediately after the checkout-api deploy.", category: "incident", assignee: "Noah, Frontend", pin: { x: 0.3, y: 0.4 } },
        { targetId: "incident-error-chart", text: "Correlate the 5xx spike with payment provider timeouts.", category: "problem", assignee: "Evan, Data", pin: { x: 0.48, y: 0.3 } },
        { targetId: "incident-deploy", text: "Compare this revision with the last healthy deployment.", category: "suggestion", assignee: "Noah, Frontend", pin: { x: 0.26, y: 0.36 } },
        { targetId: "incident-log-row", text: "Group repeated checkout failures by trace ID.", category: "suggestion", assignee: "Evan, Data", pin: { x: 0.2, y: 0.25 } },
    ],
    agent: [
        { targetId: "agent-thought", text: "Thought duration should open the reasoning trail on first click.", category: "suggestion", assignee: "Mina, Design", pin: { x: 0.2, y: 0.55 } },
        { targetId: "agent-source-docs", text: "Docs card needs a last-synced timestamp for reviewers.", category: "suggestion", assignee: "Jules, Product", pin: { x: 0.28, y: 0.34 } },
        { targetId: "agent-source-hubspot", text: "HubSpot ownership label is easy to miss next to the title.", category: "problem", assignee: "Jules, Product", pin: { x: 0.72, y: 0.3 } },
        { targetId: "agent-lede", text: "Inline citations obscure the end of the opening sentence.", category: "problem", assignee: "Noah, Frontend", pin: { x: 0.38, y: 0.42 } },
        { targetId: "agent-summary", text: "Executive summary heading needs a share action for Slack updates.", category: "question", assignee: "Jules, Product", pin: { x: 0.24, y: 0.58 } },
    ],
};

type CaseProgress = "review_requested" | "unassigned" | "assigned" | "question" | "suggested" | "changes_requested" | "resolved" | "transferred_review";

const CASE_PROGRESS: CaseProgress[] = [
    "review_requested",
    "unassigned",
    "assigned",
    "question",
    "suggested",
    "changes_requested",
    "resolved",
    "transferred_review",
];

function timelineAt(reportIndex: number, caseIndex: number, step: number) {
    const date = new Date("2026-09-02T09:00:00.000Z");

    date.setUTCHours(date.getUTCHours() + (reportIndex * 8 + caseIndex) * 3 + step);
    return date.toISOString();
}

function createReply(
    reportId: string,
    caseId: string,
    step: number,
    status: ReportReply["status"],
    message: string,
    authorName: string,
    reportIndex: number,
    caseIndex: number,
    authorType: NonNullable<ReportReply["author_type"]> = "manager",
): ReportReply {
    return {
        id: `${reportId}-${caseId}-${status}-${step}`,
        message,
        status,
        case_ids: [caseId],
        author_type: authorType,
        author_name: authorName,
        created_at: timelineAt(reportIndex, caseIndex, step),
    };
}

function createCaseTimeline(
    seed: FeedbackSeed,
    reportId: string,
    reportIndex: number,
    caseIndex: number,
): { caseItem: ReportCase; replies: ReportReply[] } {
    const caseId = `${reportId}-case-${caseIndex + 1}`;
    const progress = seed.status === "resolved" ? "resolved" : CASE_PROGRESS[(caseIndex + reportIndex) % CASE_PROGRESS.length];
    const assignee = seed.assignee ?? ASSIGNEES[(reportIndex + caseIndex) % ASSIGNEES.length];
    const previousAssignee = ASSIGNEES.find((candidate) => candidate !== assignee) ?? ASSIGNEES[0];
    const assigned = (step = 1, name = assignee) =>
        createReply(reportId, caseId, step, "assignee_assigned", `${name} clicked ‘Assign to me’.`, name, reportIndex, caseIndex);
    const reviewRequested = (step: number, name = assignee) =>
        createReply(reportId, caseId, step, "recheck_requested", "The fix is deployed. QA review requested.", name, reportIndex, caseIndex);
    let replies: ReportReply[] = [];

    switch (progress) {
        case "assigned":
            replies = [assigned()];
            break;
        case "question":
            replies = [
                assigned(),
                createReply(reportId, caseId, 2, "additional_question", "Could QA confirm the affected browser and breakpoint?", assignee, reportIndex, caseIndex),
            ];
            break;
        case "suggested":
            replies = [
                assigned(),
                createReply(reportId, caseId, 2, "suggested", "I’ve shared an implementation approach before making the change.", assignee, reportIndex, caseIndex),
            ];
            break;
        case "review_requested":
            replies = [assigned(), reviewRequested(2)];
            break;
        case "changes_requested":
            replies = [
                assigned(),
                reviewRequested(2),
                createReply(reportId, caseId, 3, "found_error", "QA found the issue still reproduces in the secondary flow.", QA_AUTHOR.name, reportIndex, caseIndex, "user"),
            ];
            break;
        case "resolved":
            replies = [
                assigned(),
                reviewRequested(2),
                createReply(reportId, caseId, 3, "resolved", "QA verified the fix and closed this case.", QA_AUTHOR.name, reportIndex, caseIndex, "user"),
            ];
            break;
        case "transferred_review":
            replies = [
                assigned(1, previousAssignee),
                createReply(reportId, caseId, 2, "assignee_transferred", `${assignee} took over this case.`, assignee, reportIndex, caseIndex),
                reviewRequested(3),
            ];
            break;
        case "unassigned":
            break;
    }

    const createdAt = timelineAt(reportIndex, caseIndex, 0);

    return {
        caseItem: {
            id: caseId,
            text: caseIndex === 0 ? seed.text : `${CASE_CONTEXTS[caseIndex]} — ${seed.text}`,
            status: progress === "resolved" ? "resolved" : "open",
            assignee_name: progress === "unassigned" ? null : assignee,
            previous_assignee_name: progress === "transferred_review" ? previousAssignee : null,
            created_at: createdAt,
            updated_at: replies[replies.length - 1]?.created_at ?? createdAt,
        },
        replies,
    };
}

function createReports(scene: ConceptShotSceneId): ReportFeedback[] {
    return FEEDBACK_BY_SCENE[scene].map((seed, index) => {
        const reportId = `concept-${scene}-${index + 1}`;
        const timelines = Array.from({ length: CASE_COUNTS_BY_SCENE[scene][index] ?? 1 }, (_, caseIndex) =>
            createCaseTimeline(seed, reportId, index, caseIndex),
        );
        const cases = timelines.map(({ caseItem }) => caseItem);
        const replies = timelines.flatMap((timeline) => timeline.replies).sort((left, right) => left.created_at.localeCompare(right.created_at));
        const pin = seed.pin ?? { x: 0.32 + ((index * 17) % 37) / 100, y: 0.28 + ((index * 23) % 41) / 100 };

        return {
            id: reportId,
            pathname: PATHNAME,
            report_id: seed.targetId,
            report_type: "item",
            target_selector: `[data-fp-id="${seed.targetId}"]`,
            cases,
            status: cases.every((caseItem) => caseItem.status === "resolved") ? "resolved" : "open",
            fc_number: 101 + index,
            category: seed.category,
            field_values: { message: `${cases.length} QA cases · mixed progress` },
            replies,
            reply_count: replies.length,
            latest_reply: replies[replies.length - 1] ?? null,
            position: {
                target: pin,
                viewport: { x: 0.5, y: 0.5, width: 1440, height: 900 },
                scrollY: 0,
                anchor: { reportId: seed.targetId, reportType: "item", x: pin.x, y: pin.y },
            },
            created_at: CREATED_AT,
            environment: "STAGED",
            app_version: "0.2.28",
            author_id: QA_AUTHOR.id,
            author_name: QA_AUTHOR.name,
        };
    });
}

function createConceptAdapter(reports: ReportFeedback[]): FivePixelsAdapter {
    return {
        markers: { list: async ({ pathname }) => reports.filter((report) => report.pathname === pathname) },
        feedback: {
            create: async () => reports[0],
            get: async (id) => reports.find((report) => report.id === id) ?? reports[0],
            update: async (id) => reports.find((report) => report.id === id) ?? reports[0],
        },
        members: {
            list: async () => [
                { id: QA_AUTHOR.id, name: QA_AUTHOR.name, department: "QA", role: "admin", isActive: true },
                { id: "concept-frontend", name: "Noah, Frontend", department: "Engineering", role: "member", isActive: true },
                { id: "concept-design", name: "Mina, Design", department: "Design", role: "member", isActive: true },
                { id: "concept-product", name: "Jules, Product", department: "Product", role: "member", isActive: true },
                { id: "concept-data", name: "Evan, Data", department: "Data", role: "member", isActive: true },
                { id: "concept-growth", name: "Sora, Growth", department: "Growth", role: "member", isActive: true },
            ],
        },
    };
}

function ConceptShotRuntimeState({
    activeReportId,
    locale,
    appearance,
    showMarkers,
}: {
    activeReportId: string;
    locale: ReportLocale;
    appearance: ReportAppearance;
    showMarkers: boolean;
}) {
    const { setLocale, setPanelAppearance, setTooltipAppearance } = useReportPreferences();
    const { markers, mode, setHoveredMarkerId, toggleIssueMode } = useReportSession();
    const hasActiveMarker = markers.some((marker) => marker.report.id === activeReportId);

    useEffect(() => {
        setLocale(locale);
        setPanelAppearance(appearance);
        setTooltipAppearance(appearance);
        // Only boot into view from idle — never yank the user out of report (add feedback) mode.
        if (mode === "idle") {
            toggleIssueMode();
        }
    }, [appearance, locale, mode, setLocale, setPanelAppearance, setTooltipAppearance, toggleIssueMode]);

    // Keep the active marker tooltip locked open for capture while in view mode.
    useEffect(() => {
        if (!showMarkers || !hasActiveMarker || mode !== "view") {
            if (mode !== "view") {
                setHoveredMarkerId(null);
            }
            return;
        }

        const lockHover = () => {
            setHoveredMarkerId(activeReportId);
        };

        lockHover();
        const bootTimer = window.setTimeout(lockHover, 160);
        const keepAlive = window.setInterval(lockHover, 350);

        return () => {
            window.clearTimeout(bootTimer);
            window.clearInterval(keepAlive);
        };
    }, [activeReportId, hasActiveMarker, mode, setHoveredMarkerId, showMarkers]);

    return null;
}

function clampPanelPosition(
    left: number,
    top: number,
    frame: { width: number; height: number },
    panelWidth: number,
    panelHeight: number,
) {
    const maxLeft = Math.max(12, frame.width - panelWidth - 12);
    const maxTop = Math.max(12, frame.height - panelHeight - 12);
    return {
        left: Math.min(Math.max(12, left), maxLeft),
        top: Math.min(Math.max(12, top), maxTop),
    };
}

function isConceptPanelDragBlocked(target: EventTarget | null) {
    return target instanceof Element && Boolean(target.closest("button, a, input, select, textarea, [role='button'], [role='menuitem'], [role='switch']"));
}

function ConceptShotStagePanel() {
    const wrapRef = useRef<HTMLDivElement | null>(null);
    const dragRef = useRef<{ pointerId: number; offsetX: number; offsetY: number } | null>(null);
    const [frame, setFrame] = useState<{ top: number; left: number; width: number; height: number } | null>(null);
    const [position, setPosition] = useState<{ left: number; top: number } | null>(null);
    const [dragging, setDragging] = useState(false);

    useLayoutEffect(() => {
        const stage = document.querySelector<HTMLElement>(".concept-shots__stage");
        if (!stage) {
            return;
        }

        const sync = () => {
            const rect = stage.getBoundingClientRect();
            const nextFrame = { top: rect.top, left: rect.left, width: rect.width, height: rect.height };
            setFrame(nextFrame);

            const wrap = wrapRef.current;
            if (!wrap) {
                return;
            }

            setPosition((current) => {
                if (!current) {
                    return current;
                }
                return clampPanelPosition(current.left, current.top, nextFrame, wrap.offsetWidth, wrap.offsetHeight);
            });
        };

        sync();
        const observer = new ResizeObserver(sync);
        observer.observe(stage);
        window.addEventListener("resize", sync);
        window.addEventListener("scroll", sync, true);

        return () => {
            observer.disconnect();
            window.removeEventListener("resize", sync);
            window.removeEventListener("scroll", sync, true);
        };
    }, []);

    useEffect(() => {
        const handlePointerMove = (event: PointerEvent) => {
            const drag = dragRef.current;
            const wrap = wrapRef.current;
            if (!drag || !frame || !wrap || event.pointerId !== drag.pointerId) {
                return;
            }

            const next = clampPanelPosition(
                event.clientX - frame.left - drag.offsetX,
                event.clientY - frame.top - drag.offsetY,
                frame,
                wrap.offsetWidth,
                wrap.offsetHeight,
            );
            setPosition(next);
        };

        const handlePointerUp = (event: PointerEvent) => {
            const drag = dragRef.current;
            if (!drag || event.pointerId !== drag.pointerId) {
                return;
            }
            dragRef.current = null;
            setDragging(false);
        };

        window.addEventListener("pointermove", handlePointerMove);
        window.addEventListener("pointerup", handlePointerUp);
        window.addEventListener("pointercancel", handlePointerUp);
        return () => {
            window.removeEventListener("pointermove", handlePointerMove);
            window.removeEventListener("pointerup", handlePointerUp);
            window.removeEventListener("pointercancel", handlePointerUp);
        };
    }, [frame]);

    if (!frame) {
        return null;
    }

    const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
        if (event.button !== 0 || !frame || isConceptPanelDragBlocked(event.target)) {
            return;
        }

        const header = event.target instanceof Element ? event.target.closest(".cursor-move") : null;
        if (!header) {
            return;
        }

        const wrap = wrapRef.current;
        if (!wrap) {
            return;
        }

        const rect = wrap.getBoundingClientRect();
        event.preventDefault();
        event.stopPropagation();
        dragRef.current = {
            pointerId: event.pointerId,
            offsetX: event.clientX - rect.left,
            offsetY: event.clientY - rect.top,
        };
        setDragging(true);
        setPosition({
            left: rect.left - frame.left,
            top: rect.top - frame.top,
        });
    };

    return (
        <div
            className="pointer-events-none fixed z-[1000000]"
            style={{ top: frame.top, left: frame.left, width: frame.width, height: frame.height }}
        >
            <div
                ref={wrapRef}
                className={`pointer-events-auto absolute max-h-[calc(100%-24px)] overflow-auto rounded-[16px] shadow-[var(--adaptive-popup-shadow)] ${dragging ? "cursor-grabbing" : ""}`}
                style={
                    position
                        ? { left: position.left, top: position.top, right: "auto", bottom: "auto" }
                        : { right: 20, bottom: 20, left: "auto", top: "auto" }
                }
                onPointerDown={handlePointerDown}
            >
                <Panel embedded />
            </div>
        </div>
    );
}

function ConceptShotOverlay({ showMarkers }: { showMarkers: boolean }) {
    const { resolvedPanelAppearance, resolvedTooltipAppearance } = useReportPreferences();

    return (
        <ShadowReportRoot tooltipAppearance={resolvedTooltipAppearance}>
            <ThemeScope appearance={resolvedPanelAppearance}>
                <ConceptShotStagePanel />
            </ThemeScope>
            <ThemeScope appearance={resolvedTooltipAppearance}>
                <TooltipLayer>
                    {showMarkers ? <MarkerLayer /> : null}
                    <DraftMarker />
                    <DraftTooltip />
                    <WindowLayer />
                </TooltipLayer>
            </ThemeScope>
        </ShadowReportRoot>
    );
}

type ConceptShotFivepixelsProps = {
    scene: ConceptShotSceneId;
    activeTargetId: string;
    locale: ReportLocale;
    appearance: ReportAppearance;
    showElement?: boolean;
    children: ReactNode;
};

export function ConceptShotFivepixels({
    scene,
    activeTargetId,
    locale,
    appearance,
    showElement = true,
    children,
}: ConceptShotFivepixelsProps) {
    const reports = useMemo(() => createReports(scene), [scene]);
    const adapter = useMemo(() => createConceptAdapter(reports), [reports]);
    const activeReportId = reports.find((report) => report.report_id === activeTargetId)?.id ?? reports[0]?.id;

    if (!activeReportId) {
        return showElement ? children : null;
    }

    return (
        <ReportProvider
            project={{ id: "fivepixels-basic-example", env: "STAGED", version: "1.0.0" }}
            ui={{ locale, panelAppearance: appearance, tooltipAppearance: appearance, showFeedbackList: true }}
            visibility={{ enabled: true, routeKey: PATHNAME }}
            team={{
                user: { id: QA_AUTHOR.id, name: QA_AUTHOR.name },
                reviewers: [
                    { id: QA_AUTHOR.id, name: QA_AUTHOR.name, department: "QA", role: "admin", isActive: true },
                    { id: "concept-frontend", name: "Noah, Frontend", department: "Engineering", role: "member", isActive: true },
                    { id: "concept-design", name: "Mina, Design", department: "Design", role: "member", isActive: true },
                    { id: "concept-product", name: "Jules, Product", department: "Product", role: "member", isActive: true },
                    { id: "concept-data", name: "Evan, Data", department: "Data", role: "member", isActive: true },
                ],
            }}
            mode="presentation"
            sync="api"
            require={{ authLogin: false, reviewerKey: false }}
            adapter={adapter}
            networkMonitor={false}
        >
            {showElement ? children : null}
            <ConceptShotRuntimeState activeReportId={activeReportId} locale={locale} appearance={appearance} showMarkers={showElement} />
            <ConceptShotOverlay showMarkers={showElement} />
        </ReportProvider>
    );
}
