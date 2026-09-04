import type { FivePixelsAdapter } from "@/shared/types/adapter.js";
import type { NotificationItem } from "@/shared/types/notification.js";
import type { DraftReport, PickProbeValues, TargetSnapshot } from "@/shared/types/report-ui.js";
import type { CreateReportFeedbackPayload, ReportAuthor, ReportFeedback, ReportReply, UpdateReportFeedbackPayload } from "@/shared/types/report.js";
import type { FivePixelsDemoScene } from "./types.js";

const DEMO_PATHNAME = "/demo-showcase";
const CREATED_AT = "2026-09-01T09:00:00.000Z";
const UPDATED_AT = "2026-09-03T09:00:00.000Z";

export const DEMO_AUTHORS: ReportAuthor[] = [
    { id: "demo-user", name: "김상준", department: "Product", role: "admin", isActive: true },
    { id: "demo-reviewer", name: "김지윤", department: "Design", role: "member", isActive: true },
];

const DEMO_REPLIES: ReportReply[] = [
    {
        id: "demo-reply-1",
        comment_id: "demo-feedback-1",
        message: "‘결제 계속하기’로 변경하고 모바일 화면도 확인했습니다.",
        created_at: UPDATED_AT,
        status: "recheck_requested",
        case_ids: ["demo-case-1"],
        author_type: "manager",
        author_name: "김지윤",
    },
];

export const DEMO_REPORTS: ReportFeedback[] = [
    {
        id: "demo-feedback-1",
        pathname: DEMO_PATHNAME,
        report_id: "checkout-actions",
        report_type: "item",
        target_selector: '[data-report-id="checkout-actions"]',
        cases: [
            {
                id: "demo-case-1",
                text: "결제 버튼 문구를 더 명확하게 바꿔주세요.",
                status: "open",
                assignee_name: "김지윤",
                created_at: CREATED_AT,
                updated_at: UPDATED_AT,
            },
            {
                id: "demo-case-2",
                text: "모바일에서 버튼 사이 간격도 확인해주세요.",
                status: "resolved",
                created_at: CREATED_AT,
                updated_at: UPDATED_AT,
            },
        ],
        status: "open",
        fc_number: 24,
        category: "suggestion",
        field_values: { priority: "high", verified: true },
        replies: DEMO_REPLIES,
        reply_count: DEMO_REPLIES.length,
        latest_reply: DEMO_REPLIES[0],
        position: {
            target: { x: 0.74, y: 0.52 },
            viewport: { x: 0.74, y: 0.52, width: 1440, height: 900 },
            scrollY: 0,
            anchor: { reportId: "checkout-actions", reportType: "item", x: 0.5, y: 0.5 },
        },
        created_at: CREATED_AT,
        environment: "STAGED",
        app_version: "0.2.23",
        author_id: "demo-user",
        author_name: "김상준",
    },
    ...(["problem", "question", "incident", "suggestion", "memo"] as const).map((category, index): ReportFeedback => ({
        id: `demo-feedback-${index + 2}`,
        pathname: DEMO_PATHNAME,
        report_id: `demo-target-${index + 2}`,
        report_type: index % 2 === 0 ? "item" : "group",
        cases: [
            {
                id: `demo-case-${index + 3}`,
                text: ["필터 해제 후 결과를 유지해주세요.", "빈 상태 안내가 필요합니다.", "모바일 정렬을 확인해주세요.", "로딩 표시를 조금 더 빠르게 보여주세요.", "기획 메모를 남겨둡니다."][index],
                status: index === 3 ? "resolved" : "open",
                created_at: CREATED_AT,
                updated_at: UPDATED_AT,
            },
        ],
        status: index === 3 ? "resolved" : "open",
        fc_number: 25 + index,
        category,
        field_values: {},
        replies: [],
        reply_count: index % 2,
        position: {
            target: { x: 0.18 + index * 0.12, y: 0.32 + index * 0.08 },
            viewport: { x: 0.18 + index * 0.12, y: 0.32 + index * 0.08, width: 1440, height: 900 },
            scrollY: 0,
            anchor: { reportId: `demo-target-${index + 2}`, reportType: index % 2 === 0 ? "item" : "group", x: 0.5, y: 0.5 },
        },
        created_at: CREATED_AT,
        environment: "STAGED",
        app_version: "0.2.23",
        author_id: index % 2 === 0 ? "demo-user" : "demo-reviewer",
        author_name: index % 2 === 0 ? "김상준" : "김지윤",
    })),
];

export const DEMO_DRAFT: DraftReport = {
    clientX: 210,
    clientY: 150,
    xRatio: 0.5,
    yRatio: 0.5,
    elementXRatio: 0.5,
    elementYRatio: 0.5,
    anchorReportId: "checkout-actions",
    anchorReportType: "item",
    anchorXRatio: 0.5,
    anchorYRatio: 0.5,
    scrollY: 0,
    documentY: 150,
    reportId: "checkout-actions",
    reportType: "item",
    targetSelector: '[data-report-id="checkout-actions"]',
    viewPath: [],
    suggestedReportId: "checkout-actions",
    cases: [
        { id: "demo-draft-case-1", text: "", status: "open", created_at: CREATED_AT, updated_at: CREATED_AT },
    ],
    category: "suggestion",
    fieldValues: {},
};

const DEMO_TARGET_RECT = {
    x: 24,
    y: 24,
    left: 24,
    top: 24,
    right: 344,
    bottom: 72,
    width: 320,
    height: 48,
    toJSON: () => ({ x: 24, y: 24, width: 320, height: 48 }),
} as DOMRect;

export const DEMO_TARGET: TargetSnapshot = {
    id: "checkout-actions",
    type: "item",
    rect: DEMO_TARGET_RECT,
    isTagged: true,
    targetSelector: '[data-report-id="checkout-actions"]',
    suggestedReportId: "checkout-actions",
    tagName: "div",
    reportIdAttribute: "checkout-actions",
    boxStyle: { display: "flex", padding: "8px 16px", margin: "0px", borderRadius: "10px" },
    fontStyle: { fontFamily: "Pretendard", fontSize: "14px", fontWeight: "600", lineHeight: "20px" },
};

export const DEMO_PROBE_VALUES: PickProbeValues = {
    textContent: "결제 계속하기",
    fontSize: "14px",
    padding: "8px 16px",
    margin: "0px",
    lineHeight: "20px",
    textColor: "#191f28",
    backgroundColor: "#ffffff",
    borderColor: "#e5e8eb",
    justifyContent: "space-between",
    alignItems: "center",
    flexDirection: "row",
    gap: "8px",
    gridColumnCount: "2",
    gridRowCount: "1",
};

export function createDemoNotifications(locale: "ko" | "en"): NotificationItem[] {
    const content =
        locale === "ko"
            ? [
                  ["김지윤님이 회원님을 언급했습니다.", "결제 버튼 문구 변경안을 확인해주세요."],
                  ["새로운 케이스가 배정되었습니다.", "모바일 버튼 간격을 확인해주세요."],
                  ["케이스가 해결되었습니다.", "필터 상태 유지 요청이 해결 처리되었습니다."],
              ]
            : [
                  ["Jiyoon mentioned you.", "Please review the updated checkout button copy."],
                  ["A new case was assigned to you.", "Please check the mobile button spacing."],
                  ["A case was resolved.", "The filter state request has been resolved."],
              ];

    return [
        { id: "demo-notification-1", type: "user_mention", title: content[0][0], body: content[0][1], createdAt: UPDATED_AT, read: false, payload: { reportId: "demo-feedback-1", caseId: "demo-case-1" } },
        { id: "demo-notification-2", type: "case_assigned", title: content[1][0], body: content[1][1], createdAt: CREATED_AT, read: false, payload: { reportId: "demo-feedback-1", caseId: "demo-case-2" } },
        { id: "demo-notification-3", type: "case_resolved", title: content[2][0], body: content[2][1], createdAt: CREATED_AT, read: true, payload: { reportId: "demo-feedback-2" } },
    ];
}

export function createDemoAdapter(): FivePixelsAdapter {
    let reports = structuredClone(DEMO_REPORTS);

    const findReport = (id: string) => reports.find((report) => report.id === id);

    return {
        markers: {
            list: async ({ pathname }) => reports.filter((report) => report.pathname === pathname),
        },
        feedback: {
            create: async (payload: CreateReportFeedbackPayload) => {
                const created: ReportFeedback = { ...payload, id: `demo-feedback-${reports.length + 1}`, created_at: new Date().toISOString() };
                reports = [...reports, created];
                return created;
            },
            get: async (id) => findReport(id) ?? reports[0],
            update: async (id: string, payload: UpdateReportFeedbackPayload) => {
                const current = findReport(id) ?? reports[0];
                const updated = { ...current, ...payload };
                reports = reports.map((report) => (report.id === id ? updated : report));
                return updated;
            },
            delete: async (id) => {
                reports = reports.filter((report) => report.id !== id);
            },
        },
        replies: {
            list: async (feedbackId, caseId) => (findReport(feedbackId)?.replies ?? []).filter((reply) => reply.case_ids.includes(caseId)),
            create: async (feedbackId, caseId, payload) => {
                const created: ReportReply = { ...payload, id: `demo-reply-${Date.now()}`, comment_id: feedbackId, case_ids: [caseId], created_at: new Date().toISOString() };
                const report = findReport(feedbackId);
                if (report) {
                    report.replies = [...(report.replies ?? []), created];
                    report.reply_count = report.replies.length;
                    report.latest_reply = created;
                }
                return created;
            },
        },
        members: { list: async () => DEMO_AUTHORS },
    };
}

export const DEMO_SCENE_SIZE: Record<FivePixelsDemoScene, { width: number; height: number }> = {
    "marker-tooltip": { width: 390, height: 230 },
    "feedback-composer": { width: 430, height: 300 },
    "panel-overview": { width: 390, height: 220 },
    "element-inspector": { width: 380, height: 540 },
    "device-preview": { width: 420, height: 650 },
    "feedback-thread": { width: 680, height: 520 },
    settings: { width: 390, height: 620 },
    notifications: { width: 440, height: 520 },
};
