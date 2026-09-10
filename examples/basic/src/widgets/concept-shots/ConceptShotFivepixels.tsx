import { useEffect, useMemo, useRef, type ReactNode } from "react";
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
import { TooltipLayer } from "@/surfaces/tooltip/TooltipLayer.js";
import { WindowLayer } from "@/surfaces/window/WindowLayer.js";

import type { ConceptShotSceneId } from "./conceptShotConfig";

type FeedbackSeed = {
    targetId: string;
    text: string;
    category: ReportFeedback["category"];
    status?: ReportFeedback["status"];
    assignee?: string;
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
};

const FEEDBACK_BY_SCENE: Record<ConceptShotSceneId, FeedbackSeed[]> = {
    checkout: [
        { targetId: "checkout-product-options", text: "Selected size is easy to miss after returning from the cart.", category: "suggestion", assignee: "Mina, Design" },
        { targetId: "checkout-payment-fields", text: "Card validation message overlaps the expiry field on narrow screens.", category: "problem", assignee: "Noah, Frontend" },
        { targetId: "checkout-shipping", text: "Can we explain why express shipping is preselected?", category: "question", assignee: "Jules, Product" },
        { targetId: "checkout-submit", text: "Change the CTA to ‘Complete secure payment’ and increase contrast.", category: "incident", assignee: "Mina, Design" },
        { targetId: "checkout-trust-note", text: "Return policy copy verified with Legal.", category: "suggestion", status: "resolved", assignee: "Jules, Product" },
    ],
    analytics: [
        { targetId: "analytics-revenue", text: "Revenue total differs from the billing export by 2.4%.", category: "problem", assignee: "Evan, Data" },
        { targetId: "analytics-chart", text: "The trend chart needs a comparison line for the previous period.", category: "suggestion", assignee: "Mina, Design" },
        { targetId: "analytics-date-filter", text: "Keep the selected range when navigating between reports.", category: "problem", assignee: "Noah, Frontend" },
        { targetId: "analytics-export", text: "Should export respect the active channel filters?", category: "question", assignee: "Jules, Product" },
        { targetId: "analytics-table", text: "Conversion values need tooltips explaining attribution windows.", category: "suggestion", assignee: "Evan, Data" },
    ],
    landing: [
        { targetId: "landing-hero-copy", text: "The headline wraps too early at common laptop widths.", category: "problem", assignee: "Noah, Frontend" },
        { targetId: "landing-primary-cta", text: "Test ‘Create your workspace’ against the current generic CTA.", category: "suggestion", assignee: "Mina, Design" },
        { targetId: "landing-proof", text: "Add one customer outcome before the logo wall.", category: "suggestion", assignee: "Jules, Product" },
        { targetId: "landing-pricing", text: "Does the price include guest collaborators?", category: "question", assignee: "Sora, Growth" },
    ],
    mobile: [
        { targetId: "mobile-header", text: "Increase the touch target around the profile control.", category: "suggestion", assignee: "Mina, Design" },
        { targetId: "mobile-balance", text: "Hide balance amount from the app switcher snapshot.", category: "incident", assignee: "Noah, Frontend" },
        { targetId: "mobile-quick-actions", text: "Quick actions clip at 320px and need a compact layout.", category: "problem", assignee: "Noah, Frontend" },
        { targetId: "mobile-chart", text: "Use the portfolio currency in the chart accessibility label.", category: "suggestion", assignee: "Mina, Design" },
        { targetId: "mobile-bottom-nav", text: "Active state contrast now passes AA.", category: "suggestion", status: "resolved", assignee: "Mina, Design" },
    ],
    incident: [
        { targetId: "incident-status", text: "Add the incident commander and next update time to this status.", category: "suggestion", assignee: "Jules, Product" },
        { targetId: "incident-latency", text: "P95 jumped immediately after the checkout-api deploy.", category: "incident", assignee: "Noah, Frontend" },
        { targetId: "incident-error-chart", text: "Correlate the 5xx spike with payment provider timeouts.", category: "problem", assignee: "Evan, Data" },
        { targetId: "incident-deploy", text: "Compare this revision with the last healthy deployment.", category: "suggestion", assignee: "Noah, Frontend" },
        { targetId: "incident-log-row", text: "Group repeated checkout failures by trace ID.", category: "suggestion", assignee: "Evan, Data" },
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

        return {
            id: reportId,
            pathname: PATHNAME,
            report_id: seed.targetId,
            report_type: "item",
            target_selector: `[data-report-id="${seed.targetId}"]`,
            cases,
            status: cases.every((caseItem) => caseItem.status === "resolved") ? "resolved" : "open",
            fc_number: 101 + index,
            category: seed.category,
            field_values: { message: `${cases.length} QA cases · mixed progress` },
            replies,
            reply_count: replies.length,
            latest_reply: replies[replies.length - 1] ?? null,
            position: {
                target: { x: 0.5, y: 0.5 },
                viewport: { x: 0.5, y: 0.5, width: 1440, height: 900 },
                scrollY: 0,
                anchor: { reportId: seed.targetId, reportType: "item", x: 0.72, y: 0.45 },
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

function ConceptShotRuntimeState({ activeReportId, locale, appearance }: { activeReportId: string; locale: ReportLocale; appearance: ReportAppearance }) {
    const initializedRef = useRef(false);
    const { setLocale, setPanelAppearance, setTooltipAppearance } = useReportPreferences();
    const { markers, mode, setHoveredMarkerId, toggleIssueMode } = useReportSession();

    useEffect(() => {
        setLocale(locale);
        setPanelAppearance(appearance);
        setTooltipAppearance(appearance);
        if (mode !== "view") {
            toggleIssueMode();
        }
    }, [appearance, locale, mode, setLocale, setPanelAppearance, setTooltipAppearance, toggleIssueMode]);

    useEffect(() => {
        if (initializedRef.current || !markers.some((marker) => marker.report.id === activeReportId)) {
            return;
        }

        const timer = window.setTimeout(() => {
            initializedRef.current = true;
            setHoveredMarkerId(activeReportId);
        }, 120);

        return () => window.clearTimeout(timer);
    }, [activeReportId, markers, setHoveredMarkerId]);

    return null;
}

function ConceptShotOverlay() {
    const { resolvedTooltipAppearance } = useReportPreferences();

    return (
        <ShadowReportRoot tooltipAppearance={resolvedTooltipAppearance}>
            <ThemeScope appearance={resolvedTooltipAppearance}>
                <TooltipLayer>
                    <MarkerLayer />
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
    children: ReactNode;
};

export function ConceptShotFivepixels({ scene, activeTargetId, locale, appearance, children }: ConceptShotFivepixelsProps) {
    const reports = useMemo(() => createReports(scene), [scene]);
    const adapter = useMemo(() => createConceptAdapter(reports), [reports]);
    const activeReportId = reports.find((report) => report.report_id === activeTargetId)?.id ?? reports[0]?.id;

    if (!activeReportId) {
        return children;
    }

    return (
        <ReportProvider
            project={{ id: `fivepixels-concept-${scene}`, env: "STAGED", version: "0.2.28" }}
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
            {children}
            <ConceptShotRuntimeState activeReportId={activeReportId} locale={locale} appearance={appearance} />
            <ConceptShotOverlay />
        </ReportProvider>
    );
}
