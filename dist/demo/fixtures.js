const DEMO_PATHNAME = "/demo-showcase";
const CREATED_AT = "2026-09-01T09:00:00.000Z";
const UPDATED_AT = "2026-09-03T09:00:00.000Z";
function hoursAgoIso(hours) {
    return new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
}
function daysAgoAtHourIso(daysAgo, hour) {
    const date = new Date();
    date.setHours(hour, 15, 0, 0);
    date.setDate(date.getDate() - daysAgo);
    return date.toISOString();
}
export const DEMO_AUTHORS = [
    { id: "demo-user", name: "김상준", department: "Product", role: "admin", isActive: true },
    { id: "demo-reviewer", name: "김지윤", department: "Design", role: "member", isActive: true },
    { id: "demo-dev", name: "박시완", department: "Engineering", role: "member", isActive: true },
];
function reply(partial) {
    return {
        comment_id: partial.comment_id ?? "demo-feedback-1",
        ...partial,
    };
}
const STATUS_SAMPLES = [
    {
        id: "demo-feedback-1",
        category: "suggestion",
        status: "open",
        text: "결제 버튼 문구를 더 명확하게 바꿔주세요.",
        replyStatus: "suggested",
        assignee: "김지윤",
        author: "김상준",
        authorId: "demo-user",
        createdAt: hoursAgoIso(2),
    },
    {
        id: "demo-feedback-2",
        category: "problem",
        status: "open",
        text: "필터 해제 후 결과가 초기화됩니다.",
        author: "김상준",
        authorId: "demo-user",
        createdAt: hoursAgoIso(4),
    },
    {
        id: "demo-feedback-3",
        category: "question",
        status: "open",
        text: "빈 상태 안내 문구가 필요할까요?",
        replyStatus: "additional_question",
        author: "김지윤",
        authorId: "demo-reviewer",
        createdAt: hoursAgoIso(5),
        assignee: "김상준",
    },
    {
        id: "demo-feedback-4",
        category: "incident",
        status: "open",
        text: "모바일에서 결제 CTA가 잘립니다.",
        replyStatus: "found_error",
        assignee: "박시완",
        author: "김상준",
        authorId: "demo-user",
        createdAt: hoursAgoIso(7),
    },
    {
        id: "demo-feedback-5",
        category: "suggestion",
        status: "open",
        text: "로딩 스피너 타이밍을 앞당겨 주세요.",
        replyStatus: "recheck_requested",
        author: "김지윤",
        authorId: "demo-reviewer",
        createdAt: hoursAgoIso(9),
    },
    {
        id: "demo-feedback-6",
        category: "suggestion",
        status: "open",
        text: "담당자를 프론트 팀으로 전환합니다.",
        replyStatus: "assignee_assigned",
        assignee: "김상준",
        author: "김지윤",
        authorId: "demo-reviewer",
        createdAt: daysAgoAtHourIso(0, 11),
    },
    {
        id: "demo-feedback-7",
        category: "problem",
        status: "open",
        text: "검수 후 담당을 디자인으로 넘깁니다.",
        replyStatus: "assignee_transferred",
        assignee: "김지윤",
        author: "김상준",
        authorId: "demo-user",
        createdAt: daysAgoAtHourIso(0, 14),
    },
    {
        id: "demo-feedback-8",
        category: "suggestion",
        status: "git_issued",
        text: "GitHub Issue로 승격된 접근성 개선 건입니다.",
        author: "김상준",
        authorId: "demo-user",
        createdAt: daysAgoAtHourIso(0, 16),
    },
    {
        id: "demo-feedback-9",
        category: "memo",
        status: "open",
        text: "히어로 CTA 카피 후보를 메모해 둡니다.",
        author: "김상준",
        authorId: "demo-user",
        createdAt: daysAgoAtHourIso(1, 10),
    },
    {
        id: "demo-feedback-10",
        category: "suggestion",
        status: "resolved",
        text: "어제 반영된 여백 조정 요청입니다.",
        replyStatus: "resolved",
        author: "김지윤",
        authorId: "demo-reviewer",
        createdAt: daysAgoAtHourIso(1, 13),
    },
    {
        id: "demo-feedback-11",
        category: "problem",
        status: "open",
        text: "어제 발견된 네트워크 타임아웃 이슈입니다.",
        replyStatus: "found_error",
        assignee: "박시완",
        author: "김상준",
        authorId: "demo-user",
        createdAt: daysAgoAtHourIso(1, 15),
    },
    {
        id: "demo-feedback-12",
        category: "question",
        status: "open",
        text: "어제 남긴 확인 요청입니다.",
        replyStatus: "suggested",
        assignee: "김상준",
        author: "김지윤",
        authorId: "demo-reviewer",
        createdAt: daysAgoAtHourIso(1, 18),
    },
];
function buildReportFromSample(sample, index, idOverride) {
    const id = idOverride ?? sample.id;
    const replies = sample.replyStatus
        ? [
            reply({
                id: `demo-reply-${id}`,
                comment_id: id,
                message: sample.replyStatus === "resolved" ? "반영 완료했습니다." : "확인 후 답변드립니다.",
                created_at: sample.createdAt,
                status: sample.replyStatus,
                case_ids: [`demo-case-${id}`],
                author_type: "manager",
                author_name: sample.author === "김상준" ? "김지윤" : "김상준",
            }),
        ]
        : [];
    return {
        id,
        pathname: DEMO_PATHNAME,
        report_id: `demo-target-${index + 1}`,
        report_type: index % 2 === 0 ? "item" : "group",
        target_selector: `[data-report-id="demo-target-${index + 1}"]`,
        cases: [
            {
                id: `demo-case-${id}`,
                text: sample.text,
                status: sample.status === "resolved" ? "resolved" : "open",
                assignee_name: sample.assignee,
                created_at: sample.createdAt,
                updated_at: sample.createdAt,
            },
        ],
        status: sample.status,
        fc_number: 24 + index,
        category: sample.category,
        field_values: index === 0 ? { priority: "high", verified: true } : {},
        replies,
        reply_count: replies.length,
        latest_reply: replies[0],
        position: {
            target: { x: 0.18 + (index % 6) * 0.12, y: 0.28 + Math.floor(index / 6) * 0.18 },
            viewport: { x: 0.18, y: 0.28, width: 1440, height: 900 },
            scrollY: 0,
            anchor: { reportId: `demo-target-${index + 1}`, reportType: index % 2 === 0 ? "item" : "group", x: 0.5, y: 0.5 },
        },
        created_at: sample.createdAt,
        environment: "STAGED",
        app_version: "0.2.25",
        author_id: sample.authorId,
        author_name: sample.author,
    };
}
/** 리스트/툴팁용 대표 케이스 (짧은 목록) */
export const DEMO_FEATURED_REPORTS = STATUS_SAMPLES.map((sample, index) => buildReportFromSample(sample, index));
/** 패널 Today/Yesterday·스파크라인용 0~50 분포 */
const ACTIVITY_VOLUME = [
    { reportStatus: "open", today: 28, yesterday: 21 },
    { replyStatus: "additional_question", reportStatus: "open", today: 11, yesterday: 17 },
    { replyStatus: "suggested", reportStatus: "open", today: 36, yesterday: 29 },
    { replyStatus: "found_error", reportStatus: "open", today: 7, yesterday: 14 },
    { replyStatus: "recheck_requested", reportStatus: "open", today: 19, yesterday: 9 },
    { replyStatus: "assignee_assigned", reportStatus: "open", today: 24, yesterday: 31 },
    { replyStatus: "assignee_transferred", reportStatus: "open", today: 5, yesterday: 12 },
    { reportStatus: "git_issued", today: 16, yesterday: 22 },
    { replyStatus: "resolved", reportStatus: "resolved", today: 43, yesterday: 38 },
];
const ACTIVITY_TEMPLATES = STATUS_SAMPLES;
function pickHour(index, daysAgo, seed) {
    const nowHour = new Date().getHours();
    const hour = (seed + index * 3) % 24;
    if (daysAgo === 0 && hour > nowHour) {
        return Math.max(0, nowHour - (index % Math.max(1, nowHour + 1)));
    }
    return hour;
}
function buildActivityReports(featured) {
    const generated = [];
    let serial = featured.length;
    ACTIVITY_VOLUME.forEach((volume, volumeIndex) => {
        const template = ACTIVITY_TEMPLATES[volumeIndex % ACTIVITY_TEMPLATES.length];
        const days = [
            { daysAgo: 0, count: volume.today },
            { daysAgo: 1, count: volume.yesterday },
        ];
        for (const { daysAgo, count } of days) {
            for (let i = 0; i < count; i += 1) {
                const hour = pickHour(i, daysAgo, volumeIndex * 7 + daysAgo * 11);
                const createdAt = daysAgoAtHourIso(daysAgo, hour);
                const id = `demo-activity-${volumeIndex}-${daysAgo}-${i}`;
                generated.push(buildReportFromSample({
                    ...template,
                    id,
                    status: volume.reportStatus,
                    replyStatus: volume.replyStatus,
                    text: template.text,
                    createdAt,
                    assignee: template.assignee,
                }, serial, id));
                serial += 1;
            }
        }
    });
    return [...featured, ...generated];
}
/** 패널 수치·활동용 전체 리포트 (대표 + 활동 벌크) */
export const DEMO_REPORTS = buildActivityReports(DEMO_FEATURED_REPORTS);
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
        {
            id: "demo-draft-case-1",
            text: "결제 계속하기 문구로 바꾸고, 모바일에서도 버튼이 잘리지 않게 확인해주세요.",
            status: "open",
            created_at: CREATED_AT,
            updated_at: CREATED_AT,
        },
    ],
    category: "suggestion",
    fieldValues: { priority: "high" },
};
export const DEMO_MEMO_DRAFT = {
    ...DEMO_DRAFT,
    category: "memo",
    fieldValues: {},
    cases: [
        {
            id: "demo-memo-draft-case-1",
            text: "히어로 CTA는 ‘무료로 시작’보다 ‘둘러보기’가 덜 부담스러울 듯. 카피 후보로만 남겨둠.",
            status: "open",
            created_at: CREATED_AT,
            updated_at: CREATED_AT,
        },
    ],
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
        timestamp: Date.now() - 12000,
        method: "GET",
        url: "https://api.fivepixels.dev/v1/feedback?pathname=%2Fcheckout",
        pathname: "/v1/feedback",
        queryParams: { pathname: "/checkout" },
        status: 200,
        ok: true,
        durationMs: 84,
        requestBody: null,
        responseBody: JSON.stringify({ items: [{ id: "demo-feedback-1", status: "open" }], total: 12 }, null, 2),
        errorMessage: null,
        failureKind: null,
    },
    {
        id: "demo-api-2",
        timestamp: Date.now() - 9000,
        method: "POST",
        url: "https://api.fivepixels.dev/v1/feedback",
        pathname: "/v1/feedback",
        queryParams: {},
        status: 201,
        ok: true,
        durationMs: 132,
        requestBody: JSON.stringify({ report_id: "checkout-actions", category: "suggestion" }, null, 2),
        responseBody: JSON.stringify({ id: "demo-feedback-13", status: "open" }, null, 2),
        errorMessage: null,
        failureKind: null,
    },
    {
        id: "demo-api-3",
        timestamp: Date.now() - 6000,
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
        timestamp: Date.now() - 3000,
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
    {
        id: "demo-api-5",
        timestamp: Date.now() - 1500,
        method: "GET",
        url: "https://api.fivepixels.dev/v1/notifications",
        pathname: "/v1/notifications",
        queryParams: {},
        status: 200,
        ok: true,
        durationMs: 61,
        requestBody: null,
        responseBody: JSON.stringify({ unread: 4 }, null, 2),
        errorMessage: null,
        failureKind: null,
    },
];
export function createDemoNotifications(locale) {
    const content = locale === "ko"
        ? [
            ["김지윤님이 회원님을 언급했습니다.", "결제 버튼 문구 변경안을 확인해주세요."],
            ["새로운 케이스가 배정되었습니다.", "모바일 버튼 간격을 확인해주세요."],
            ["케이스가 해결되었습니다.", "필터 상태 유지 요청이 해결 처리되었습니다."],
            ["원본이 사라진 마커", "원본이 사라진 마커가 감지되었어요, 숨길까요?"],
            ["API 오류", "GET /v1/feedback · 500 · 842ms"],
            ["모달 마커 감지", "모달 마커가 감지되었어요, 숨길까요?"],
            ["UI Edit 적용 중", "현재 UI Edit 모드가 적용 중입니다. 초기화하거나 변경을 되돌릴 수 있어요."],
        ]
        : [
            ["Jiyoon mentioned you.", "Please review the updated checkout button copy."],
            ["A new case was assigned to you.", "Please check the mobile button spacing."],
            ["A case was resolved.", "The filter state request has been resolved."],
            ["Hidden marker detected", "A marker whose source element disappeared was detected. Hide it?"],
            ["API error", "GET /v1/feedback · 500 · 842ms"],
            ["Modal marker detected", "A modal marker was detected. Hide it?"],
            ["UI Edit in progress", "UI Edit changes are applied. Reset or undo them from here."],
        ];
    return [
        { id: "demo-notification-1", type: "user_mention", title: content[0][0], body: content[0][1], createdAt: UPDATED_AT, read: false, payload: { reportId: "demo-feedback-1", caseId: "demo-case-1" } },
        { id: "demo-notification-2", type: "case_assigned", title: content[1][0], body: content[1][1], createdAt: CREATED_AT, read: false, payload: { reportId: "demo-feedback-1", caseId: "demo-case-2" } },
        { id: "demo-notification-3", type: "case_resolved", title: content[2][0], body: content[2][1], createdAt: CREATED_AT, read: true, payload: { reportId: "demo-feedback-2" } },
        {
            id: "status:element_missing:hidden",
            type: "element_missing",
            title: content[3][0],
            body: content[3][1],
            createdAt: UPDATED_AT,
            read: false,
            payload: { detachedKind: "hidden", markersVisible: true },
        },
        { id: "demo-notification-5", type: "api_error", title: content[4][0], body: content[4][1], createdAt: CREATED_AT, read: false, payload: { apiFlowEntryId: "demo-api-1" } },
        {
            id: "status:modal_marker",
            type: "modal_marker",
            title: content[5][0],
            body: content[5][1],
            createdAt: UPDATED_AT,
            read: false,
            payload: { detachedKind: "modal", markersVisible: true },
        },
        {
            id: "status:probe_edit",
            type: "probe_edit",
            title: content[6][0],
            body: content[6][1],
            createdAt: CREATED_AT,
            read: false,
            payload: { canUndo: true, canRedo: false },
        },
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
            list: async (feedbackId, caseId) => (findReport(feedbackId)?.replies ?? []).filter((replyItem) => replyItem.case_ids.includes(caseId)),
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
    "memo-composer": { width: 430, height: 260 },
    "panel-overview": { width: 390, height: 560 },
    "network-monitor": { width: 430, height: 540 },
    "feedback-list": { width: 390, height: 560 },
    "memo-list": { width: 390, height: 520 },
    "page-brief": { width: 390, height: 560 },
    "my-tasks": { width: 390, height: 560 },
    "project-health": { width: 390, height: 560 },
    "element-hover-inspect": { width: 720, height: 480 },
    "element-inspector": { width: 680, height: 480 },
    "device-preview": { width: 420, height: 650 },
    "feedback-thread": { width: 680, height: 520 },
    settings: { width: 390, height: 620 },
    "settings-customization": { width: 390, height: 620 },
    "settings-marker": { width: 390, height: 620 },
    notifications: { width: 400, height: 420 },
};
//# sourceMappingURL=fixtures.js.map