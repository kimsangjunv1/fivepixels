import type { ReportFeedback } from "@/types/report.js";
import {
    FEED_PATHNAME,
    HOME_PATHNAME,
    INDICES_PATHNAME,
    SCREENER_PATHNAME,
    SIGNIN_PATHNAME,
} from "./reportProjectScope.js";
import {
    anchorPosition,
    buildSeedFeedback,
    createReportCase,
    daysAgo,
    hoursAgo,
    ISSUE_ROOT_PARENT_ID,
    seedFields,
    seedReply,
    SEED_TEAM,
    todayIso,
    type DemoSeedCatalogEntry,
} from "./seedShared.js";

const TEAM = SEED_TEAM;

function seedFor(pathname: string, id: string, overrides: Parameters<typeof buildSeedFeedback>[2]) {
    return buildSeedFeedback(id, pathname, overrides);
}

const WATCHLIST_MENTION = {
    id: "m_demo_watchlist",
    label: "관심종목",
    targetSelector: null,
    reportId: "demo-watchlist",
    suggestedReportId: null,
};

const SEARCH_MENTION = {
    id: "m_demo_search",
    label: "검색",
    targetSelector: null,
    reportId: "demo-invest-search",
    suggestedReportId: null,
};

const CHART_MENTION = {
    id: "m_demo_index_chart",
    label: "지수 차트",
    targetSelector: null,
    reportId: "demo-index-chart",
    suggestedReportId: null,
};

function createHomeSeeds(): ReportFeedback[] {
    const seed = (id: string, overrides: Parameters<typeof buildSeedFeedback>[2]) => seedFor(HOME_PATHNAME, id, overrides);
    const CASE = {
        wait: "home-case-wait",
        happy: "home-case-happy",
        denyApprove: "home-case-deny-approve",
        ask: "home-case-ask",
        confirm: "home-case-confirm",
        transfer: "home-case-transfer",
        mention: "home-case-mention",
        multiA: "home-case-multi-a",
        multiB: "home-case-multi-b",
        multiC: "home-case-multi-c",
    } as const;

    return [
        seed("home-seed-open-wait", {
            report_id: "demo-home-page",
            report_type: "group",
            cases: [createReportCase("홈 첫 화면에서 지수 카드와 종목 테이블 사이 여백이 시안보다 넓어요.", { id: CASE.wait })],
            field_values: seedFields("[대기] 답글 없음 · 초기 접수"),
            position: anchorPosition("demo-home-page", "group", 0, 0.18),
            created_at: todayIso(),
            author_id: "demo-user",
            author_name: TEAM.user,
        }),

        seed("home-seed-story-happy-path", {
            report_id: "demo-stock-table",
            report_type: "group",
            status: "resolved",
            cases: [
                createReportCase("종목 테이블 헤더가 스크롤 시 살짝 흔들려요.", {
                    id: CASE.happy,
                    status: "resolved",
                    assignee_name: TEAM.frontend,
                    previous_assignee_name: TEAM.qa,
                }),
            ],
            field_values: seedFields("[해피패스] 담당→질문→제안→승인", { isImportant: true }),
            replies: [
                seedReply("home-reply-happy-assigned", "담당자가 지정되었습니다.", daysAgo(6, 9), "assignee_assigned", {
                    case_ids: [CASE.happy],
                    author_type: "manager",
                    author_name: TEAM.qa,
                }),
                seedReply("home-reply-happy-transferred", "담당자가 변경되었습니다.", daysAgo(6, 11), "assignee_transferred", {
                    case_ids: [CASE.happy],
                    author_type: "manager",
                    author_name: TEAM.frontend,
                }),
                seedReply(
                    "home-reply-happy-q1",
                    "iOS Safari만인가요, 아니면 크롬 모바일도 같이 흔들리나요?",
                    daysAgo(5, 10),
                    "additional_question",
                    {
                        case_ids: [CASE.happy],
                        parent_reply_id: ISSUE_ROOT_PARENT_ID,
                        author_type: "manager",
                        author_name: TEAM.frontend,
                    },
                ),
                seedReply(
                    "home-reply-happy-a1",
                    "Safari/크롬 둘 다요. 특히 빠르게 스크롤할 때 더 티나요.",
                    daysAgo(5, 14),
                    "additional_question",
                    {
                        case_ids: [CASE.happy],
                        parent_reply_id: ISSUE_ROOT_PARENT_ID,
                        author_type: "user",
                        author_name: TEAM.user,
                    },
                ),
                seedReply(
                    "home-reply-happy-suggested",
                    "헤더에 sticky + will-change 정리해서 올렸어요. SE/Pixel에서 한 번 봐주세요.",
                    daysAgo(4, 12),
                    "suggested",
                    { case_ids: [CASE.happy], author_type: "manager", author_name: TEAM.frontend },
                ),
                seedReply(
                    "home-reply-happy-resolved",
                    "양쪽 기기에서 흔들림 없어요. 승인하고 해결 처리할게요.",
                    daysAgo(2, 16),
                    "resolved",
                    { case_ids: [CASE.happy], author_type: "manager", author_name: TEAM.qa },
                ),
            ],
            position: anchorPosition("demo-stock-table", "group", 220, 0.4),
            author_id: "demo-user",
            author_name: TEAM.user,
        }),

        seed("home-seed-story-deny-then-approve", {
            report_id: "demo-watchlist",
            report_type: "group",
            status: "resolved",
            cases: [
                createReportCase("관심종목 추가 버튼이 다크 모드에서 대비가 부족해요.", {
                    id: CASE.denyApprove,
                    status: "resolved",
                    assignee_name: TEAM.frontend,
                }),
            ],
            field_values: seedFields("[거절→승인] 제안 → 거절 → 재제안 → 해결"),
            replies: [
                seedReply("home-reply-deny-s1", "버튼 배경을 semantic.primary로 바꿨어요.", daysAgo(5, 10), "suggested", {
                    case_ids: [CASE.denyApprove],
                    author_type: "manager",
                    author_name: TEAM.frontend,
                }),
                seedReply(
                    "home-reply-deny-fe",
                    "다크 모드에서 아이콘이 아직도 회색이라 잘 안 보여요. 거절할게요.",
                    daysAgo(4, 12),
                    "found_error",
                    { case_ids: [CASE.denyApprove], author_type: "user", author_name: TEAM.qa },
                ),
                seedReply(
                    "home-reply-deny-s2",
                    "아이콘/라벨 모두 대비 토큰 맞춰서 다시 올렸어요.",
                    daysAgo(3, 11),
                    "suggested",
                    { case_ids: [CASE.denyApprove], author_type: "manager", author_name: TEAM.frontend },
                ),
                seedReply("home-reply-deny-resolved", "라이트/다크 둘 다 확인했어요. 승인합니다.", daysAgo(2, 14), "resolved", {
                    case_ids: [CASE.denyApprove],
                    author_type: "manager",
                    author_name: TEAM.qa,
                }),
            ],
            position: anchorPosition("demo-watchlist", "group", 80, 0.3),
        }),

        seed("home-seed-open-ask-pending", {
            report_id: "demo-invest-search",
            report_type: "item",
            cases: [
                createReportCase("검색 모달에서 최근 검색어가 두 줄로 깨져요.", {
                    id: CASE.ask,
                    assignee_name: TEAM.frontend,
                }),
            ],
            field_values: seedFields("[Ask] 추가 질문 대기"),
            replies: [
                seedReply("home-reply-ask-assigned", "담당자가 지정되었습니다.", daysAgo(2, 9), "assignee_assigned", {
                    case_ids: [CASE.ask],
                    author_type: "manager",
                    author_name: TEAM.qa,
                }),
                seedReply(
                    "home-reply-ask-q",
                    "최근 검색어를 한 줄 말줄임으로 할까요, 아니면 칩 높이만 늘릴까요?",
                    daysAgo(1, 15),
                    "additional_question",
                    {
                        case_ids: [CASE.ask],
                        parent_reply_id: ISSUE_ROOT_PARENT_ID,
                        author_type: "manager",
                        author_name: TEAM.frontend,
                    },
                ),
            ],
            position: anchorPosition("demo-invest-search", "item", 0, 0.12),
        }),

        seed("home-seed-open-confirm-pending", {
            report_id: "demo-stock-detail",
            report_type: "group",
            cases: [
                createReportCase("상세 패널 차트 로딩 스켈레톤이 실제 차트보다 낮아요.", {
                    id: CASE.confirm,
                    assignee_name: TEAM.qa,
                    previous_assignee_name: TEAM.frontend,
                }),
            ],
            field_values: seedFields("[Confirm] 확인 요청 대기"),
            replies: [
                seedReply(
                    "home-reply-confirm-suggested",
                    "스켈레톤 높이를 차트와 동일하게 맞춰 뒀어요. 확인 부탁드려요.",
                    hoursAgo(8),
                    "suggested",
                    { case_ids: [CASE.confirm], author_type: "manager", author_name: TEAM.frontend },
                ),
            ],
            position: anchorPosition("demo-stock-detail", "group", 260, 0.45),
        }),

        seed("home-seed-story-transfer-cross-talk", {
            report_id: "demo-ranking-filters",
            report_type: "group",
            cases: [
                createReportCase("실시간 정렬 옵션 변경 후 목록이 한 박자 늦게 갱신돼요.", {
                    id: CASE.transfer,
                    assignee_name: TEAM.backend,
                    previous_assignee_name: TEAM.frontend,
                }),
            ],
            field_values: seedFields("[이관·대화] 프론트→백엔드 교차 논의", { isBug: true }),
            replies: [
                seedReply("home-reply-xfer-assigned", "담당자가 지정되었습니다.", daysAgo(4, 9), "assignee_assigned", {
                    case_ids: [CASE.transfer],
                    author_type: "manager",
                    author_name: TEAM.frontend,
                }),
                seedReply("home-reply-xfer-transferred", "담당자가 변경되었습니다.", daysAgo(4, 10), "assignee_transferred", {
                    case_ids: [CASE.transfer],
                    author_type: "manager",
                    author_name: TEAM.backend,
                }),
                seedReply(
                    "home-reply-xfer-fe",
                    "프론트에서는 필터 변경 즉시 요청 쏘고 있어요. 응답이 늦게 오는 것 같아요.",
                    daysAgo(3, 11),
                    "additional_question",
                    {
                        case_ids: [CASE.transfer],
                        parent_reply_id: ISSUE_ROOT_PARENT_ID,
                        author_type: "manager",
                        author_name: TEAM.frontend,
                    },
                ),
                seedReply(
                    "home-reply-xfer-be",
                    "랭킹 API에 캐시 TTL이 3초라서 그럴 수 있어요. 필터 키 기준으로 무효화하도록 바꿀게요.",
                    daysAgo(3, 14),
                    "additional_question",
                    {
                        case_ids: [CASE.transfer],
                        parent_reply_id: ISSUE_ROOT_PARENT_ID,
                        author_type: "manager",
                        author_name: TEAM.backend,
                    },
                ),
                seedReply(
                    "home-reply-xfer-suggested",
                    "캐시 무효화 반영했습니다. QA에서 필터 전환 3회 연속으로 확인해 주세요.",
                    daysAgo(1, 12),
                    "suggested",
                    { case_ids: [CASE.transfer], author_type: "manager", author_name: TEAM.backend },
                ),
            ],
            position: anchorPosition("demo-ranking-filters", "group", 300, 0.5),
        }),

        seed("home-seed-open-with-mentions", {
            report_id: "demo-ai-intro",
            report_type: "item",
            cases: [
                createReportCase("AI 소개 버튼 옆에 @{m_demo_watchlist} 진입점이 겹쳐 보여요.", {
                    id: CASE.mention,
                    assignee_name: TEAM.frontend,
                    mentions: [WATCHLIST_MENTION],
                }),
            ],
            field_values: seedFields("[태그] 요소 멘션 포함"),
            replies: [
                seedReply(
                    "home-reply-mention-q",
                    "@{m_demo_search} 쪽 여백이랑 같이 보면 레이아웃이 더 명확할 것 같아요.",
                    daysAgo(1, 10),
                    "additional_question",
                    {
                        case_ids: [CASE.mention],
                        parent_reply_id: ISSUE_ROOT_PARENT_ID,
                        author_type: "manager",
                        author_name: TEAM.qa,
                        mentions: [SEARCH_MENTION],
                    },
                ),
            ],
            position: anchorPosition("demo-ai-intro", "item", 40, 0.2),
        }),

        seed("home-seed-open-multicase", {
            report_id: "demo-home-content-tabs",
            report_type: "group",
            cases: [
                createReportCase("탭 활성 밑줄이 한글 라벨보다 짧아요.", {
                    id: CASE.multiA,
                    status: "resolved",
                    assignee_name: TEAM.frontend,
                }),
                createReportCase("요약 접기 토글 포커스 링이 잘려요.", {
                    id: CASE.multiB,
                    assignee_name: TEAM.frontend,
                }),
                createReportCase("탭 전환 시 스크롤 위치가 초기화돼요.", {
                    id: CASE.multiC,
                    assignee_name: TEAM.backend,
                }),
            ],
            field_values: seedFields("[멀티케이스 · 3] 케이스별 다른 진행", { isImportant: true }),
            replies: [
                seedReply("home-reply-multi-a", "밑줄 너비 맞췄어요. 케이스 A 해결.", daysAgo(3, 12), "resolved", {
                    case_ids: [CASE.multiA],
                    author_type: "manager",
                    author_name: TEAM.qa,
                }),
                seedReply("home-reply-multi-b", "overflow visible로 포커스 링 보이게 했어요. 확인 부탁.", daysAgo(2, 11), "suggested", {
                    case_ids: [CASE.multiB],
                    author_type: "manager",
                    author_name: TEAM.frontend,
                }),
                seedReply("home-reply-multi-c", "스크롤 복원 로직이 아직 안 들어갔어요. 거절합니다.", daysAgo(1, 9), "found_error", {
                    case_ids: [CASE.multiC],
                    author_type: "user",
                    author_name: TEAM.qa,
                }),
            ],
            position: anchorPosition("demo-home-content-tabs", "group", 240, 0.42),
        }),
    ];
}

function createFeedSeeds(): ReportFeedback[] {
    const seed = (id: string, overrides: Parameters<typeof buildSeedFeedback>[2]) => seedFor(FEED_PATHNAME, id, overrides);
    const CASE = {
        denyOfDeny: "feed-case-deny-of-deny",
        stuck: "feed-case-stuck",
        longQa: "feed-case-long-qa",
        recheck: "feed-case-recheck",
        askCross: "feed-case-ask-cross",
        confirm: "feed-case-confirm",
        wait: "feed-case-wait",
    } as const;

    return [
        seed("feed-seed-open-wait", {
            report_id: "demo-feed-page",
            report_type: "group",
            cases: [createReportCase("피드 상단 탭과 의견 남기기 카드 간격이 시안보다 좁아요.", { id: CASE.wait })],
            field_values: seedFields("[대기] 초기 접수"),
            position: anchorPosition("demo-feed-page", "group", 0, 0.15),
            created_at: todayIso(),
            author_name: TEAM.user,
        }),

        seed("feed-seed-story-deny-of-deny", {
            report_id: "demo-feed-post-ai",
            report_type: "group",
            status: "resolved",
            cases: [
                createReportCase("AI 게시글 '더 보기' 펼침 후 이미지 비율이 깨져요.", {
                    id: CASE.denyOfDeny,
                    status: "resolved",
                    assignee_name: TEAM.frontend,
                }),
            ],
            field_values: seedFields("[거절의 거절] deny↔recheck 후 해결", { isBug: true }),
            replies: [
                seedReply("feed-reply-dod-s1", "이미지 aspect-ratio 고정했어요.", daysAgo(7, 9), "suggested", {
                    case_ids: [CASE.denyOfDeny],
                    author_type: "manager",
                    author_name: TEAM.frontend,
                }),
                seedReply("feed-reply-dod-f1", "펼친 상태에서 여전히 세로로 늘어나요. 거절.", daysAgo(6, 11), "found_error", {
                    case_ids: [CASE.denyOfDeny],
                    author_type: "user",
                    author_name: TEAM.qa,
                }),
                seedReply("feed-reply-dod-r1", "제 기기(390px)에서는 정상인데… 혹시 확대 설정인가요?", daysAgo(5, 13), "recheck_requested", {
                    case_ids: [CASE.denyOfDeny],
                    author_type: "manager",
                    author_name: TEAM.frontend,
                }),
                seedReply("feed-reply-dod-f2", "기본 배율에서도 재현돼요. 다시 거절합니다.", daysAgo(4, 10), "found_error", {
                    case_ids: [CASE.denyOfDeny],
                    author_type: "user",
                    author_name: TEAM.qa,
                }),
                seedReply("feed-reply-dod-s2", "펼침 상태에만 object-fit contain 적용했어요.", daysAgo(3, 12), "suggested", {
                    case_ids: [CASE.denyOfDeny],
                    author_type: "manager",
                    author_name: TEAM.frontend,
                }),
                seedReply("feed-reply-dod-resolved", "Safari/Android 확인 완료. 해결.", daysAgo(2, 15), "resolved", {
                    case_ids: [CASE.denyOfDeny],
                    author_type: "manager",
                    author_name: TEAM.qa,
                }),
            ],
            position: anchorPosition("demo-feed-post-ai", "group", 180, 0.4),
        }),

        seed("feed-seed-story-stuck-denied", {
            report_id: "demo-opinion-trigger",
            report_type: "item",
            cases: [
                createReportCase("의견 남기기 버튼이 키보드 올라오면 가려져요.", {
                    id: CASE.stuck,
                    assignee_name: TEAM.frontend,
                }),
            ],
            field_values: seedFields("[Denied 멈춤] found_error 대기", { isBug: true }),
            replies: [
                seedReply("feed-reply-stuck-s", "모달 하단 safe-area 패딩 넣었어요.", daysAgo(2, 10), "suggested", {
                    case_ids: [CASE.stuck],
                    author_type: "manager",
                    author_name: TEAM.frontend,
                }),
                seedReply(
                    "feed-reply-stuck-f",
                    "아이폰 SE에서 전송 버튼이 아직 키보드에 가려져요. 거절합니다.",
                    hoursAgo(5),
                    "found_error",
                    { case_ids: [CASE.stuck], author_type: "user", author_name: TEAM.qa },
                ),
            ],
            position: anchorPosition("demo-opinion-trigger", "item", 100, 0.28),
        }),

        seed("feed-seed-story-long-qa", {
            report_id: "demo-feed-actions-ai",
            report_type: "group",
            status: "resolved",
            cases: [
                createReportCase("좋아요/댓글 아이콘 간격이 시안과 달라요.", {
                    id: CASE.longQa,
                    status: "resolved",
                    assignee_name: TEAM.frontend,
                }),
            ],
            field_values: seedFields("[장문 Q&A] QA·프론트·백엔드 교차 질문"),
            replies: [
                seedReply(
                    "feed-reply-long-q1",
                    "간격이 터치 영역 때문인가요, 아니면 시각적 여백만 문제인가요?",
                    daysAgo(8, 9),
                    "additional_question",
                    {
                        case_ids: [CASE.longQa],
                        parent_reply_id: ISSUE_ROOT_PARENT_ID,
                        author_type: "manager",
                        author_name: TEAM.qa,
                    },
                ),
                seedReply(
                    "feed-reply-long-q2",
                    "좋아요 카운트 API가 늦게 오면 UI가 밀릴 수도 있어요. 응답 시간 로그 볼까요?",
                    daysAgo(8, 11),
                    "additional_question",
                    {
                        case_ids: [CASE.longQa],
                        parent_reply_id: ISSUE_ROOT_PARENT_ID,
                        author_type: "manager",
                        author_name: TEAM.backend,
                    },
                ),
                seedReply(
                    "feed-reply-long-a",
                    "시각적 간격만 문제예요. API는 정상이에요.",
                    daysAgo(7, 10),
                    "additional_question",
                    {
                        case_ids: [CASE.longQa],
                        parent_reply_id: ISSUE_ROOT_PARENT_ID,
                        author_type: "user",
                        author_name: TEAM.user,
                    },
                ),
                seedReply("feed-reply-long-s", "gap 12→8로 맞췄어요. 확인 부탁드려요.", daysAgo(6, 12), "suggested", {
                    case_ids: [CASE.longQa],
                    author_type: "manager",
                    author_name: TEAM.frontend,
                }),
                seedReply("feed-reply-long-resolved", "시안이랑 동일해요. 해결 처리.", daysAgo(3, 16), "resolved", {
                    case_ids: [CASE.longQa],
                    author_type: "manager",
                    author_name: TEAM.qa,
                }),
            ],
            position: anchorPosition("demo-feed-actions-ai", "group", 320, 0.55),
        }),

        seed("feed-seed-open-recheck", {
            report_id: "demo-feed-tab-뉴스",
            report_type: "item",
            cases: [
                createReportCase("뉴스 탭 활성 색이 브랜드 컬러와 달라 보여요.", {
                    id: CASE.recheck,
                    assignee_name: TEAM.frontend,
                }),
            ],
            field_values: seedFields("[오류 아님] recheck 대기"),
            replies: [
                seedReply("feed-reply-recheck-assigned", "담당자가 지정되었습니다.", daysAgo(2, 9), "assignee_assigned", {
                    case_ids: [CASE.recheck],
                    author_type: "manager",
                    author_name: TEAM.frontend,
                }),
                seedReply(
                    "feed-reply-recheck",
                    "뉴스 탭은 의도적으로 secondary 톤이에요. 오류 아닌 것 같아요.",
                    daysAgo(1, 14),
                    "recheck_requested",
                    { case_ids: [CASE.recheck], author_type: "manager", author_name: TEAM.frontend },
                ),
            ],
            position: anchorPosition("demo-feed-tab-뉴스", "item", 20, 0.12),
        }),

        seed("feed-seed-open-ask-cross", {
            report_id: "demo-feed-post-market",
            report_type: "group",
            cases: [
                createReportCase("커뮤니티 게시글 팔로우 상태가 새로고침 후 풀려요.", {
                    id: CASE.askCross,
                    assignee_name: TEAM.backend,
                    previous_assignee_name: TEAM.frontend,
                }),
            ],
            field_values: seedFields("[Ask · 교차] 프론트↔백엔드 질문"),
            replies: [
                seedReply("feed-reply-ask-xfer", "담당자가 변경되었습니다.", daysAgo(3, 10), "assignee_transferred", {
                    case_ids: [CASE.askCross],
                    author_type: "manager",
                    author_name: TEAM.backend,
                }),
                seedReply(
                    "feed-reply-ask-fe",
                    "프론트는 localStorage에 저장 중인데, 서버 팔로우 API랑 충돌하나요?",
                    daysAgo(2, 11),
                    "additional_question",
                    {
                        case_ids: [CASE.askCross],
                        parent_reply_id: ISSUE_ROOT_PARENT_ID,
                        author_type: "manager",
                        author_name: TEAM.frontend,
                    },
                ),
                seedReply(
                    "feed-reply-ask-be",
                    "맞아요. 서버 상태가 우선이라 로컬 캐시를 덮어쓰고 있어요. 동기화 순서 바꿀게요.",
                    daysAgo(1, 15),
                    "additional_question",
                    {
                        case_ids: [CASE.askCross],
                        parent_reply_id: ISSUE_ROOT_PARENT_ID,
                        author_type: "manager",
                        author_name: TEAM.backend,
                    },
                ),
            ],
            position: anchorPosition("demo-feed-post-market", "group", 480, 0.7),
        }),

        seed("feed-seed-open-confirm", {
            report_id: "demo-feed-tabs",
            report_type: "group",
            cases: [
                createReportCase("전체/뉴스 탭 전환 애니메이션이 끊겨 보여요.", {
                    id: CASE.confirm,
                    assignee_name: TEAM.frontend,
                }),
            ],
            field_values: seedFields("[Confirm] 제안 확인 대기"),
            replies: [
                seedReply(
                    "feed-reply-confirm",
                    "fade 대신 cross-fade로 바꿔 올렸어요. 한 번 봐주세요.",
                    hoursAgo(4),
                    "suggested",
                    { case_ids: [CASE.confirm], author_type: "manager", author_name: TEAM.frontend },
                ),
            ],
            position: anchorPosition("demo-feed-tabs", "group", 10, 0.1),
        }),
    ];
}

function createScreenerSeeds(): ReportFeedback[] {
    const seed = (id: string, overrides: Parameters<typeof buildSeedFeedback>[2]) => seedFor(SCREENER_PATHNAME, id, overrides);
    const CASE = {
        denyOpen: "screener-case-deny-open",
        confirm: "screener-case-confirm",
        transfer: "screener-case-transfer",
        multiA: "screener-case-a",
        multiB: "screener-case-b",
        multiC: "screener-case-c",
        multiD: "screener-case-d",
        wait: "screener-case-wait",
        stuckRecheck: "screener-case-recheck",
    } as const;

    return [
        seed("screener-seed-open-wait", {
            report_id: "demo-screener-page",
            report_type: "group",
            cases: [createReportCase("주식 골라보기 페이지 타이틀과 프리셋 카드 간격이 좁아요.", { id: CASE.wait })],
            field_values: seedFields("[대기] 초기 접수"),
            position: anchorPosition("demo-screener-page", "group", 0, 0.14),
            created_at: todayIso(),
            author_name: TEAM.user,
        }),

        seed("screener-seed-story-deny-of-deny-open", {
            report_id: "demo-create-screener",
            report_type: "item",
            cases: [
                createReportCase("'직접 만들기' 버튼 그림자가 잘려요.", {
                    id: CASE.denyOpen,
                    assignee_name: TEAM.frontend,
                }),
            ],
            field_values: seedFields("[거절의 거절 · open] recheck 후 재거절", { isBug: true }),
            replies: [
                seedReply("screener-reply-deny-s1", "부모 overflow를 visible로 바꿨어요.", daysAgo(4, 9), "suggested", {
                    case_ids: [CASE.denyOpen],
                    author_type: "manager",
                    author_name: TEAM.frontend,
                }),
                seedReply("screener-reply-deny-f1", "태블릿 가로 모드에서 여전히 잘려요.", daysAgo(3, 11), "found_error", {
                    case_ids: [CASE.denyOpen],
                    author_type: "user",
                    author_name: TEAM.qa,
                }),
                seedReply("screener-reply-deny-r1", "가로 모드는 지원 범위 밖이라 오류 아니에요.", daysAgo(2, 13), "recheck_requested", {
                    case_ids: [CASE.denyOpen],
                    author_type: "manager",
                    author_name: TEAM.frontend,
                }),
                seedReply("screener-reply-deny-f2", "제품 요구사항에 가로 모드 포함이에요. 다시 거절.", daysAgo(1, 10), "found_error", {
                    case_ids: [CASE.denyOpen],
                    author_type: "user",
                    author_name: TEAM.qa,
                }),
            ],
            position: anchorPosition("demo-create-screener", "item", 60, 0.22),
        }),

        seed("screener-seed-open-confirm", {
            report_id: "demo-screener-preset-0",
            report_type: "item",
            cases: [
                createReportCase("첫 번째 프리셋 카드 호버 테두리가 시안보다 두꺼워요.", {
                    id: CASE.confirm,
                    assignee_name: TEAM.frontend,
                }),
            ],
            field_values: seedFields("[Confirm] 확인 요청"),
            replies: [
                seedReply("screener-reply-confirm", "테두리 2px→1px로 조정했어요. 확인 부탁.", hoursAgo(6), "suggested", {
                    case_ids: [CASE.confirm],
                    author_type: "manager",
                    author_name: TEAM.frontend,
                }),
            ],
            position: anchorPosition("demo-screener-preset-0", "item", 140, 0.35),
        }),

        seed("screener-seed-story-transfer", {
            report_id: "demo-add-filter",
            report_type: "item",
            cases: [
                createReportCase("필터 추가 후 결과 건수가 서버 값과 안 맞아요.", {
                    id: CASE.transfer,
                    assignee_name: TEAM.backend,
                    previous_assignee_name: TEAM.frontend,
                }),
            ],
            field_values: seedFields("[이관] 프론트→백엔드", { isBug: true }),
            replies: [
                seedReply("screener-reply-xfer-fe", "담당자가 변경되었습니다.", daysAgo(3, 9), "assignee_transferred", {
                    case_ids: [CASE.transfer],
                    author_type: "manager",
                    author_name: TEAM.backend,
                }),
                seedReply(
                    "screener-reply-xfer-ask",
                    "프론트에서 보내는 필터 payload 형식 그대로인가요? industry 배열이 비어 있을 때 전체로 취급해야 해요.",
                    daysAgo(2, 12),
                    "additional_question",
                    {
                        case_ids: [CASE.transfer],
                        parent_reply_id: ISSUE_ROOT_PARENT_ID,
                        author_type: "manager",
                        author_name: TEAM.backend,
                    },
                ),
                seedReply(
                    "screener-reply-xfer-fe2",
                    "빈 배열이면 필드 자체를 빼고 있어요. 그 케이스를 서버에서 전체로 보면 됩니다.",
                    daysAgo(2, 15),
                    "additional_question",
                    {
                        case_ids: [CASE.transfer],
                        parent_reply_id: ISSUE_ROOT_PARENT_ID,
                        author_type: "manager",
                        author_name: TEAM.frontend,
                    },
                ),
                seedReply("screener-reply-xfer-s", "빈 필터=전체 로직 반영했어요. QA 확인 부탁.", daysAgo(1, 11), "suggested", {
                    case_ids: [CASE.transfer],
                    author_type: "manager",
                    author_name: TEAM.backend,
                }),
            ],
            position: anchorPosition("demo-add-filter", "item", 280, 0.48),
        }),

        seed("screener-seed-open-multicase", {
            report_id: "demo-screener-row-0",
            report_type: "item",
            cases: [
                createReportCase("첫 행 선택 하이라이트가 너무 연해요.", {
                    id: CASE.multiA,
                    status: "resolved",
                    assignee_name: TEAM.frontend,
                }),
                createReportCase("등락률 색상이 시안과 반대예요.", {
                    id: CASE.multiB,
                    assignee_name: TEAM.frontend,
                }),
                createReportCase("정렬 키가 한글 종목명에서 깨져요.", {
                    id: CASE.multiC,
                    assignee_name: TEAM.backend,
                }),
                createReportCase("행 호버 시 커서 포인터가 안 붙어요.", {
                    id: CASE.multiD,
                    assignee_name: TEAM.frontend,
                }),
            ],
            field_values: seedFields("[멀티케이스 · 4] 혼합 진행"),
            replies: [
                seedReply("screener-reply-m-a", "하이라이트 대비 올렸어요. A 해결.", daysAgo(3, 10), "resolved", {
                    case_ids: [CASE.multiA],
                    author_type: "manager",
                    author_name: TEAM.qa,
                }),
                seedReply("screener-reply-m-b", "등락 색상 토큰 교체했어요. 확인 부탁.", daysAgo(2, 11), "suggested", {
                    case_ids: [CASE.multiB],
                    author_type: "manager",
                    author_name: TEAM.frontend,
                }),
                seedReply("screener-reply-m-c", "아직 한글 collation 미적용이에요. 거절.", daysAgo(1, 9), "found_error", {
                    case_ids: [CASE.multiC],
                    author_type: "user",
                    author_name: TEAM.qa,
                }),
                seedReply("screener-reply-m-d", "cursor 스타일 어디 기준으로 맞출까요?", hoursAgo(3), "additional_question", {
                    case_ids: [CASE.multiD],
                    parent_reply_id: ISSUE_ROOT_PARENT_ID,
                    author_type: "manager",
                    author_name: TEAM.frontend,
                }),
            ],
            position: anchorPosition("demo-screener-row-0", "item", 360, 0.62),
        }),

        seed("screener-seed-open-recheck", {
            report_id: "demo-preset-tooltip",
            report_type: "item",
            cases: [
                createReportCase("프리셋 툴팁 화살표 위치가 어긋나 보여요.", {
                    id: CASE.stuckRecheck,
                    assignee_name: TEAM.frontend,
                }),
            ],
            field_values: seedFields("[recheck] 오류 아님 주장"),
            replies: [
                seedReply(
                    "screener-reply-recheck",
                    "호버 좌표 기준으로 의도된 위치예요. 오류 아닌 것 같습니다.",
                    daysAgo(1, 12),
                    "recheck_requested",
                    { case_ids: [CASE.stuckRecheck], author_type: "manager", author_name: TEAM.frontend },
                ),
            ],
            position: anchorPosition("demo-preset-tooltip", "item", 160, 0.38),
        }),
    ];
}

function createIndicesSeeds(): ReportFeedback[] {
    const seed = (id: string, overrides: Parameters<typeof buildSeedFeedback>[2]) => seedFor(INDICES_PATHNAME, id, overrides);
    const CASE = {
        happy: "indices-case-happy",
        ask: "indices-case-ask",
        denied: "indices-case-denied",
        multiA: "indices-case-a",
        multiB: "indices-case-b",
        mention: "indices-case-mention",
        wait: "indices-case-wait",
        confirm: "indices-case-confirm",
    } as const;

    return [
        seed("indices-seed-open-wait", {
            report_id: "demo-index-page",
            report_type: "group",
            cases: [createReportCase("지수 상세 헤더와 통계 카드 사이 간격이 시안보다 넓어요.", { id: CASE.wait })],
            field_values: seedFields("[대기] 초기 접수"),
            position: anchorPosition("demo-index-page", "group", 0, 0.12),
            created_at: todayIso(),
            author_name: TEAM.user,
        }),

        seed("indices-seed-story-happy-path", {
            report_id: "demo-index-chart",
            report_type: "group",
            status: "resolved",
            cases: [
                createReportCase("차트 기간 탭 전환 시 로딩 깜빡임이 있어요.", {
                    id: CASE.happy,
                    status: "resolved",
                    assignee_name: TEAM.frontend,
                    previous_assignee_name: TEAM.qa,
                }),
            ],
            field_values: seedFields("[해피패스] 담당→Ask→Confirm→해결"),
            replies: [
                seedReply("indices-reply-happy-assigned", "담당자가 지정되었습니다.", daysAgo(5, 9), "assignee_assigned", {
                    case_ids: [CASE.happy],
                    author_type: "manager",
                    author_name: TEAM.qa,
                }),
                seedReply(
                    "indices-reply-happy-q",
                    "깜빡임이 데이터 교체 때인가요, 아니면 탭 UI만인가요?",
                    daysAgo(4, 10),
                    "additional_question",
                    {
                        case_ids: [CASE.happy],
                        parent_reply_id: ISSUE_ROOT_PARENT_ID,
                        author_type: "manager",
                        author_name: TEAM.frontend,
                    },
                ),
                seedReply(
                    "indices-reply-happy-a",
                    "데이터 교체 때예요. 이전 차트가 잠깐 사라져요.",
                    daysAgo(4, 14),
                    "additional_question",
                    {
                        case_ids: [CASE.happy],
                        parent_reply_id: ISSUE_ROOT_PARENT_ID,
                        author_type: "user",
                        author_name: TEAM.qa,
                    },
                ),
                seedReply(
                    "indices-reply-happy-s",
                    "이전 프레임 유지하다가 새 데이터 오면 교체하도록 바꿨어요.",
                    daysAgo(3, 12),
                    "suggested",
                    { case_ids: [CASE.happy], author_type: "manager", author_name: TEAM.frontend },
                ),
                seedReply("indices-reply-happy-r", "깜빡임 없어요. 승인합니다.", daysAgo(2, 15), "resolved", {
                    case_ids: [CASE.happy],
                    author_type: "manager",
                    author_name: TEAM.qa,
                }),
            ],
            position: anchorPosition("demo-index-chart", "group", 200, 0.4),
        }),

        seed("indices-seed-open-ask-cross", {
            report_id: "demo-index-ai-insight",
            report_type: "item",
            cases: [
                createReportCase("AI 인사이트 잠금 카드 문구가 서버 에러와 섞여 보여요.", {
                    id: CASE.ask,
                    assignee_name: TEAM.backend,
                    previous_assignee_name: TEAM.frontend,
                }),
            ],
            field_values: seedFields("[Ask] QA·프론트·백엔드 대화"),
            replies: [
                seedReply("indices-reply-ask-xfer", "담당자가 변경되었습니다.", daysAgo(3, 9), "assignee_transferred", {
                    case_ids: [CASE.ask],
                    author_type: "manager",
                    author_name: TEAM.backend,
                }),
                seedReply(
                    "indices-reply-ask-qa",
                    "비로그인 사용자는 잠금 카피만 보여야 하는데, 가끔 500 문구가 나와요.",
                    daysAgo(2, 11),
                    "additional_question",
                    {
                        case_ids: [CASE.ask],
                        parent_reply_id: ISSUE_ROOT_PARENT_ID,
                        author_type: "manager",
                        author_name: TEAM.qa,
                    },
                ),
                seedReply(
                    "indices-reply-ask-fe",
                    "프론트는 401이면 잠금 UI로 분기해요. 500이면 에러 토스트로 가요.",
                    daysAgo(2, 13),
                    "additional_question",
                    {
                        case_ids: [CASE.ask],
                        parent_reply_id: ISSUE_ROOT_PARENT_ID,
                        author_type: "manager",
                        author_name: TEAM.frontend,
                    },
                ),
                seedReply(
                    "indices-reply-ask-be",
                    "비로그인 요청에 500 내려주던 버그 있었어요. 401로 통일할게요.",
                    daysAgo(1, 15),
                    "additional_question",
                    {
                        case_ids: [CASE.ask],
                        parent_reply_id: ISSUE_ROOT_PARENT_ID,
                        author_type: "manager",
                        author_name: TEAM.backend,
                    },
                ),
            ],
            position: anchorPosition("demo-index-ai-insight", "item", 320, 0.55),
        }),

        seed("indices-seed-story-denied", {
            report_id: "demo-related-etfs",
            report_type: "group",
            cases: [
                createReportCase("관련 ETF 리스트에서 로고가 깨진 채로 남아 있어요.", {
                    id: CASE.denied,
                    assignee_name: TEAM.frontend,
                }),
            ],
            field_values: seedFields("[Denied] 거절 후 대기", { isBug: true }),
            replies: [
                seedReply("indices-reply-denied-s", "깨진 이미지 fallback 아이콘 넣었어요.", daysAgo(2, 10), "suggested", {
                    case_ids: [CASE.denied],
                    author_type: "manager",
                    author_name: TEAM.frontend,
                }),
                seedReply(
                    "indices-reply-denied-f",
                    "fallback이 회색 박스라 시안이랑 달라요. 거절합니다.",
                    hoursAgo(7),
                    "found_error",
                    { case_ids: [CASE.denied], author_type: "user", author_name: TEAM.qa },
                ),
            ],
            position: anchorPosition("demo-related-etfs", "group", 400, 0.72),
        }),

        seed("indices-seed-open-multicase", {
            report_id: "demo-daily-prices",
            report_type: "group",
            cases: [
                createReportCase("일별 시세 테이블 날짜 포맷이 YYYY.MM.DD로 안 맞춰져요.", {
                    id: CASE.multiA,
                    status: "resolved",
                    assignee_name: TEAM.frontend,
                }),
                createReportCase("거래량 천 단위 구분 쉼표가 빠져 있어요.", {
                    id: CASE.multiB,
                    assignee_name: TEAM.backend,
                }),
            ],
            field_values: seedFields("[멀티케이스 · 2] 프론트/백엔드 분기"),
            replies: [
                seedReply("indices-reply-multi-a", "날짜 포맷 수정했어요. A 해결.", daysAgo(2, 12), "resolved", {
                    case_ids: [CASE.multiA],
                    author_type: "manager",
                    author_name: TEAM.qa,
                }),
                seedReply("indices-reply-multi-b", "거래량 포맷터 서버에서 적용했어요. 확인 부탁.", daysAgo(1, 11), "suggested", {
                    case_ids: [CASE.multiB],
                    author_type: "manager",
                    author_name: TEAM.backend,
                }),
            ],
            position: anchorPosition("demo-daily-prices", "group", 360, 0.6),
        }),

        seed("indices-seed-open-mention", {
            report_id: "demo-index-stats",
            report_type: "group",
            cases: [
                createReportCase("통계 카드 숫자 정렬이 @{m_demo_index_chart} 기준선과 안 맞아요.", {
                    id: CASE.mention,
                    assignee_name: TEAM.frontend,
                    mentions: [CHART_MENTION],
                }),
            ],
            field_values: seedFields("[태그] 차트 멘션"),
            replies: [
                seedReply(
                    "indices-reply-mention",
                    "차트 그리드 라인 기준으로 맞출게요. 수치 자릿수도 같이 볼까요?",
                    daysAgo(1, 10),
                    "additional_question",
                    {
                        case_ids: [CASE.mention],
                        parent_reply_id: ISSUE_ROOT_PARENT_ID,
                        author_type: "manager",
                        author_name: TEAM.frontend,
                        mentions: [CHART_MENTION],
                    },
                ),
            ],
            position: anchorPosition("demo-index-stats", "group", 80, 0.22),
        }),

        seed("indices-seed-open-confirm", {
            report_id: "demo-indices-list",
            report_type: "group",
            cases: [
                createReportCase("지수·환율 탭 활성 상태가 새로고침 후 초기화돼요.", {
                    id: CASE.confirm,
                    assignee_name: TEAM.frontend,
                }),
            ],
            field_values: seedFields("[Confirm] 제안 확인"),
            replies: [
                seedReply("indices-reply-confirm", "탭 상태를 URL 쿼리로 유지하게 바꿨어요. 확인 부탁.", hoursAgo(5), "suggested", {
                    case_ids: [CASE.confirm],
                    author_type: "manager",
                    author_name: TEAM.frontend,
                }),
            ],
            position: anchorPosition("demo-indices-list", "group", 420, 0.75),
        }),
    ];
}

function createSigninSeeds(): ReportFeedback[] {
    const seed = (id: string, overrides: Parameters<typeof buildSeedFeedback>[2]) => seedFor(SIGNIN_PATHNAME, id, overrides);
    const CASE = {
        wait: "signin-case-wait",
        denyApprove: "signin-case-deny-approve",
        ask: "signin-case-ask",
        confirm: "signin-case-confirm",
        transfer: "signin-case-transfer",
        stuck: "signin-case-stuck",
    } as const;

    return [
        seed("signin-seed-open-wait", {
            report_id: "demo-login-page",
            report_type: "group",
            cases: [createReportCase("로그인 페이지 타이틀과 카드 사이 여백이 시안보다 커요.", { id: CASE.wait })],
            field_values: seedFields("[대기] 초기 접수"),
            position: anchorPosition("demo-login-page", "group", 0, 0.2),
            created_at: todayIso(),
            author_name: TEAM.user,
        }),

        seed("signin-seed-story-deny-then-approve", {
            report_id: "demo-login-submit",
            report_type: "item",
            status: "resolved",
            cases: [
                createReportCase("로그인 버튼 disabled 상태가 너무 연해서 비활성인지 모르겠어요.", {
                    id: CASE.denyApprove,
                    status: "resolved",
                    assignee_name: TEAM.frontend,
                }),
            ],
            field_values: seedFields("[거절→승인] Denied 후 Confirm"),
            replies: [
                seedReply("signin-reply-deny-s1", "disabled opacity 0.4로 낮췄어요.", daysAgo(5, 10), "suggested", {
                    case_ids: [CASE.denyApprove],
                    author_type: "manager",
                    author_name: TEAM.frontend,
                }),
                seedReply("signin-reply-deny-f", "너무 연해서 아예 안 보여요. 거절.", daysAgo(4, 12), "found_error", {
                    case_ids: [CASE.denyApprove],
                    author_type: "user",
                    author_name: TEAM.qa,
                }),
                seedReply("signin-reply-deny-s2", "0.55 + 회색 배경으로 다시 조정했어요.", daysAgo(3, 11), "suggested", {
                    case_ids: [CASE.denyApprove],
                    author_type: "manager",
                    author_name: TEAM.frontend,
                }),
                seedReply("signin-reply-deny-r", "비활성 구분이 명확해요. 승인.", daysAgo(2, 14), "resolved", {
                    case_ids: [CASE.denyApprove],
                    author_type: "manager",
                    author_name: TEAM.qa,
                }),
            ],
            position: anchorPosition("demo-login-submit", "item", 360, 0.65),
        }),

        seed("signin-seed-open-ask", {
            report_id: "demo-login-phone-tab",
            report_type: "item",
            cases: [
                createReportCase("휴대폰 로그인 탭 활성 밑줄이 텍스트보다 짧아요.", {
                    id: CASE.ask,
                    assignee_name: TEAM.frontend,
                }),
            ],
            field_values: seedFields("[Ask] QA↔프론트"),
            replies: [
                seedReply(
                    "signin-reply-ask-q",
                    "밑줄을 텍스트 너비에 맞출까요, 탭 전체 너비에 맞출까요?",
                    daysAgo(1, 14),
                    "additional_question",
                    {
                        case_ids: [CASE.ask],
                        parent_reply_id: ISSUE_ROOT_PARENT_ID,
                        author_type: "manager",
                        author_name: TEAM.frontend,
                    },
                ),
                seedReply(
                    "signin-reply-ask-a",
                    "시안은 탭 전체 너비예요. 그걸로 부탁해요.",
                    hoursAgo(10),
                    "additional_question",
                    {
                        case_ids: [CASE.ask],
                        parent_reply_id: ISSUE_ROOT_PARENT_ID,
                        author_type: "user",
                        author_name: TEAM.qa,
                    },
                ),
            ],
            position: anchorPosition("demo-login-phone-tab", "item", 120, 0.32),
        }),

        seed("signin-seed-open-confirm", {
            report_id: "demo-login-qr-tab",
            report_type: "item",
            cases: [
                createReportCase("QR 탭 전환 시 패널이 한 프레임 늦게 바뀌어요.", {
                    id: CASE.confirm,
                    assignee_name: TEAM.frontend,
                }),
            ],
            field_values: seedFields("[Confirm] 확인 대기"),
            replies: [
                seedReply("signin-reply-confirm", "탭 전환을 sync로 맞췄어요. 확인해 주세요.", hoursAgo(4), "suggested", {
                    case_ids: [CASE.confirm],
                    author_type: "manager",
                    author_name: TEAM.frontend,
                }),
            ],
            position: anchorPosition("demo-login-qr-tab", "item", 120, 0.34),
        }),

        seed("signin-seed-story-transfer", {
            report_id: "demo-login-phone-panel",
            report_type: "group",
            cases: [
                createReportCase("약관 전체 동의 시 서버로 동의 시각이 안 내려가요.", {
                    id: CASE.transfer,
                    assignee_name: TEAM.backend,
                    previous_assignee_name: TEAM.frontend,
                }),
            ],
            field_values: seedFields("[이관·대화] 프론트↔백엔드", { isBug: true }),
            replies: [
                seedReply("signin-reply-xfer", "담당자가 변경되었습니다.", daysAgo(3, 9), "assignee_transferred", {
                    case_ids: [CASE.transfer],
                    author_type: "manager",
                    author_name: TEAM.backend,
                }),
                seedReply(
                    "signin-reply-xfer-fe",
                    "프론트는 agreedAt을 ISO로 보내고 있어요. 필드명 확인해 주실래요?",
                    daysAgo(2, 11),
                    "additional_question",
                    {
                        case_ids: [CASE.transfer],
                        parent_reply_id: ISSUE_ROOT_PARENT_ID,
                        author_type: "manager",
                        author_name: TEAM.frontend,
                    },
                ),
                seedReply(
                    "signin-reply-xfer-be",
                    "서버는 consentAt을 기대하고 있었어요. 매핑 추가해서 배포할게요.",
                    daysAgo(2, 14),
                    "additional_question",
                    {
                        case_ids: [CASE.transfer],
                        parent_reply_id: ISSUE_ROOT_PARENT_ID,
                        author_type: "manager",
                        author_name: TEAM.backend,
                    },
                ),
                seedReply("signin-reply-xfer-s", "consentAt 매핑 반영했습니다. QA에서 동의 플로우 한 번 봐주세요.", daysAgo(1, 12), "suggested", {
                    case_ids: [CASE.transfer],
                    author_type: "manager",
                    author_name: TEAM.backend,
                }),
            ],
            position: anchorPosition("demo-login-phone-panel", "group", 200, 0.45),
        }),

        seed("signin-seed-story-stuck-denied", {
            report_id: "demo-login-qr-panel",
            report_type: "group",
            cases: [
                createReportCase("QR 새로고침 후에도 이전 코드가 잠깐 보여요.", {
                    id: CASE.stuck,
                    assignee_name: TEAM.frontend,
                }),
            ],
            field_values: seedFields("[Denied 멈춤]", { isBug: true }),
            replies: [
                seedReply("signin-reply-stuck-s", "새로고침 시 플레이스홀더로 비우게 했어요.", daysAgo(2, 10), "suggested", {
                    case_ids: [CASE.stuck],
                    author_type: "manager",
                    author_name: TEAM.frontend,
                }),
                seedReply(
                    "signin-reply-stuck-f",
                    "느린 네트워크에서 이전 QR이 1초 정도 남아요. 거절합니다.",
                    hoursAgo(3),
                    "found_error",
                    { case_ids: [CASE.stuck], author_type: "user", author_name: TEAM.qa },
                ),
            ],
            position: anchorPosition("demo-login-qr-panel", "group", 240, 0.5),
        }),
    ];
}

export function createDemoInvestFeedbackSeed(): ReportFeedback[] {
    return [...createHomeSeeds(), ...createFeedSeeds(), ...createScreenerSeeds(), ...createIndicesSeeds(), ...createSigninSeeds()];
}

export const DEMO_INVEST_FEEDBACK_SEED_IDS = createDemoInvestFeedbackSeed().map((item) => item.id);

export const DEMO_INVEST_FEEDBACK_SEED_CATALOG: DemoSeedCatalogEntry[] = [
    { id: "home-seed-open-wait", label: "홈 · 대기", summary: "초기 접수" },
    { id: "home-seed-story-happy-path", label: "홈 · 해피패스", summary: "Ask→Confirm→해결" },
    { id: "home-seed-story-deny-then-approve", label: "홈 · 거절→승인", summary: "Denied 후 해결" },
    { id: "home-seed-open-ask-pending", label: "홈 · Ask", summary: "추가 질문 대기" },
    { id: "home-seed-open-confirm-pending", label: "홈 · Confirm", summary: "확인 요청" },
    { id: "home-seed-story-transfer-cross-talk", label: "홈 · 이관 대화", summary: "프론트↔백엔드" },
    { id: "home-seed-open-with-mentions", label: "홈 · 태그", summary: "요소 멘션" },
    { id: "home-seed-open-multicase", label: "홈 · 멀티케이스", summary: "3케이스 분기" },
    { id: "feed-seed-open-wait", label: "피드 · 대기", summary: "초기 접수" },
    { id: "feed-seed-story-deny-of-deny", label: "피드 · 거절의 거절", summary: "왕복 후 해결" },
    { id: "feed-seed-story-stuck-denied", label: "피드 · Denied", summary: "거절 멈춤" },
    { id: "feed-seed-story-long-qa", label: "피드 · 장문 Q&A", summary: "교차 질문" },
    { id: "feed-seed-open-recheck", label: "피드 · recheck", summary: "오류 아님" },
    { id: "feed-seed-open-ask-cross", label: "피드 · Ask 교차", summary: "프론트↔백엔드" },
    { id: "feed-seed-open-confirm", label: "피드 · Confirm", summary: "확인 요청" },
    { id: "screener-seed-open-wait", label: "골라보기 · 대기", summary: "초기 접수" },
    { id: "screener-seed-story-deny-of-deny-open", label: "골라보기 · 거절 진행", summary: "재거절 open" },
    { id: "screener-seed-open-confirm", label: "골라보기 · Confirm", summary: "확인 요청" },
    { id: "screener-seed-story-transfer", label: "골라보기 · 이관", summary: "프론트→백엔드" },
    { id: "screener-seed-open-multicase", label: "골라보기 · 4케이스", summary: "혼합 진행" },
    { id: "screener-seed-open-recheck", label: "골라보기 · recheck", summary: "오류 아님" },
    { id: "indices-seed-open-wait", label: "지수 · 대기", summary: "초기 접수" },
    { id: "indices-seed-story-happy-path", label: "지수 · 해피패스", summary: "Ask→Confirm→해결" },
    { id: "indices-seed-open-ask-cross", label: "지수 · Ask 교차", summary: "QA·FE·BE" },
    { id: "indices-seed-story-denied", label: "지수 · Denied", summary: "거절 대기" },
    { id: "indices-seed-open-multicase", label: "지수 · 멀티케이스", summary: "2케이스" },
    { id: "indices-seed-open-mention", label: "지수 · 태그", summary: "차트 멘션" },
    { id: "indices-seed-open-confirm", label: "지수 · Confirm", summary: "확인 요청" },
    { id: "signin-seed-open-wait", label: "로그인 · 대기", summary: "초기 접수" },
    { id: "signin-seed-story-deny-then-approve", label: "로그인 · 거절→승인", summary: "Denied 후 해결" },
    { id: "signin-seed-open-ask", label: "로그인 · Ask", summary: "QA↔프론트" },
    { id: "signin-seed-open-confirm", label: "로그인 · Confirm", summary: "확인 대기" },
    { id: "signin-seed-story-transfer", label: "로그인 · 이관", summary: "프론트↔백엔드" },
    { id: "signin-seed-story-stuck-denied", label: "로그인 · Denied", summary: "거절 멈춤" },
];
