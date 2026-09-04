const DEMO_PATHNAME = "/demo-showcase";
const CREATED_AT = "2026-09-01T09:00:00.000Z";
const UPDATED_AT = "2026-09-03T09:00:00.000Z";
export const DEMO_AUTHORS = [
    { id: "demo-user", name: "김상준", department: "Product", role: "admin", isActive: true },
    { id: "demo-reviewer", name: "김지윤", department: "Design", role: "member", isActive: true },
];
const DEMO_REPLIES = [
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
export const DEMO_REPORTS = [
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
    ...["problem", "question", "incident", "suggestion", "memo"].map((category, index) => ({
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
export const DEMO_DRAFT = {
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
};
export const DEMO_TARGET = {
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
export const DEMO_PROBE_VALUES = {
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
export const DEMO_API_FLOW_ENTRIES = [
    {
        id: "demo-api-1",
        timestamp: Date.parse(UPDATED_AT),
        method: "GET",
        url: "https://api.fivepixels.dev/v1/feedback?pathname=%2Fcheckout",
        pathname: "/v1/feedback",
        queryParams: { pathname: "/checkout" },
        status: 200,
        ok: true,
        durationMs: 84,
        requestBody: null,
        responseBody: JSON.stringify({ items: [{ id: "demo-feedback-1", status: "open" }], total: 6 }, null, 2),
        errorMessage: null,
        failureKind: null,
    },
    {
        id: "demo-api-2",
        timestamp: Date.parse(UPDATED_AT) + 1200,
        method: "POST",
        url: "https://api.fivepixels.dev/v1/feedback",
        pathname: "/v1/feedback",
        queryParams: {},
        status: 201,
        ok: true,
        durationMs: 132,
        requestBody: JSON.stringify({ report_id: "checkout-actions", category: "suggestion" }, null, 2),
        responseBody: JSON.stringify({ id: "demo-feedback-7", status: "open" }, null, 2),
        errorMessage: null,
        failureKind: null,
    },
    {
        id: "demo-api-3",
        timestamp: Date.parse(UPDATED_AT) + 2400,
        method: "PATCH",
        url: "https://api.fivepixels.dev/v1/feedback/demo-feedback-1",
        pathname: "/v1/feedback/demo-feedback-1",
        queryParams: {},
        status: 422,
        ok: false,
        durationMs: 246,
        requestBody: JSON.stringify({ status: "resolved" }, null, 2),
        responseBody: JSON.stringify({ message: "A reviewer confirmation is required." }, null, 2),
        errorMessage: "Request failed with status 422",
        failureKind: "http",
    },
    {
        id: "demo-api-4",
        timestamp: Date.parse(UPDATED_AT) + 3600,
        method: "GET",
        url: "https://api.fivepixels.dev/v1/members",
        pathname: "/v1/members",
        queryParams: {},
        status: null,
        ok: false,
        durationMs: 3000,
        requestBody: null,
        responseBody: null,
        errorMessage: "Network request timed out.",
        failureKind: "network",
    },
];
export function createDemoNotifications(locale) {
    const content = locale === "ko"
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
export function createDemoAdapter() {
    let reports = structuredClone(DEMO_REPORTS);
    const findReport = (id) => reports.find((report) => report.id === id);
    return {
        markers: {
            list: async ({ pathname }) => reports.filter((report) => report.pathname === pathname),
        },
        feedback: {
            create: async (payload) => {
                const created = { ...payload, id: `demo-feedback-${reports.length + 1}`, created_at: new Date().toISOString() };
                reports = [...reports, created];
                return created;
            },
            get: async (id) => findReport(id) ?? reports[0],
            update: async (id, payload) => {
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
                const created = { ...payload, id: `demo-reply-${Date.now()}`, comment_id: feedbackId, case_ids: [caseId], created_at: new Date().toISOString() };
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
export const DEMO_SCENE_SIZE = {
    "marker-tooltip": { width: 390, height: 230 },
    "feedback-composer": { width: 430, height: 300 },
    "memo-composer": { width: 430, height: 230 },
    "panel-overview": { width: 390, height: 220 },
    "network-monitor": { width: 430, height: 540 },
    "memo-list": { width: 390, height: 520 },
    "element-inspector": { width: 380, height: 540 },
    "device-preview": { width: 420, height: 650 },
    "feedback-thread": { width: 680, height: 520 },
    settings: { width: 390, height: 620 },
    "settings-customization": { width: 390, height: 620 },
    notifications: { width: 440, height: 520 },
};
//# sourceMappingURL=fixtures.js.map