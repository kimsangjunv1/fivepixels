import type { ReportFeedback, ReportReply } from "@/types/report.js";
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
    modalAnchorPosition,
    seedFields,
    seedReply,
    SEED_TEAM,
    todayIso,
    type DemoSeedCatalogEntry,
} from "./seedShared.js";

const TEAM = SEED_TEAM;
const AUTHOR = { author_id: "demo-user", author_name: TEAM.user } as const;

function seedFor(pathname: string, id: string, overrides: Parameters<typeof buildSeedFeedback>[2]) {
    return buildSeedFeedback(id, pathname, {
        ...AUTHOR,
        ...overrides,
        author_id: overrides.author_id ?? AUTHOR.author_id,
        author_name: overrides.author_name ?? AUTHOR.author_name,
    });
}

function assigned(id: string, caseId: string, at: string, name: string = TEAM.frontend): ReportReply {
    return seedReply(id, "담당자가 지정되었습니다.", at, "assignee_assigned", {
        case_ids: [caseId],
        author_type: "manager",
        author_name: name,
    });
}

function transferred(id: string, caseId: string, at: string, name: string): ReportReply {
    return seedReply(id, "담당자가 변경되었습니다.", at, "assignee_transferred", {
        case_ids: [caseId],
        author_type: "manager",
        author_name: name,
    });
}

function ask(id: string, caseId: string, message: string, at: string, name: string, authorType: "user" | "manager" = "manager"): ReportReply {
    return seedReply(id, message, at, "additional_question", {
        case_ids: [caseId],
        parent_reply_id: ISSUE_ROOT_PARENT_ID,
        author_type: authorType,
        author_name: name,
    });
}

function suggested(id: string, caseId: string, message: string, at: string, name: string = TEAM.frontend): ReportReply {
    return seedReply(id, message, at, "suggested", {
        case_ids: [caseId],
        author_type: "manager",
        author_name: name,
    });
}

function denied(id: string, caseId: string, message: string, at: string, name: string = TEAM.qa): ReportReply {
    return seedReply(id, message, at, "found_error", {
        case_ids: [caseId],
        author_type: "user",
        author_name: name,
    });
}

function recheck(id: string, caseId: string, message: string, at: string, name: string = TEAM.frontend): ReportReply {
    return seedReply(id, message, at, "recheck_requested", {
        case_ids: [caseId],
        author_type: "manager",
        author_name: name,
    });
}

function resolved(id: string, caseId: string, message: string, at: string, name: string = TEAM.qa): ReportReply {
    return seedReply(id, message, at, "resolved", {
        case_ids: [caseId],
        author_type: "manager",
        author_name: name,
    });
}

/** assigned → suggested → resolved (최소 합법 해결 경로) */
function resolvePath(
    prefix: string,
    caseId: string,
    suggestMsg: string,
    resolveMsg: string,
    dayOffset: number,
    assignee: string = TEAM.frontend,
): ReportReply[] {
    return [
        assigned(`${prefix}-asg`, caseId, daysAgo(dayOffset + 4, 9), assignee),
        suggested(`${prefix}-sug`, caseId, suggestMsg, daysAgo(dayOffset + 2, 12), assignee),
        resolved(`${prefix}-res`, caseId, resolveMsg, daysAgo(dayOffset, 15)),
    ];
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
    const C = {
        wait: "home-case-wait",
        h1: "home-case-happy-1",
        h2: "home-case-happy-2",
        h3: "home-case-happy-3",
        h4: "home-case-happy-4",
        d1: "home-case-deny-1",
        d2: "home-case-deny-2",
        d3: "home-case-deny-3",
        d4: "home-case-deny-4",
        d5: "home-case-deny-5",
        a1: "home-case-ask-1",
        a2: "home-case-ask-2",
        a3: "home-case-ask-3",
        t1: "home-case-xfer-1",
        t2: "home-case-xfer-2",
        t3: "home-case-xfer-3",
        t4: "home-case-xfer-4",
        m1: "home-case-mention-1",
        m2: "home-case-mention-2",
        m3: "home-case-mention-3",
        v1: "home-case-div-1",
        v2: "home-case-div-2",
        v3: "home-case-div-3",
        v4: "home-case-div-4",
        v5: "home-case-div-5",
        v6: "home-case-div-6",
    } as const;

    return [
        seed("home-seed-open-wait", {
            report_id: "demo-home-page",
            report_type: "group",
            cases: [createReportCase("홈 첫 화면에서 지수 카드와 종목 테이블 사이 여백이 시안보다 넓어요.", { id: C.wait, created_at: todayIso() })],
            field_values: seedFields("[대기 · 1] 초기 접수"),
            position: anchorPosition("demo-home-page", "group", 0, 0.18),
            created_at: todayIso(),
        }),

        seed("home-seed-story-happy-multi", {
            report_id: "demo-stock-table",
            report_type: "group",
            status: "resolved",
            cases: [
                createReportCase("종목 테이블 헤더가 스크롤 시 살짝 흔들려요.", {
                    id: C.h1,
                    status: "resolved",
                    assignee_name: TEAM.frontend,
                    previous_assignee_name: TEAM.qa,
                    created_at: daysAgo(12),
                }),
                createReportCase("실시간 등락률 숫자 자릿수가 시안과 달라요.", {
                    id: C.h2,
                    status: "resolved",
                    assignee_name: TEAM.frontend,
                    created_at: daysAgo(9),
                }),
                createReportCase("행 호버 하이라이트가 너무 연해요.", {
                    id: C.h3,
                    status: "resolved",
                    assignee_name: TEAM.frontend,
                    created_at: daysAgo(7),
                }),
                createReportCase("정렬 화살표 아이콘이 활성 상태에서 안 보여요.", {
                    id: C.h4,
                    status: "resolved",
                    assignee_name: TEAM.frontend,
                    created_at: daysAgo(5),
                }),
            ],
            field_values: seedFields("[수정하기 · 4 · 해피패스] 전원 해결", { isImportant: true }),
            replies: [
                ...resolvePath("home-h1", C.h1, "헤더 sticky + will-change 정리했어요. SE/Pixel 확인 부탁.", "양쪽 기기에서 흔들림 없어요. 승인.", 6, TEAM.frontend),
                ask("home-h1-q", C.h1, "iOS Safari만인가요, 크롬 모바일도요?", daysAgo(9, 10), TEAM.frontend),
                ask("home-h1-a", C.h1, "둘 다요. 빠른 스크롤에서 더 티나요.", daysAgo(9, 14), TEAM.user, "user"),
                ...resolvePath("home-h2", C.h2, "등락률 toFixed(2)로 맞춤. 확인 부탁.", "시안과 동일해요. 해결.", 4),
                ...resolvePath("home-h3", C.h3, "호버 배경 대비 올렸어요.", "하이라이트 잘 보여요. 승인.", 3),
                ...resolvePath("home-h4", C.h4, "정렬 아이콘 활성 색상 토큰 교체.", "아이콘 확인 완료. 해결.", 2),
            ],
            position: anchorPosition("demo-stock-table", "group", 220, 0.4),
        }),

        seed("home-seed-story-deny-loop", {
            report_id: "demo-watchlist",
            report_type: "group",
            status: "resolved",
            cases: [
                createReportCase("관심종목 추가 버튼이 다크 모드에서 대비가 부족해요.", {
                    id: C.d1,
                    status: "resolved",
                    assignee_name: TEAM.frontend,
                    created_at: daysAgo(14),
                }),
                createReportCase("관심종목 리스트 스크롤 끝에서 바운스가 과해요.", {
                    id: C.d2,
                    status: "resolved",
                    assignee_name: TEAM.frontend,
                    created_at: daysAgo(11),
                }),
                createReportCase("종목 삭제 확인 토스트가 너무 빨리 사라져요.", {
                    id: C.d3,
                    status: "resolved",
                    assignee_name: TEAM.frontend,
                    created_at: daysAgo(9),
                }),
                createReportCase("빈 관심종목 안내 문구가 시안과 달라요.", {
                    id: C.d4,
                    status: "resolved",
                    assignee_name: TEAM.frontend,
                    created_at: daysAgo(7),
                }),
                createReportCase("관심종목 AI 추천 배지 위치가 어긋나요.", {
                    id: C.d5,
                    status: "resolved",
                    assignee_name: TEAM.frontend,
                    created_at: daysAgo(5),
                }),
            ],
            field_values: seedFields("[수정하기 · 5 · 다중 반려] 확인요청→거절 반복 후 해결", { isBug: true }),
            replies: [
                assigned("home-d1-asg", C.d1, daysAgo(13, 9)),
                suggested("home-d1-s1", C.d1, "버튼 배경 semantic.primary로 변경.", daysAgo(12, 10)),
                denied("home-d1-f1", C.d1, "다크에서 아이콘이 아직도 회색이에요. 거절.", daysAgo(11, 12)),
                suggested("home-d1-s2", C.d1, "아이콘/라벨 대비 토큰 맞춰 재배포.", daysAgo(10, 11)),
                denied("home-d1-f2", C.d1, "포커스 링이 잘려요. 다시 거절.", daysAgo(9, 14)),
                suggested("home-d1-s3", C.d1, "overflow visible + 대비 재조정.", daysAgo(8, 10)),
                resolved("home-d1-r", C.d1, "라이트/다크 확인. 승인합니다.", daysAgo(7, 15)),
                ...resolvePath("home-d2", C.d2, "overscroll-behavior contain 적용.", "바운스 정상. 해결.", 5),
                assigned("home-d3-asg", C.d3, daysAgo(8, 9)),
                suggested("home-d3-s1", C.d3, "토스트 duration 2s→4s.", daysAgo(7, 11)),
                denied("home-d3-f1", C.d3, "여전히 읽기 전에 사라져요. 거절.", daysAgo(6, 13)),
                suggested("home-d3-s2", C.d3, "6초 + 수동 닫기 버튼.", daysAgo(5, 10)),
                resolved("home-d3-r", C.d3, "이제 충분해요. 승인.", daysAgo(4, 14)),
                ...resolvePath("home-d4", C.d4, "빈 상태 카피 시안 문구로 교체.", "문구 일치. 해결.", 3),
                ...resolvePath("home-d5", C.d5, "AI 배지 absolute 좌표 수정.", "배지 위치 OK. 해결.", 2),
            ],
            position: anchorPosition("demo-watchlist", "group", 80, 0.3),
        }),

        seed("home-seed-open-ask-mixed", {
            report_id: "demo-invest-search",
            report_type: "item",
            cases: [
                createReportCase("검색 모달에서 최근 검색어가 두 줄로 깨져요.", {
                    id: C.a1,
                    assignee_name: TEAM.frontend,
                    created_at: daysAgo(6),
                }),
                createReportCase("검색 결과 로딩 스켈레톤 높이가 불규칙해요.", {
                    id: C.a2,
                    assignee_name: TEAM.frontend,
                    created_at: daysAgo(4),
                }),
                createReportCase("검색 단축키 안내 툴팁이 잘려요.", {
                    id: C.a3,
                    assignee_name: TEAM.qa,
                    created_at: daysAgo(2),
                }),
            ],
            field_values: seedFields("[수정하기 · 3 · Ask 혼합] 질문/확인요청/담당"),
            replies: [
                assigned("home-a1-asg", C.a1, daysAgo(5, 9), TEAM.qa),
                transferred("home-a1-xfer", C.a1, daysAgo(5, 10), TEAM.frontend),
                ask("home-a1-q", C.a1, "한 줄 말줄임으로 할까요, 칩 높이만 늘릴까요?", daysAgo(4, 15), TEAM.frontend),
                assigned("home-a2-asg", C.a2, daysAgo(3, 9)),
                suggested("home-a2-s", C.a2, "스켈레톤 높이 통일했어요. 확인 부탁.", hoursAgo(10)),
                assigned("home-a3-asg", C.a3, daysAgo(1, 11), TEAM.qa),
            ],
            position: anchorPosition("demo-invest-search", "item", 0, 0.12),
        }),

        seed("home-seed-story-transfer", {
            report_id: "demo-ranking-filters",
            report_type: "group",
            cases: [
                createReportCase("실시간 정렬 옵션 변경 후 목록이 한 박자 늦게 갱신돼요.", {
                    id: C.t1,
                    assignee_name: TEAM.backend,
                    previous_assignee_name: TEAM.frontend,
                    created_at: daysAgo(8),
                }),
                createReportCase("필터 칩 제거 시 이전 결과가 깜빡여요.", {
                    id: C.t2,
                    assignee_name: TEAM.frontend,
                    created_at: daysAgo(6),
                }),
                createReportCase("투자위험 숨기기 토글 상태가 새로고침 후 풀려요.", {
                    id: C.t3,
                    assignee_name: TEAM.backend,
                    previous_assignee_name: TEAM.frontend,
                    created_at: daysAgo(5),
                }),
                createReportCase("지역 탭 전환 시 스크롤이 맨 위로 튕겨요.", {
                    id: C.t4,
                    assignee_name: TEAM.frontend,
                    created_at: daysAgo(3),
                }),
            ],
            field_values: seedFields("[수정하기 · 4 · 이관] 프론트↔백엔드", { isBug: true }),
            replies: [
                assigned("home-t1-asg", C.t1, daysAgo(7, 9), TEAM.frontend),
                transferred("home-t1-xfer", C.t1, daysAgo(7, 10), TEAM.backend),
                ask("home-t1-fe", C.t1, "프론트는 필터 변경 즉시 요청 중. 응답이 늦은 것 같아요.", daysAgo(6, 11), TEAM.frontend),
                ask("home-t1-be", C.t1, "랭킹 API 캐시 TTL 3초. 필터 키로 무효화할게요.", daysAgo(6, 14), TEAM.backend),
                suggested("home-t1-s", C.t1, "캐시 무효화 반영. QA에서 필터 전환 3회 확인 부탁.", daysAgo(2, 12), TEAM.backend),
                assigned("home-t2-asg", C.t2, daysAgo(5, 9)),
                ask("home-t2-q", C.t2, "깜빡임이 데이터 교체 때인가요, UI만인가요?", daysAgo(4, 10), TEAM.frontend),
                assigned("home-t3-asg", C.t3, daysAgo(4, 9), TEAM.frontend),
                transferred("home-t3-xfer", C.t3, daysAgo(4, 11), TEAM.backend),
                suggested("home-t3-s", C.t3, "토글 상태를 서버 preference로 저장. 확인 부탁.", daysAgo(1, 13), TEAM.backend),
                assigned("home-t4-asg", C.t4, daysAgo(2, 9)),
                suggested("home-t4-s", C.t4, "탭 전환 시 스크롤 위치 유지. 확인 부탁.", hoursAgo(6)),
            ],
            position: anchorPosition("demo-ranking-filters", "group", 300, 0.5),
        }),

        seed("home-seed-open-mention", {
            report_id: "demo-ai-intro",
            report_type: "item",
            cases: [
                createReportCase("AI 소개 버튼 옆에 @{m_demo_watchlist} 진입점이 겹쳐 보여요.", {
                    id: C.m1,
                    assignee_name: TEAM.frontend,
                    mentions: [WATCHLIST_MENTION],
                    created_at: daysAgo(5),
                }),
                createReportCase("AI 소개 문구가 줄바꿈되면 아이콘이 밀려요.", {
                    id: C.m2,
                    assignee_name: TEAM.frontend,
                    created_at: daysAgo(3),
                }),
                createReportCase("@{m_demo_search} 옆 여백이 시안보다 좁아요.", {
                    id: C.m3,
                    assignee_name: TEAM.qa,
                    mentions: [SEARCH_MENTION],
                    created_at: daysAgo(1),
                }),
            ],
            field_values: seedFields("[수정하기 · 3 · 태그] 요소 멘션"),
            replies: [
                assigned("home-m1-asg", C.m1, daysAgo(4, 9)),
                seedReply(
                    "home-m1-q",
                    "@{m_demo_search} 쪽 여백이랑 같이 보면 레이아웃이 더 명확할 것 같아요.",
                    daysAgo(3, 10),
                    "additional_question",
                    {
                        case_ids: [C.m1],
                        parent_reply_id: ISSUE_ROOT_PARENT_ID,
                        author_type: "manager",
                        author_name: TEAM.qa,
                        mentions: [SEARCH_MENTION],
                    },
                ),
                assigned("home-m2-asg", C.m2, daysAgo(2, 9)),
                suggested("home-m2-s", C.m2, "flex-shrink 0으로 아이콘 고정. 확인 부탁.", hoursAgo(8)),
                assigned("home-m3-asg", C.m3, hoursAgo(20), TEAM.qa),
            ],
            position: anchorPosition("demo-ai-intro", "item", 40, 0.2),
        }),

        seed("home-seed-open-diverged", {
            report_id: "demo-home-content-tabs",
            report_type: "group",
            cases: [
                createReportCase("탭 활성 밑줄이 한글 라벨보다 짧아요.", {
                    id: C.v1,
                    status: "resolved",
                    assignee_name: TEAM.frontend,
                    created_at: daysAgo(10),
                }),
                createReportCase("요약 접기 토글 포커스 링이 잘려요.", {
                    id: C.v2,
                    assignee_name: TEAM.frontend,
                    created_at: daysAgo(8),
                }),
                createReportCase("탭 전환 시 스크롤 위치가 초기화돼요.", {
                    id: C.v3,
                    assignee_name: TEAM.backend,
                    created_at: daysAgo(7),
                }),
                createReportCase("요약 배너 문구가 시안 카피와 달라요.", {
                    id: C.v4,
                    assignee_name: TEAM.frontend,
                    created_at: daysAgo(5),
                }),
                createReportCase("탭 개수가 늘어나면 가로 스크롤이 안 생겨요.", {
                    id: C.v5,
                    assignee_name: TEAM.frontend,
                    created_at: daysAgo(3),
                }),
                createReportCase("활성 탭 색이 브랜드 토큰과 미묘하게 달라요.", {
                    id: C.v6,
                    assignee_name: TEAM.frontend,
                    created_at: daysAgo(1),
                }),
            ],
            field_values: seedFields("[수정하기 · 6 · 분기] 케이스별 다른 진행", { isImportant: true }),
            replies: [
                ...resolvePath("home-v1", C.v1, "밑줄 너비 라벨에 맞춤.", "케이스 A 해결.", 6),
                assigned("home-v2-asg", C.v2, daysAgo(7, 9)),
                suggested("home-v2-s", C.v2, "overflow visible로 포커스 링 보이게.", daysAgo(5, 11)),
                assigned("home-v3-asg", C.v3, daysAgo(6, 9), TEAM.backend),
                suggested("home-v3-s", C.v3, "스크롤 복원 로직 배포.", daysAgo(4, 10), TEAM.backend),
                denied("home-v3-f", C.v3, "아직 안 들어갔어요. 거절합니다.", daysAgo(3, 9)),
                assigned("home-v4-asg", C.v4, daysAgo(4, 9)),
                ask("home-v4-q", C.v4, "시안 최신 카피 링크 공유해 주실 수 있나요?", daysAgo(3, 14), TEAM.frontend),
                assigned("home-v5-asg", C.v5, daysAgo(2, 9)),
                recheck("home-v5-r", C.v5, "탭 3개 이하가 제품 스펙이라 오류 아닌 것 같아요.", daysAgo(1, 12)),
                assigned("home-v6-asg", C.v6, hoursAgo(12)),
            ],
            position: anchorPosition("demo-home-content-tabs", "group", 240, 0.42),
        }),
    ];
}

function createFeedSeeds(): ReportFeedback[] {
    const seed = (id: string, overrides: Parameters<typeof buildSeedFeedback>[2]) => seedFor(FEED_PATHNAME, id, overrides);
    const C = {
        wait: "feed-case-wait",
        r1: "feed-case-recheck-1",
        r2: "feed-case-recheck-2",
        r3: "feed-case-recheck-3",
        r4: "feed-case-recheck-4",
        t1: "feed-case-triple-1",
        t2: "feed-case-triple-2",
        t3: "feed-case-triple-3",
        t4: "feed-case-triple-4",
        t5: "feed-case-triple-5",
        l1: "feed-case-long-1",
        l2: "feed-case-long-2",
        l3: "feed-case-long-3",
        l4: "feed-case-long-4",
        k1: "feed-case-rk-1",
        k2: "feed-case-rk-2",
        k3: "feed-case-rk-3",
        x1: "feed-case-ask-1",
        x2: "feed-case-ask-2",
        x3: "feed-case-ask-3",
        c1: "feed-case-confirm",
    } as const;

    return [
        seed("feed-seed-open-wait", {
            report_id: "demo-feed-page",
            report_type: "group",
            cases: [createReportCase("피드 상단 탭과 의견 남기기 카드 간격이 시안보다 좁아요.", { id: C.wait, created_at: todayIso() })],
            field_values: seedFields("[대기 · 1] 초기 접수"),
            position: anchorPosition("demo-feed-page", "group", 0, 0.15),
            created_at: todayIso(),
        }),

        seed("feed-seed-story-deny-recheck", {
            report_id: "demo-feed-post-ai",
            report_type: "group",
            status: "resolved",
            cases: [
                createReportCase("AI 게시글 '더 보기' 펼침 후 이미지 비율이 깨져요.", {
                    id: C.r1,
                    status: "resolved",
                    assignee_name: TEAM.frontend,
                    created_at: daysAgo(12),
                }),
                createReportCase("AI 답변 카드 그림자 방향이 시안과 반대예요.", {
                    id: C.r2,
                    status: "resolved",
                    assignee_name: TEAM.frontend,
                    created_at: daysAgo(10),
                }),
                createReportCase("더 보기 접기 버튼 위치가 본문과 겹쳐요.", {
                    id: C.r3,
                    status: "resolved",
                    assignee_name: TEAM.frontend,
                    created_at: daysAgo(8),
                }),
                createReportCase("AI 아바타 1% 배지 대비가 부족해요.", {
                    id: C.r4,
                    status: "resolved",
                    assignee_name: TEAM.frontend,
                    created_at: daysAgo(6),
                }),
            ],
            field_values: seedFields("[수정하기 · 4 · 거절의 거절] deny↔recheck 후 해결", { isBug: true }),
            replies: [
                assigned("feed-r1-asg", C.r1, daysAgo(11, 9)),
                suggested("feed-r1-s1", C.r1, "이미지 aspect-ratio 고정.", daysAgo(10, 9)),
                denied("feed-r1-f1", C.r1, "펼친 상태에서 세로로 늘어나요. 거절.", daysAgo(9, 11)),
                recheck("feed-r1-rc", C.r1, "제 기기(390px)에서는 정상인데… 확대 설정인가요?", daysAgo(8, 13)),
                denied("feed-r1-f2", C.r1, "기본 배율에서도 재현돼요. 다시 거절.", daysAgo(7, 10)),
                suggested("feed-r1-s2", C.r1, "펼침 상태만 object-fit contain.", daysAgo(6, 12)),
                resolved("feed-r1-r", C.r1, "Safari/Android 확인 완료. 해결.", daysAgo(5, 15)),
                ...resolvePath("feed-r2", C.r2, "그림자 방향 토큰 교정.", "그림자 OK. 승인.", 4),
                ...resolvePath("feed-r3", C.r3, "접기 버튼 margin 분리.", "겹침 없음. 해결.", 3),
                ...resolvePath("feed-r4", C.r4, "배지 대비 올렸어요.", "대비 충분. 승인.", 2),
            ],
            position: anchorPosition("demo-feed-post-ai", "group", 180, 0.4),
        }),

        seed("feed-seed-story-triple-deny", {
            report_id: "demo-opinion-trigger",
            report_type: "item",
            cases: [
                createReportCase("의견 남기기 버튼이 키보드 올라오면 가려져요.", {
                    id: C.t1,
                    assignee_name: TEAM.frontend,
                    created_at: daysAgo(10),
                }),
                createReportCase("의견 모달 감정 선택 칩 간격이 불규칙해요.", {
                    id: C.t2,
                    assignee_name: TEAM.frontend,
                    created_at: daysAgo(8),
                }),
                createReportCase("의견 등록 후 토스트가 피드 탭을 가려요.", {
                    id: C.t3,
                    assignee_name: TEAM.frontend,
                    created_at: daysAgo(6),
                }),
                createReportCase("의견 textarea placeholder 색이 너무 연해요.", {
                    id: C.t4,
                    assignee_name: TEAM.frontend,
                    created_at: daysAgo(4),
                }),
                createReportCase("의견 등록 버튼 disabled 구분이 약해요.", {
                    id: C.t5,
                    assignee_name: TEAM.frontend,
                    created_at: daysAgo(2),
                }),
            ],
            field_values: seedFields("[수정하기 · 5 · 삼중 거절] 확인요청→거절×3 멈춤", { isBug: true }),
            replies: [
                assigned("feed-t1-asg", C.t1, daysAgo(9, 9)),
                suggested("feed-t1-s1", C.t1, "모달 하단 safe-area 패딩.", daysAgo(8, 10)),
                denied("feed-t1-f1", C.t1, "SE에서 전송 버튼이 아직 가려져요. 거절.", daysAgo(7, 11)),
                suggested("feed-t1-s2", C.t1, "visualViewport 기준 재배치.", daysAgo(6, 10)),
                denied("feed-t1-f2", C.t1, "Android 크롬에서도 가려져요. 거절.", daysAgo(5, 12)),
                suggested("feed-t1-s3", C.t1, "키보드 inset 리스너 추가.", daysAgo(4, 9)),
                denied("feed-t1-f3", C.t1, "아이폰 SE에서 여전히 가려져요. 세 번째 거절.", hoursAgo(5)),
                assigned("feed-t2-asg", C.t2, daysAgo(7, 9)),
                suggested("feed-t2-s", C.t2, "칩 gap 8로 통일.", daysAgo(5, 11)),
                denied("feed-t2-f", C.t2, "태블릿에서 간격이 여전히 들쑥날쑥. 거절.", daysAgo(4, 14)),
                assigned("feed-t3-asg", C.t3, daysAgo(5, 9)),
                suggested("feed-t3-s", C.t3, "토스트 z-index/위치 조정.", daysAgo(3, 10)),
                assigned("feed-t4-asg", C.t4, daysAgo(3, 9)),
                ask("feed-t4-q", C.t4, "placeholder 대비를 어느 수준으로 맞출까요?", daysAgo(2, 11), TEAM.frontend),
                assigned("feed-t5-asg", C.t5, daysAgo(1, 9)),
                suggested("feed-t5-s", C.t5, "disabled opacity 0.55.", hoursAgo(8)),
            ],
            position: anchorPosition("demo-opinion-trigger", "item", 100, 0.28),
        }),

        seed("feed-seed-story-long-qa", {
            report_id: "demo-feed-actions-ai",
            report_type: "group",
            status: "resolved",
            cases: [
                createReportCase("좋아요/댓글 아이콘 간격이 시안과 달라요.", {
                    id: C.l1,
                    status: "resolved",
                    assignee_name: TEAM.frontend,
                    created_at: daysAgo(11),
                }),
                createReportCase("좋아요 카운트가 늦게 오면 레이아웃이 밀려요.", {
                    id: C.l2,
                    status: "resolved",
                    assignee_name: TEAM.backend,
                    previous_assignee_name: TEAM.frontend,
                    created_at: daysAgo(9),
                }),
                createReportCase("댓글 인라인 입력이 포커스 시 흔들려요.", {
                    id: C.l3,
                    status: "resolved",
                    assignee_name: TEAM.frontend,
                    created_at: daysAgo(7),
                }),
                createReportCase("하트 아이콘 채움 애니메이션이 끊겨 보여요.", {
                    id: C.l4,
                    status: "resolved",
                    assignee_name: TEAM.frontend,
                    created_at: daysAgo(5),
                }),
            ],
            field_values: seedFields("[수정하기 · 4 · 장문 Q&A] QA·FE·BE 교차 후 해결"),
            replies: [
                assigned("feed-l1-asg", C.l1, daysAgo(10, 9), TEAM.qa),
                transferred("feed-l1-xfer", C.l1, daysAgo(10, 10), TEAM.frontend),
                ask("feed-l1-q1", C.l1, "간격이 터치 영역 때문인가요, 시각적 여백만인가요?", daysAgo(9, 9), TEAM.qa),
                ask("feed-l1-q2", C.l1, "좋아요 카운트 API가 늦으면 UI가 밀릴 수도 있어요. 로그 볼까요?", daysAgo(9, 11), TEAM.backend),
                ask("feed-l1-a", C.l1, "시각적 간격만 문제예요. API는 정상이에요.", daysAgo(8, 10), TEAM.user, "user"),
                suggested("feed-l1-s", C.l1, "gap 12→8로 맞춤. 확인 부탁.", daysAgo(7, 12)),
                resolved("feed-l1-r", C.l1, "시안과 동일. 해결 처리.", daysAgo(5, 16)),
                assigned("feed-l2-asg", C.l2, daysAgo(8, 9), TEAM.frontend),
                transferred("feed-l2-xfer", C.l2, daysAgo(8, 10), TEAM.backend),
                ask("feed-l2-q", C.l2, "카운트 응답 SLA가 어느 정도인가요?", daysAgo(7, 11), TEAM.frontend),
                ask("feed-l2-a", C.l2, "p95 200ms로 맞춰 캐시 추가했어요.", daysAgo(6, 14), TEAM.backend),
                suggested("feed-l2-s", C.l2, "카운트 캐시 배포. QA 확인 부탁.", daysAgo(4, 12), TEAM.backend),
                resolved("feed-l2-r", C.l2, "밀림 없어요. 승인.", daysAgo(3, 15)),
                ...resolvePath("feed-l3", C.l3, "입력 포커스 layout shift 제거.", "흔들림 없음. 해결.", 3),
                ...resolvePath("feed-l4", C.l4, "하트 애니메이션 easing 정리.", "애니메이션 부드러워요. 승인.", 2),
            ],
            position: anchorPosition("demo-feed-actions-ai", "group", 320, 0.55),
        }),

        seed("feed-seed-open-recheck", {
            report_id: "demo-feed-tab-뉴스",
            report_type: "item",
            cases: [
                createReportCase("뉴스 탭 활성 색이 브랜드 컬러와 달라 보여요.", {
                    id: C.k1,
                    assignee_name: TEAM.frontend,
                    created_at: daysAgo(5),
                }),
                createReportCase("뉴스 탭 전환 시 인디케이터 애니메이션이 없어요.", {
                    id: C.k2,
                    assignee_name: TEAM.frontend,
                    created_at: daysAgo(3),
                }),
                createReportCase("전체 탭과 뉴스 탭 터치 영역이 겹쳐요.", {
                    id: C.k3,
                    assignee_name: TEAM.frontend,
                    created_at: daysAgo(1),
                }),
            ],
            field_values: seedFields("[수정하기 · 3 · recheck] 오류 아님 혼합"),
            replies: [
                assigned("feed-k1-asg", C.k1, daysAgo(4, 9)),
                recheck("feed-k1-r", C.k1, "뉴스 탭은 의도적 secondary 톤이에요. 오류 아닌 것 같아요.", daysAgo(3, 14)),
                assigned("feed-k2-asg", C.k2, daysAgo(2, 9)),
                suggested("feed-k2-s", C.k2, "인디케이터 cross-fade 추가. 확인 부탁.", hoursAgo(14)),
                assigned("feed-k3-asg", C.k3, hoursAgo(18)),
                ask("feed-k3-q", C.k3, "터치 영역 확장이 필요한 기기 폭이 있나요?", hoursAgo(6), TEAM.frontend),
            ],
            position: anchorPosition("demo-feed-tab-뉴스", "item", 20, 0.12),
        }),

        seed("feed-seed-open-ask-cross", {
            report_id: "demo-feed-post-market",
            report_type: "group",
            cases: [
                createReportCase("커뮤니티 게시글 팔로우 상태가 새로고침 후 풀려요.", {
                    id: C.x1,
                    assignee_name: TEAM.backend,
                    previous_assignee_name: TEAM.frontend,
                    created_at: daysAgo(6),
                }),
                createReportCase("만화 이미지 영역이 로딩 중 깨져 보여요.", {
                    id: C.x2,
                    assignee_name: TEAM.frontend,
                    created_at: daysAgo(4),
                }),
                createReportCase("게시글 더 보기 접힘 상태가 공유 링크에서 풀려요.", {
                    id: C.x3,
                    assignee_name: TEAM.frontend,
                    created_at: daysAgo(2),
                }),
            ],
            field_values: seedFields("[수정하기 · 3 · Ask 교차] FE↔BE"),
            replies: [
                assigned("feed-x1-asg", C.x1, daysAgo(5, 9), TEAM.frontend),
                transferred("feed-x1-xfer", C.x1, daysAgo(5, 10), TEAM.backend),
                ask("feed-x1-fe", C.x1, "프론트는 localStorage 저장 중인데, 서버 팔로우 API랑 충돌하나요?", daysAgo(4, 11), TEAM.frontend),
                ask("feed-x1-be", C.x1, "서버 상태가 우선이라 로컬을 덮어써요. 동기화 순서 바꿀게요.", daysAgo(3, 15), TEAM.backend),
                assigned("feed-x2-asg", C.x2, daysAgo(3, 9)),
                suggested("feed-x2-s", C.x2, "로딩 placeholder aspect 고정.", daysAgo(1, 12)),
                assigned("feed-x3-asg", C.x3, daysAgo(1, 9)),
                ask("feed-x3-q", C.x3, "공유 링크는 펼친 상태가 의도인가요?", hoursAgo(4), TEAM.frontend),
            ],
            position: anchorPosition("demo-feed-post-market", "group", 480, 0.7),
        }),

        seed("feed-seed-open-confirm", {
            report_id: "demo-feed-tabs",
            report_type: "group",
            cases: [
                createReportCase("전체/뉴스 탭 전환 애니메이션이 끊겨 보여요.", {
                    id: C.c1,
                    assignee_name: TEAM.frontend,
                    created_at: daysAgo(2),
                }),
            ],
            field_values: seedFields("[Confirm · 1] 제안 확인 대기"),
            replies: [
                assigned("feed-c1-asg", C.c1, daysAgo(1, 9)),
                suggested("feed-c1-s", C.c1, "fade 대신 cross-fade로 변경. 한 번 봐주세요.", hoursAgo(4)),
            ],
            position: anchorPosition("demo-feed-tabs", "group", 10, 0.1),
        }),
    ];
}

function createScreenerSeeds(): ReportFeedback[] {
    const seed = (id: string, overrides: Parameters<typeof buildSeedFeedback>[2]) => seedFor(SCREENER_PATHNAME, id, overrides);
    const C = {
        wait: "screener-case-wait",
        d1: "screener-case-deny-1",
        d2: "screener-case-deny-2",
        d3: "screener-case-deny-3",
        d4: "screener-case-deny-4",
        min: "screener-case-min",
        t1: "screener-case-xfer-1",
        t2: "screener-case-xfer-2",
        t3: "screener-case-xfer-3",
        t4: "screener-case-xfer-4",
        m1: "screener-case-m1",
        m2: "screener-case-m2",
        m3: "screener-case-m3",
        m4: "screener-case-m4",
        m5: "screener-case-m5",
        m6: "screener-case-m6",
        c1: "screener-case-c1",
        c2: "screener-case-c2",
        c3: "screener-case-c3",
    } as const;

    return [
        seed("screener-seed-open-wait", {
            report_id: "demo-screener-page",
            report_type: "group",
            cases: [createReportCase("주식 골라보기 페이지 타이틀과 프리셋 카드 간격이 좁아요.", { id: C.wait, created_at: todayIso() })],
            field_values: seedFields("[대기 · 1] 초기 접수"),
            position: anchorPosition("demo-screener-page", "group", 0, 0.14),
            created_at: todayIso(),
        }),

        seed("screener-seed-story-deny-open", {
            report_id: "demo-create-screener",
            report_type: "item",
            cases: [
                createReportCase("'직접 만들기' 버튼 그림자가 잘려요.", {
                    id: C.d1,
                    assignee_name: TEAM.frontend,
                    created_at: daysAgo(8),
                }),
                createReportCase("직접 만들기 버튼 호버 스케일이 과해요.", {
                    id: C.d2,
                    assignee_name: TEAM.frontend,
                    created_at: daysAgo(6),
                }),
                createReportCase("버튼 라벨이 좁은 폭에서 줄바꿈돼요.", {
                    id: C.d3,
                    assignee_name: TEAM.frontend,
                    created_at: daysAgo(4),
                }),
                createReportCase("포커스 링이 카드 코너와 겹쳐요.", {
                    id: C.d4,
                    assignee_name: TEAM.frontend,
                    created_at: daysAgo(2),
                }),
            ],
            field_values: seedFields("[수정하기 · 4 · 거절 진행] recheck 후 재거절", { isBug: true }),
            replies: [
                assigned("scr-d1-asg", C.d1, daysAgo(7, 9)),
                suggested("scr-d1-s1", C.d1, "부모 overflow visible.", daysAgo(6, 9)),
                denied("scr-d1-f1", C.d1, "태블릿 가로에서 여전히 잘려요.", daysAgo(5, 11)),
                recheck("scr-d1-rc", C.d1, "가로 모드는 지원 범위 밖이라 오류 아니에요.", daysAgo(4, 13)),
                denied("scr-d1-f2", C.d1, "제품 요구에 가로 모드 포함이에요. 다시 거절.", daysAgo(3, 10)),
                assigned("scr-d2-asg", C.d2, daysAgo(5, 9)),
                suggested("scr-d2-s", C.d2, "호버 scale 1.02→1.01.", daysAgo(3, 11)),
                denied("scr-d2-f", C.d2, "아직도 튀어 보여요. 거절.", daysAgo(2, 14)),
                assigned("scr-d3-asg", C.d3, daysAgo(3, 9)),
                ask("scr-d3-q", C.d3, "말줄임과 줄바꿈 중 어떤 쪽이 시안인가요?", daysAgo(2, 10), TEAM.frontend),
                assigned("scr-d4-asg", C.d4, daysAgo(1, 9)),
                suggested("scr-d4-s", C.d4, "포커스 링 inset 조정.", hoursAgo(7)),
            ],
            position: anchorPosition("demo-create-screener", "item", 60, 0.22),
        }),

        seed("screener-seed-story-minimal-resolve", {
            report_id: "demo-screener-preset-0",
            report_type: "item",
            status: "resolved",
            cases: [
                createReportCase("첫 번째 프리셋 카드 호버 테두리가 시안보다 두꺼워요.", {
                    id: C.min,
                    status: "resolved",
                    assignee_name: TEAM.frontend,
                    created_at: daysAgo(4),
                }),
            ],
            field_values: seedFields("[최소 해결 · 1] 담당→확인요청→해결"),
            replies: resolvePath("scr-min", C.min, "테두리 2px→1px. 확인 부탁.", "시안과 동일. 승인.", 1),
            position: anchorPosition("demo-screener-preset-0", "item", 140, 0.35),
        }),

        seed("screener-seed-story-transfer", {
            report_id: "demo-add-filter",
            report_type: "item",
            cases: [
                createReportCase("필터 추가 후 결과 건수가 서버 값과 안 맞아요.", {
                    id: C.t1,
                    assignee_name: TEAM.backend,
                    previous_assignee_name: TEAM.frontend,
                    created_at: daysAgo(7),
                }),
                createReportCase("필터 칩 삭제 시 API가 두 번 호출돼요.", {
                    id: C.t2,
                    assignee_name: TEAM.frontend,
                    created_at: daysAgo(5),
                }),
                createReportCase("산업 필터 빈 배열이 전체로 안 취급돼요.", {
                    id: C.t3,
                    assignee_name: TEAM.backend,
                    created_at: daysAgo(4),
                }),
                createReportCase("필터 적용 버튼이 로딩 중에도 눌려요.", {
                    id: C.t4,
                    assignee_name: TEAM.frontend,
                    created_at: daysAgo(2),
                }),
            ],
            field_values: seedFields("[수정하기 · 4 · 이관] 프론트→백엔드", { isBug: true }),
            replies: [
                assigned("scr-t1-asg", C.t1, daysAgo(6, 9), TEAM.frontend),
                transferred("scr-t1-xfer", C.t1, daysAgo(6, 10), TEAM.backend),
                ask("scr-t1-q", C.t1, "필터 payload에서 industry 빈 배열을 전체로 봐야 해요.", daysAgo(5, 12), TEAM.backend),
                ask("scr-t1-a", C.t1, "빈 배열이면 필드 자체를 빼고 있어요. 서버에서 전체로 보면 됩니다.", daysAgo(5, 15), TEAM.frontend),
                suggested("scr-t1-s", C.t1, "빈 필터=전체 로직 반영. QA 확인 부탁.", daysAgo(2, 11), TEAM.backend),
                assigned("scr-t2-asg", C.t2, daysAgo(4, 9)),
                suggested("scr-t2-s", C.t2, "칩 삭제 debounce. 확인 부탁.", daysAgo(2, 10)),
                assigned("scr-t3-asg", C.t3, daysAgo(3, 9), TEAM.backend),
                ask("scr-t3-q", C.t3, "빈 배열 vs null 중 어떤 스펙인가요?", daysAgo(2, 13), TEAM.backend),
                assigned("scr-t4-asg", C.t4, daysAgo(1, 9)),
                suggested("scr-t4-s", C.t4, "로딩 중 disabled 처리.", hoursAgo(5)),
            ],
            position: anchorPosition("demo-add-filter", "item", 280, 0.48),
        }),

        seed("screener-seed-open-mixed-6", {
            report_id: "demo-screener-row-0",
            report_type: "item",
            cases: [
                createReportCase("첫 행 선택 하이라이트가 너무 연해요.", {
                    id: C.m1,
                    status: "resolved",
                    assignee_name: TEAM.frontend,
                    created_at: daysAgo(10),
                }),
                createReportCase("등락률 색상이 시안과 반대예요.", {
                    id: C.m2,
                    assignee_name: TEAM.frontend,
                    created_at: daysAgo(8),
                }),
                createReportCase("정렬 키가 한글 종목명에서 깨져요.", {
                    id: C.m3,
                    assignee_name: TEAM.backend,
                    created_at: daysAgo(7),
                }),
                createReportCase("행 호버 시 커서 포인터가 안 붙어요.", {
                    id: C.m4,
                    assignee_name: TEAM.frontend,
                    created_at: daysAgo(5),
                }),
                createReportCase("시가총액 열 정렬이 숫자로 안 돼요.", {
                    id: C.m5,
                    assignee_name: TEAM.backend,
                    created_at: daysAgo(3),
                }),
                createReportCase("선택 행 체크 아이콘이 시안보다 커요.", {
                    id: C.m6,
                    assignee_name: TEAM.frontend,
                    created_at: daysAgo(1),
                }),
            ],
            field_values: seedFields("[수정하기 · 6 · 혼합] 해결/확인/거절/질문/recheck/담당"),
            replies: [
                ...resolvePath("scr-m1", C.m1, "하이라이트 대비 올림.", "A 해결.", 6),
                assigned("scr-m2-asg", C.m2, daysAgo(7, 9)),
                suggested("scr-m2-s", C.m2, "등락 색상 토큰 교체. 확인 부탁.", daysAgo(5, 11)),
                assigned("scr-m3-asg", C.m3, daysAgo(6, 9), TEAM.backend),
                suggested("scr-m3-s", C.m3, "한글 collation 적용.", daysAgo(4, 10), TEAM.backend),
                denied("scr-m3-f", C.m3, "아직 미적용이에요. 거절.", daysAgo(3, 9)),
                assigned("scr-m4-asg", C.m4, daysAgo(4, 9)),
                ask("scr-m4-q", C.m4, "cursor 스타일 어디 기준으로 맞출까요?", daysAgo(2, 11), TEAM.frontend),
                assigned("scr-m5-asg", C.m5, daysAgo(2, 9), TEAM.backend),
                recheck("scr-m5-r", C.m5, "시총 문자열 정렬은 의도된 동작이에요.", daysAgo(1, 12), TEAM.backend),
                assigned("scr-m6-asg", C.m6, hoursAgo(10)),
            ],
            position: anchorPosition("demo-screener-row-0", "item", 360, 0.62),
        }),

        seed("screener-seed-open-confirm", {
            report_id: "demo-preset-tooltip",
            report_type: "item",
            cases: [
                createReportCase("프리셋 툴팁 화살표 위치가 어긋나 보여요.", {
                    id: C.c1,
                    assignee_name: TEAM.frontend,
                    created_at: daysAgo(5),
                }),
                createReportCase("툴팁 본문 줄간격이 시안보다 넓어요.", {
                    id: C.c2,
                    assignee_name: TEAM.frontend,
                    created_at: daysAgo(3),
                }),
                createReportCase("툴팁이 화면 가장자리에서 잘려요.", {
                    id: C.c3,
                    assignee_name: TEAM.frontend,
                    created_at: daysAgo(1),
                }),
            ],
            field_values: seedFields("[수정하기 · 3 · Confirm] 확인 요청 중심"),
            replies: [
                assigned("scr-c1-asg", C.c1, daysAgo(4, 9)),
                suggested("scr-c1-s", C.c1, "화살표 좌표 보정. 확인 부탁.", daysAgo(2, 12)),
                assigned("scr-c2-asg", C.c2, daysAgo(2, 9)),
                suggested("scr-c2-s", C.c2, "줄간격 1.4→1.3.", hoursAgo(20)),
                assigned("scr-c3-asg", C.c3, hoursAgo(16)),
                suggested("scr-c3-s", C.c3, "가장자리 flip 로직. 확인 부탁.", hoursAgo(4)),
            ],
            position: anchorPosition("demo-preset-tooltip", "item", 160, 0.38),
        }),
    ];
}

function createIndicesSeeds(): ReportFeedback[] {
    const seed = (id: string, overrides: Parameters<typeof buildSeedFeedback>[2]) => seedFor(INDICES_PATHNAME, id, overrides);
    const C = {
        wait: "indices-case-wait",
        h1: "indices-case-h1",
        h2: "indices-case-h2",
        h3: "indices-case-h3",
        q1: "indices-case-q1",
        q2: "indices-case-q2",
        q3: "indices-case-q3",
        q4: "indices-case-q4",
        q5: "indices-case-q5",
        d1: "indices-case-d1",
        d2: "indices-case-d2",
        d3: "indices-case-d3",
        x1: "indices-case-x1",
        x2: "indices-case-x2",
        x3: "indices-case-x3",
        x4: "indices-case-x4",
        m1: "indices-case-m1",
        m2: "indices-case-m2",
        m3: "indices-case-m3",
        p1: "indices-case-p1",
        p2: "indices-case-p2",
        p3: "indices-case-p3",
        p4: "indices-case-p4",
    } as const;

    return [
        seed("indices-seed-open-wait", {
            report_id: "demo-index-page",
            report_type: "group",
            cases: [createReportCase("지수 상세 헤더와 통계 카드 사이 간격이 시안보다 넓어요.", { id: C.wait, created_at: todayIso() })],
            field_values: seedFields("[대기 · 1] 초기 접수"),
            position: anchorPosition("demo-index-page", "group", 0, 0.12),
            created_at: todayIso(),
        }),

        seed("indices-seed-story-happy", {
            report_id: "demo-index-chart",
            report_type: "group",
            status: "resolved",
            cases: [
                createReportCase("차트 기간 탭 전환 시 로딩 깜빡임이 있어요.", {
                    id: C.h1,
                    status: "resolved",
                    assignee_name: TEAM.frontend,
                    previous_assignee_name: TEAM.qa,
                    created_at: daysAgo(9),
                }),
                createReportCase("차트 그리드 라인 색이 시안보다 진해요.", {
                    id: C.h2,
                    status: "resolved",
                    assignee_name: TEAM.frontend,
                    created_at: daysAgo(6),
                }),
                createReportCase("기간 탭 활성 밑줄이 짧아요.", {
                    id: C.h3,
                    status: "resolved",
                    assignee_name: TEAM.frontend,
                    created_at: daysAgo(4),
                }),
            ],
            field_values: seedFields("[수정하기 · 3 · 해피패스] Ask→Confirm→해결"),
            replies: [
                assigned("idx-h1-asg", C.h1, daysAgo(8, 9), TEAM.qa),
                transferred("idx-h1-xfer", C.h1, daysAgo(8, 10), TEAM.frontend),
                ask("idx-h1-q", C.h1, "깜빡임이 데이터 교체 때인가요, 탭 UI만인가요?", daysAgo(7, 10), TEAM.frontend),
                ask("idx-h1-a", C.h1, "데이터 교체 때예요. 이전 차트가 잠깐 사라져요.", daysAgo(7, 14), TEAM.qa, "user"),
                suggested("idx-h1-s", C.h1, "이전 프레임 유지 후 교체.", daysAgo(5, 12)),
                resolved("idx-h1-r", C.h1, "깜빡임 없어요. 승인.", daysAgo(4, 15)),
                ...resolvePath("idx-h2", C.h2, "그리드 라인 토큰 완화.", "색상 OK. 해결.", 3),
                ...resolvePath("idx-h3", C.h3, "밑줄 너비 맞춤.", "밑줄 확인. 승인.", 2),
            ],
            position: anchorPosition("demo-index-chart", "group", 200, 0.4),
        }),

        seed("indices-seed-open-long-ask", {
            report_id: "demo-index-ai-insight",
            report_type: "item",
            cases: [
                createReportCase("AI 인사이트 잠금 카드 문구가 서버 에러와 섞여 보여요.", {
                    id: C.q1,
                    assignee_name: TEAM.backend,
                    previous_assignee_name: TEAM.frontend,
                    created_at: daysAgo(8),
                }),
                createReportCase("잠금 카드 CTA가 비로그인에서 두 번 노출돼요.", {
                    id: C.q2,
                    assignee_name: TEAM.frontend,
                    created_at: daysAgo(7),
                }),
                createReportCase("인사이트 스켈레톤이 실제 카드보다 높아요.", {
                    id: C.q3,
                    assignee_name: TEAM.frontend,
                    created_at: daysAgo(5),
                }),
                createReportCase("에러 토스트와 잠금 UI가 동시에 떠요.", {
                    id: C.q4,
                    assignee_name: TEAM.backend,
                    created_at: daysAgo(3),
                }),
                createReportCase("잠금 아이콘 크기가 시안과 달라요.", {
                    id: C.q5,
                    assignee_name: TEAM.frontend,
                    created_at: daysAgo(1),
                }),
            ],
            field_values: seedFields("[수정하기 · 5 · 장문 Ask] 질문만 길게 미해결"),
            replies: [
                assigned("idx-q1-asg", C.q1, daysAgo(7, 9), TEAM.frontend),
                transferred("idx-q1-xfer", C.q1, daysAgo(7, 10), TEAM.backend),
                ask("idx-q1-qa", C.q1, "비로그인은 잠금 카피만 보여야 하는데 가끔 500 문구가 나와요.", daysAgo(6, 11), TEAM.qa),
                ask("idx-q1-fe", C.q1, "프론트는 401이면 잠금 UI, 500이면 에러 토스트예요.", daysAgo(6, 13), TEAM.frontend),
                ask("idx-q1-be", C.q1, "비로그인에 500 내리던 버그. 401로 통일할게요.", daysAgo(5, 15), TEAM.backend),
                assigned("idx-q2-asg", C.q2, daysAgo(6, 9)),
                ask("idx-q2-q", C.q2, "CTA 중복이 헤더 로그인과 카드 둘 다인가요?", daysAgo(5, 10), TEAM.frontend),
                ask("idx-q2-a", C.q2, "맞아요. 카드 CTA만 남기면 될 것 같아요.", daysAgo(4, 14), TEAM.qa, "user"),
                assigned("idx-q3-asg", C.q3, daysAgo(4, 9)),
                ask("idx-q3-q", C.q3, "스켈레톤 높이를 카드 min-height에 맞출까요?", daysAgo(3, 11), TEAM.frontend),
                assigned("idx-q4-asg", C.q4, daysAgo(2, 9), TEAM.backend),
                ask("idx-q4-q", C.q4, "401일 때 토스트를 아예 막을까요?", daysAgo(1, 12), TEAM.backend),
                assigned("idx-q5-asg", C.q5, hoursAgo(20)),
                ask("idx-q5-q", C.q5, "아이콘 16px / 20px 중 시안은?", hoursAgo(6), TEAM.frontend),
            ],
            position: anchorPosition("demo-index-ai-insight", "item", 320, 0.55),
        }),

        seed("indices-seed-story-denied", {
            report_id: "demo-related-etfs",
            report_type: "group",
            cases: [
                createReportCase("관련 ETF 리스트에서 로고가 깨진 채로 남아 있어요.", {
                    id: C.d1,
                    assignee_name: TEAM.frontend,
                    created_at: daysAgo(5),
                }),
                createReportCase("ETF 행 간격이 시안보다 좁아요.", {
                    id: C.d2,
                    assignee_name: TEAM.frontend,
                    created_at: daysAgo(3),
                }),
                createReportCase("ETF 수익률 색상이 음수일 때 안 바뀌어요.", {
                    id: C.d3,
                    assignee_name: TEAM.frontend,
                    created_at: daysAgo(1),
                }),
            ],
            field_values: seedFields("[수정하기 · 3 · Denied] 거절 후 대기", { isBug: true }),
            replies: [
                assigned("idx-d1-asg", C.d1, daysAgo(4, 9)),
                suggested("idx-d1-s", C.d1, "깨진 이미지 fallback 아이콘.", daysAgo(3, 10)),
                denied("idx-d1-f", C.d1, "fallback이 회색 박스라 시안과 달라요. 거절.", hoursAgo(20)),
                assigned("idx-d2-asg", C.d2, daysAgo(2, 9)),
                suggested("idx-d2-s", C.d2, "행 gap 12→16.", hoursAgo(16)),
                denied("idx-d2-f", C.d2, "여전히 좁아 보여요. 거절.", hoursAgo(7)),
                assigned("idx-d3-asg", C.d3, hoursAgo(18)),
                suggested("idx-d3-s", C.d3, "음수 색상 토큰 연결.", hoursAgo(4)),
            ],
            position: anchorPosition("demo-related-etfs", "group", 400, 0.72),
        }),

        seed("indices-seed-story-double-xfer", {
            report_id: "demo-daily-prices",
            report_type: "group",
            cases: [
                createReportCase("일별 시세 테이블 날짜 포맷이 YYYY.MM.DD로 안 맞춰져요.", {
                    id: C.x1,
                    assignee_name: TEAM.backend,
                    previous_assignee_name: TEAM.frontend,
                    created_at: daysAgo(8),
                }),
                createReportCase("거래량 천 단위 구분 쉼표가 빠져 있어요.", {
                    id: C.x2,
                    assignee_name: TEAM.backend,
                    previous_assignee_name: TEAM.frontend,
                    created_at: daysAgo(6),
                }),
                createReportCase("시세 테이블 sticky 헤더가 흔들려요.", {
                    id: C.x3,
                    assignee_name: TEAM.frontend,
                    previous_assignee_name: TEAM.qa,
                    created_at: daysAgo(4),
                }),
                createReportCase("종가 컬럼 정렬이 우측이 아니에요.", {
                    id: C.x4,
                    assignee_name: TEAM.frontend,
                    created_at: daysAgo(2),
                }),
            ],
            field_values: seedFields("[수정하기 · 4 · 이관 2회] QA→FE→BE"),
            replies: [
                assigned("idx-x1-asg", C.x1, daysAgo(7, 9), TEAM.qa),
                transferred("idx-x1-xfer1", C.x1, daysAgo(7, 10), TEAM.frontend),
                transferred("idx-x1-xfer2", C.x1, daysAgo(7, 11), TEAM.backend),
                ask("idx-x1-q", C.x1, "날짜 포맷을 서버에서 내릴까요, 클라이언트에서 할까요?", daysAgo(6, 12), TEAM.backend),
                suggested("idx-x1-s", C.x1, "서버에서 YYYY.MM.DD 포맷. 확인 부탁.", daysAgo(3, 11), TEAM.backend),
                assigned("idx-x2-asg", C.x2, daysAgo(5, 9), TEAM.frontend),
                transferred("idx-x2-xfer", C.x2, daysAgo(5, 10), TEAM.backend),
                suggested("idx-x2-s", C.x2, "거래량 포맷터 서버 적용. 확인 부탁.", daysAgo(2, 12), TEAM.backend),
                assigned("idx-x3-asg", C.x3, daysAgo(3, 9), TEAM.qa),
                transferred("idx-x3-xfer", C.x3, daysAgo(3, 10), TEAM.frontend),
                suggested("idx-x3-s", C.x3, "sticky + will-change. 확인 부탁.", daysAgo(1, 10)),
                assigned("idx-x4-asg", C.x4, daysAgo(1, 9)),
                ask("idx-x4-q", C.x4, "종가만 우측, 나머지는 좌측이 맞나요?", hoursAgo(8), TEAM.frontend),
            ],
            position: anchorPosition("demo-daily-prices", "group", 360, 0.6),
        }),

        seed("indices-seed-open-mention", {
            report_id: "demo-index-stats",
            report_type: "group",
            cases: [
                createReportCase("통계 카드 숫자 정렬이 @{m_demo_index_chart} 기준선과 안 맞아요.", {
                    id: C.m1,
                    assignee_name: TEAM.frontend,
                    mentions: [CHART_MENTION],
                    created_at: daysAgo(5),
                }),
                createReportCase("통계 카드 라벨 자간이 시안과 달라요.", {
                    id: C.m2,
                    assignee_name: TEAM.frontend,
                    created_at: daysAgo(3),
                }),
                createReportCase("통계 값 단위(%) 위치가 어긋나요.", {
                    id: C.m3,
                    assignee_name: TEAM.frontend,
                    created_at: daysAgo(1),
                }),
            ],
            field_values: seedFields("[수정하기 · 3 · 태그] 차트 멘션"),
            replies: [
                assigned("idx-m1-asg", C.m1, daysAgo(4, 9)),
                seedReply(
                    "idx-m1-q",
                    "차트 그리드 라인 기준으로 맞출게요. 자릿수도 같이 볼까요?",
                    daysAgo(3, 10),
                    "additional_question",
                    {
                        case_ids: [C.m1],
                        parent_reply_id: ISSUE_ROOT_PARENT_ID,
                        author_type: "manager",
                        author_name: TEAM.frontend,
                        mentions: [CHART_MENTION],
                    },
                ),
                assigned("idx-m2-asg", C.m2, daysAgo(2, 9)),
                suggested("idx-m2-s", C.m2, "자간 토큰 맞춤. 확인 부탁.", hoursAgo(12)),
                assigned("idx-m3-asg", C.m3, hoursAgo(16)),
                suggested("idx-m3-s", C.m3, "% 단위 baseline 정렬. 확인 부탁.", hoursAgo(3)),
            ],
            position: anchorPosition("demo-index-stats", "group", 80, 0.22),
        }),

        seed("indices-seed-open-partial", {
            report_id: "demo-indices-list",
            report_type: "group",
            cases: [
                createReportCase("지수·환율 탭 활성 상태가 새로고침 후 초기화돼요.", {
                    id: C.p1,
                    status: "resolved",
                    assignee_name: TEAM.frontend,
                    created_at: daysAgo(7),
                }),
                createReportCase("지수 리스트 행 높이가 시안보다 커요.", {
                    id: C.p2,
                    status: "resolved",
                    assignee_name: TEAM.frontend,
                    created_at: daysAgo(5),
                }),
                createReportCase("환율 탭 숫자 정렬이 흔들려요.", {
                    id: C.p3,
                    assignee_name: TEAM.frontend,
                    created_at: daysAgo(3),
                }),
                createReportCase("리스트 하단 페이드가 잘려요.", {
                    id: C.p4,
                    assignee_name: TEAM.frontend,
                    created_at: daysAgo(1),
                }),
            ],
            field_values: seedFields("[수정하기 · 4 · 부분 해결] 2해결 / 2진행"),
            replies: [
                ...resolvePath("idx-p1", C.p1, "탭 상태를 URL 쿼리로 유지.", "새로고침 유지 확인. 승인.", 4),
                ...resolvePath("idx-p2", C.p2, "행 높이 48→44.", "높이 OK. 해결.", 3),
                assigned("idx-p3-asg", C.p3, daysAgo(2, 9)),
                suggested("idx-p3-s", C.p3, "tabular-nums 적용. 확인 부탁.", hoursAgo(14)),
                assigned("idx-p4-asg", C.p4, hoursAgo(20)),
                suggested("idx-p4-s", C.p4, "하단 페이드 overflow 수정. 확인 부탁.", hoursAgo(10)),
                denied("idx-p4-f", C.p4, "페이드가 아직 잘려요. 거절.", hoursAgo(6)),
            ],
            position: anchorPosition("demo-indices-list", "group", 420, 0.75),
        }),
    ];
}

function createSigninSeeds(): ReportFeedback[] {
    const seed = (id: string, overrides: Parameters<typeof buildSeedFeedback>[2]) => seedFor(SIGNIN_PATHNAME, id, overrides);
    const C = {
        wait: "signin-case-wait",
        d1: "signin-case-d1",
        d2: "signin-case-d2",
        d3: "signin-case-d3",
        d4: "signin-case-d4",
        a1: "signin-case-a1",
        a2: "signin-case-a2",
        a3: "signin-case-a3",
        r1: "signin-case-r1",
        r2: "signin-case-r2",
        r3: "signin-case-r3",
        r4: "signin-case-r4",
        r5: "signin-case-r5",
        t1: "signin-case-t1",
        t2: "signin-case-t2",
        t3: "signin-case-t3",
        s1: "signin-case-s1",
        s2: "signin-case-s2",
        s3: "signin-case-s3",
    } as const;

    return [
        seed("signin-seed-open-wait", {
            report_id: "demo-login-page",
            report_type: "group",
            cases: [createReportCase("로그인 페이지 타이틀과 카드 사이 여백이 시안보다 커요.", { id: C.wait, created_at: todayIso() })],
            field_values: seedFields("[대기 · 1] 초기 접수"),
            position: anchorPosition("demo-login-page", "group", 0, 0.2),
            created_at: todayIso(),
        }),

        seed("signin-seed-story-deny-approve", {
            report_id: "demo-login-submit",
            report_type: "item",
            status: "resolved",
            cases: [
                createReportCase("로그인 버튼 disabled 상태가 너무 연해서 비활성인지 모르겠어요.", {
                    id: C.d1,
                    status: "resolved",
                    assignee_name: TEAM.frontend,
                    created_at: daysAgo(9),
                }),
                createReportCase("로그인 버튼 로딩 스피너가 텍스트와 겹쳐요.", {
                    id: C.d2,
                    status: "resolved",
                    assignee_name: TEAM.frontend,
                    created_at: daysAgo(7),
                }),
                createReportCase("에러 메시지 색이 시안보다 연해요.", {
                    id: C.d3,
                    status: "resolved",
                    assignee_name: TEAM.frontend,
                    created_at: daysAgo(5),
                }),
                createReportCase("휴대폰 번호 입력 포맷이 하이픈 없이 나와요.", {
                    id: C.d4,
                    status: "resolved",
                    assignee_name: TEAM.frontend,
                    created_at: daysAgo(3),
                }),
            ],
            field_values: seedFields("[수정하기 · 4 · 거절→승인] Denied 후 Confirm"),
            replies: [
                assigned("sin-d1-asg", C.d1, daysAgo(8, 9)),
                suggested("sin-d1-s1", C.d1, "disabled opacity 0.4.", daysAgo(7, 10)),
                denied("sin-d1-f", C.d1, "너무 연해서 아예 안 보여요. 거절.", daysAgo(6, 12)),
                suggested("sin-d1-s2", C.d1, "0.55 + 회색 배경.", daysAgo(5, 11)),
                resolved("sin-d1-r", C.d1, "비활성 구분 명확. 승인.", daysAgo(4, 14)),
                ...resolvePath("sin-d2", C.d2, "스피너와 텍스트 gap 분리.", "겹침 없음. 해결.", 3),
                ...resolvePath("sin-d3", C.d3, "에러 색상 토큰 교체.", "대비 OK. 승인.", 2),
                ...resolvePath("sin-d4", C.d4, "하이픈 자동 포맷.", "포맷 확인. 해결.", 1),
            ],
            position: anchorPosition("demo-login-submit", "item", 360, 0.65),
        }),

        seed("signin-seed-open-ask", {
            report_id: "demo-login-phone-tab",
            report_type: "item",
            cases: [
                createReportCase("휴대폰 로그인 탭 활성 밑줄이 텍스트보다 짧아요.", {
                    id: C.a1,
                    assignee_name: TEAM.frontend,
                    created_at: daysAgo(4),
                }),
                createReportCase("탭 전환 시 포커스가 입력창으로 안 가요.", {
                    id: C.a2,
                    assignee_name: TEAM.frontend,
                    created_at: daysAgo(2),
                }),
                createReportCase("QR 탭 라벨 자간이 시안과 달라요.", {
                    id: C.a3,
                    assignee_name: TEAM.frontend,
                    created_at: daysAgo(1),
                }),
            ],
            field_values: seedFields("[수정하기 · 3 · Ask] QA↔프론트"),
            replies: [
                assigned("sin-a1-asg", C.a1, daysAgo(3, 9)),
                ask("sin-a1-q", C.a1, "밑줄을 텍스트 너비에 맞출까요, 탭 전체에 맞출까요?", daysAgo(2, 14), TEAM.frontend),
                ask("sin-a1-a", C.a1, "시안은 탭 전체 너비예요.", hoursAgo(20), TEAM.qa, "user"),
                assigned("sin-a2-asg", C.a2, daysAgo(1, 9)),
                ask("sin-a2-q", C.a2, "자동 포커스가 접근성 측면에서 OK인가요?", hoursAgo(10), TEAM.frontend),
                assigned("sin-a3-asg", C.a3, hoursAgo(16)),
                suggested("sin-a3-s", C.a3, "자간 토큰 맞춤. 확인 부탁.", hoursAgo(5)),
            ],
            position: anchorPosition("demo-login-phone-tab", "item", 120, 0.32),
        }),

        seed("signin-seed-story-all-resolved", {
            report_id: "demo-login-qr-tab",
            report_type: "item",
            status: "resolved",
            cases: [
                createReportCase("QR 탭 전환 시 패널이 한 프레임 늦게 바뀌어요.", {
                    id: C.r1,
                    status: "resolved",
                    assignee_name: TEAM.frontend,
                    created_at: daysAgo(12),
                }),
                createReportCase("QR 탭 아이콘이 시안보다 작아요.", {
                    id: C.r2,
                    status: "resolved",
                    assignee_name: TEAM.frontend,
                    created_at: daysAgo(10),
                }),
                createReportCase("탭 인디케이터 애니메이션이 끊겨요.", {
                    id: C.r3,
                    status: "resolved",
                    assignee_name: TEAM.frontend,
                    created_at: daysAgo(8),
                }),
                createReportCase("활성 탭 텍스트 굵기가 시안과 달라요.", {
                    id: C.r4,
                    status: "resolved",
                    assignee_name: TEAM.frontend,
                    created_at: daysAgo(6),
                }),
                createReportCase("탭 터치 영역이 라벨보다 좁아요.", {
                    id: C.r5,
                    status: "resolved",
                    assignee_name: TEAM.frontend,
                    created_at: daysAgo(4),
                }),
            ],
            field_values: seedFields("[수정하기 · 5 · 전원 해결] 케이스마다 담당→확인→해결", { isImportant: true }),
            replies: [
                ...resolvePath("sin-r1", C.r1, "탭 전환 sync 맞춤. 확인 부탁.", "프레임 지연 없음. 승인.", 6),
                ...resolvePath("sin-r2", C.r2, "아이콘 20px.", "크기 OK. 해결.", 5),
                ...resolvePath("sin-r3", C.r3, "인디케이터 transition 정리.", "애니메이션 OK. 승인.", 4),
                ...resolvePath("sin-r4", C.r4, "활성 font-weight 600.", "굵기 확인. 해결.", 3),
                ...resolvePath("sin-r5", C.r5, "터치 영역 padding 확장.", "터치 OK. 승인.", 2),
            ],
            position: anchorPosition("demo-login-qr-tab", "item", 120, 0.34),
        }),

        seed("signin-seed-story-transfer", {
            report_id: "demo-login-phone-panel",
            report_type: "group",
            cases: [
                createReportCase("약관 전체 동의 시 서버로 동의 시각이 안 내려가요.", {
                    id: C.t1,
                    assignee_name: TEAM.backend,
                    previous_assignee_name: TEAM.frontend,
                    created_at: daysAgo(6),
                }),
                createReportCase("약관 링크 밑줄이 시안과 달라요.", {
                    id: C.t2,
                    assignee_name: TEAM.frontend,
                    created_at: daysAgo(4),
                }),
                createReportCase("개별 약관 체크 순서가 서버 validation과 안 맞아요.", {
                    id: C.t3,
                    assignee_name: TEAM.backend,
                    created_at: daysAgo(2),
                }),
            ],
            field_values: seedFields("[수정하기 · 3 · 이관] 프론트↔백엔드", { isBug: true }),
            replies: [
                assigned("sin-t1-asg", C.t1, daysAgo(5, 9), TEAM.frontend),
                transferred("sin-t1-xfer", C.t1, daysAgo(5, 10), TEAM.backend),
                ask("sin-t1-fe", C.t1, "프론트는 agreedAt을 ISO로 보내요. 필드명 확인해 주실래요?", daysAgo(4, 11), TEAM.frontend),
                ask("sin-t1-be", C.t1, "서버는 consentAt을 기대. 매핑 추가할게요.", daysAgo(4, 14), TEAM.backend),
                suggested("sin-t1-s", C.t1, "consentAt 매핑 반영. QA에서 동의 플로우 확인 부탁.", daysAgo(2, 12), TEAM.backend),
                assigned("sin-t2-asg", C.t2, daysAgo(3, 9)),
                suggested("sin-t2-s", C.t2, "링크 underline 스타일 맞춤.", daysAgo(1, 10)),
                assigned("sin-t3-asg", C.t3, daysAgo(1, 9), TEAM.backend),
                ask("sin-t3-q", C.t3, "필수 약관 키가 문서와 코드에서 다른가요?", hoursAgo(8), TEAM.backend),
            ],
            position: anchorPosition("demo-login-phone-panel", "group", 200, 0.45),
        }),

        seed("signin-seed-story-stuck", {
            report_id: "demo-login-qr-panel",
            report_type: "group",
            cases: [
                createReportCase("QR 새로고침 후에도 이전 코드가 잠깐 보여요.", {
                    id: C.s1,
                    assignee_name: TEAM.frontend,
                    created_at: daysAgo(4),
                }),
                createReportCase("QR 만료 타이머가 시안보다 빨리 줄어요.", {
                    id: C.s2,
                    assignee_name: TEAM.frontend,
                    created_at: daysAgo(2),
                }),
                createReportCase("QR 새로고침 버튼 로딩 표시가 없어요.", {
                    id: C.s3,
                    assignee_name: TEAM.frontend,
                    created_at: daysAgo(1),
                }),
            ],
            field_values: seedFields("[수정하기 · 3 · Denied 멈춤]", { isBug: true }),
            replies: [
                assigned("sin-s1-asg", C.s1, daysAgo(3, 9)),
                suggested("sin-s1-s", C.s1, "새로고침 시 플레이스홀더로 비움.", daysAgo(2, 10)),
                denied("sin-s1-f", C.s1, "느린 네트워크에서 이전 QR이 1초 남아요. 거절.", hoursAgo(8)),
                assigned("sin-s2-asg", C.s2, daysAgo(1, 9)),
                suggested("sin-s2-s", C.s2, "타이머 60초로 맞춤.", hoursAgo(14)),
                denied("sin-s2-f", C.s2, "체감 45초쯤에 만료돼요. 거절.", hoursAgo(5)),
                assigned("sin-s3-asg", C.s3, hoursAgo(18)),
                suggested("sin-s3-s", C.s3, "새로고침 스피너 추가. 확인 부탁.", hoursAgo(3)),
            ],
            position: anchorPosition("demo-login-qr-panel", "group", 240, 0.5),
        }),
    ];
}

function createModalSeeds(): ReportFeedback[] {
    const home = (id: string, overrides: Parameters<typeof buildSeedFeedback>[2]) => seedFor(HOME_PATHNAME, id, overrides);
    const feed = (id: string, overrides: Parameters<typeof buildSeedFeedback>[2]) => seedFor(FEED_PATHNAME, id, overrides);
    const screener = (id: string, overrides: Parameters<typeof buildSeedFeedback>[2]) => seedFor(SCREENER_PATHNAME, id, overrides);

    const C = {
        so1: "modal-search-ov-1",
        so2: "modal-search-ov-2",
        so3: "modal-search-ov-3",
        so4: "modal-search-ov-4",
        sb1: "modal-search-bd-1",
        sb2: "modal-search-bd-2",
        sb3: "modal-search-bd-3",
        w1: "modal-watch-1",
        w2: "modal-watch-2",
        w3: "modal-watch-3",
        w4: "modal-watch-4",
        w5: "modal-watch-5",
        f1: "modal-filter-1",
        f2: "modal-filter-2",
        f3: "modal-filter-3",
        f4: "modal-filter-4",
        f5: "modal-filter-5",
        f6: "modal-filter-6",
        o1: "modal-opinion-1",
        o2: "modal-opinion-2",
        o3: "modal-opinion-3",
        l1: "modal-login-1",
        l2: "modal-login-2",
        l3: "modal-login-3",
        l4: "modal-login-4",
        lw: "modal-login-wait",
    } as const;

    return [
        home("home-seed-modal-search-overlay", {
            report_id: "demo-modal-search-overlay",
            report_type: "group",
            cases: [
                createReportCase("검색 모달 오버레이 클릭 시 포커스가 본문으로 안 돌아가요.", {
                    id: C.so1,
                    assignee_name: TEAM.frontend,
                    created_at: daysAgo(6),
                }),
                createReportCase("오버레이 딤 농도가 시안보다 진해요.", {
                    id: C.so2,
                    assignee_name: TEAM.frontend,
                    created_at: daysAgo(4),
                }),
                createReportCase("모달 열릴 때 배경 스크롤이 잠기지 않아요.", {
                    id: C.so3,
                    assignee_name: TEAM.frontend,
                    created_at: daysAgo(3),
                }),
                createReportCase("오버레이 fade-in이 끊겨 보여요.", {
                    id: C.so4,
                    assignee_name: TEAM.frontend,
                    created_at: daysAgo(1),
                }),
            ],
            field_values: seedFields("[모달 · 검색 overlay · 4] 혼합 진행"),
            replies: [
                assigned("mod-so1-asg", C.so1, daysAgo(5, 9)),
                suggested("mod-so1-s", C.so1, "닫힐 때 트리거로 포커스 복귀. 확인 부탁.", daysAgo(3, 11)),
                assigned("mod-so2-asg", C.so2, daysAgo(3, 9)),
                suggested("mod-so2-s", C.so2, "딤 opacity 0.5→0.4.", daysAgo(2, 10)),
                denied("mod-so2-f", C.so2, "딤이 아직도 진해요. 거절.", hoursAgo(20)),
                assigned("mod-so3-asg", C.so3, daysAgo(2, 9)),
                ask("mod-so3-q", C.so3, "body overflow hidden으로 잠글까요?", daysAgo(1, 12), TEAM.frontend),
                assigned("mod-so4-asg", C.so4, hoursAgo(14)),
                suggested("mod-so4-s", C.so4, "fade 200ms ease. 확인 부탁.", hoursAgo(4)),
            ],
            position: modalAnchorPosition("demo-modal-search-overlay", "group", "demo-modal-search", 0, 0.4),
        }),

        home("home-seed-modal-search-body", {
            report_id: "demo-modal-search",
            report_type: "item",
            status: "resolved",
            cases: [
                createReportCase("검색 입력 placeholder가 시안 문구와 달라요.", {
                    id: C.sb1,
                    status: "resolved",
                    assignee_name: TEAM.frontend,
                    created_at: daysAgo(8),
                }),
                createReportCase("검색 결과 행 호버가 너무 진해요.", {
                    id: C.sb2,
                    status: "resolved",
                    assignee_name: TEAM.frontend,
                    created_at: daysAgo(5),
                }),
                createReportCase("결과 없음 문구 위치가 카드 중앙이 아니에요.", {
                    id: C.sb3,
                    status: "resolved",
                    assignee_name: TEAM.frontend,
                    created_at: daysAgo(3),
                }),
            ],
            field_values: seedFields("[모달 · 검색 본문 · 3 · 해피패스] 내부 해결", { isImportant: true }),
            replies: [
                ...resolvePath("mod-sb1", C.sb1, "placeholder 시안 문구로 교체.", "문구 확인. 승인.", 4),
                ...resolvePath("mod-sb2", C.sb2, "호버 배경 완화.", "호버 OK. 해결.", 3),
                ...resolvePath("mod-sb3", C.sb3, "empty 상태 중앙 정렬.", "위치 OK. 승인.", 2),
            ],
            position: modalAnchorPosition("demo-modal-search", "item", "demo-modal-search", 40, 0.45),
        }),

        home("home-seed-modal-watchlist", {
            report_id: "demo-modal-watchlist",
            report_type: "item",
            cases: [
                createReportCase("관심종목 추가 모달에서 선택 체크가 늦게 반영돼요.", {
                    id: C.w1,
                    assignee_name: TEAM.backend,
                    previous_assignee_name: TEAM.frontend,
                    created_at: daysAgo(7),
                }),
                createReportCase("종목 리스트 스크롤 끝 페이드가 없어요.", {
                    id: C.w2,
                    assignee_name: TEAM.frontend,
                    created_at: daysAgo(5),
                }),
                createReportCase("선택 종목 추가 버튼이 로딩 중에도 활성이에요.", {
                    id: C.w3,
                    assignee_name: TEAM.frontend,
                    created_at: daysAgo(4),
                }),
                createReportCase("모달 제목과 설명 간격이 시안보다 좁아요.", {
                    id: C.w4,
                    assignee_name: TEAM.frontend,
                    created_at: daysAgo(2),
                }),
                createReportCase("이미 관심인 종목이 선택 가능해 보여요.", {
                    id: C.w5,
                    assignee_name: TEAM.frontend,
                    created_at: daysAgo(1),
                }),
            ],
            field_values: seedFields("[모달 · 관심종목 · 5] 이관·suggested·거절", { isBug: true }),
            replies: [
                assigned("mod-w1-asg", C.w1, daysAgo(6, 9), TEAM.frontend),
                transferred("mod-w1-xfer", C.w1, daysAgo(6, 10), TEAM.backend),
                ask("mod-w1-q", C.w1, "선택 상태가 낙관적 업데이트인가요, 서버 응답 후인가요?", daysAgo(5, 11), TEAM.backend),
                suggested("mod-w1-s", C.w1, "낙관적 업데이트 후 reconcile. 확인 부탁.", daysAgo(2, 12), TEAM.backend),
                assigned("mod-w2-asg", C.w2, daysAgo(4, 9)),
                suggested("mod-w2-s", C.w2, "스크롤 끝 페이드 추가.", daysAgo(2, 10)),
                denied("mod-w2-f", C.w2, "다크 모드에서 페이드가 안 보여요. 거절.", daysAgo(1, 14)),
                assigned("mod-w3-asg", C.w3, daysAgo(3, 9)),
                suggested("mod-w3-s", C.w3, "로딩 중 disabled.", hoursAgo(20)),
                assigned("mod-w4-asg", C.w4, daysAgo(1, 9)),
                ask("mod-w4-q", C.w4, "제목-설명 gap을 8에서 12로 올릴까요?", hoursAgo(10), TEAM.frontend),
                assigned("mod-w5-asg", C.w5, hoursAgo(14)),
                suggested("mod-w5-s", C.w5, "이미 관심 종목 disabled. 확인 부탁.", hoursAgo(3)),
            ],
            position: modalAnchorPosition("demo-modal-watchlist", "item", "demo-modal-watchlist", 80, 0.42),
        }),

        screener("screener-seed-modal-filter", {
            report_id: "demo-modal-filter",
            report_type: "item",
            cases: [
                createReportCase("필터 모달에서 조건 칩 선택이 토글이 안 돼요.", {
                    id: C.f1,
                    assignee_name: TEAM.frontend,
                    created_at: daysAgo(10),
                }),
                createReportCase("필터 적용 후 모달이 안 닫혀요.", {
                    id: C.f2,
                    assignee_name: TEAM.frontend,
                    created_at: daysAgo(8),
                }),
                createReportCase("조건 그리드 간격이 시안과 달라요.", {
                    id: C.f3,
                    assignee_name: TEAM.frontend,
                    created_at: daysAgo(6),
                }),
                createReportCase("선택 개수 표시가 업데이트 안 돼요.", {
                    id: C.f4,
                    assignee_name: TEAM.backend,
                    previous_assignee_name: TEAM.frontend,
                    created_at: daysAgo(5),
                }),
                createReportCase("필터 초기화 버튼이 없어요.", {
                    id: C.f5,
                    assignee_name: TEAM.frontend,
                    created_at: daysAgo(3),
                }),
                createReportCase("모달 푸터 버튼이 키보드에 가려져요.", {
                    id: C.f6,
                    assignee_name: TEAM.frontend,
                    created_at: daysAgo(1),
                }),
            ],
            field_values: seedFields("[모달 · 필터 · 6 · 거절 루프] 대규모 분기", { isBug: true, isImportant: true }),
            replies: [
                assigned("mod-f1-asg", C.f1, daysAgo(9, 9)),
                suggested("mod-f1-s1", C.f1, "칩 토글 상태 수정.", daysAgo(8, 10)),
                denied("mod-f1-f1", C.f1, "더블탭 시 상태가 꼬여요. 거절.", daysAgo(7, 12)),
                suggested("mod-f1-s2", C.f1, "토글 race 수정.", daysAgo(6, 11)),
                denied("mod-f1-f2", C.f1, "세 개 연속 선택 시 깨져요. 다시 거절.", daysAgo(5, 13)),
                assigned("mod-f2-asg", C.f2, daysAgo(7, 9)),
                suggested("mod-f2-s", C.f2, "적용 후 closeModal 호출.", daysAgo(4, 10)),
                assigned("mod-f3-asg", C.f3, daysAgo(5, 9)),
                suggested("mod-f3-s", C.f3, "그리드 gap 시안 맞춤.", daysAgo(3, 11)),
                denied("mod-f3-f", C.f3, "모바일에서 간격이 아직 달라요. 거절.", daysAgo(2, 14)),
                assigned("mod-f4-asg", C.f4, daysAgo(4, 9), TEAM.frontend),
                transferred("mod-f4-xfer", C.f4, daysAgo(4, 10), TEAM.backend),
                suggested("mod-f4-s", C.f4, "선택 개수 API 동기화. 확인 부탁.", daysAgo(1, 12), TEAM.backend),
                assigned("mod-f5-asg", C.f5, daysAgo(2, 9)),
                ask("mod-f5-q", C.f5, "초기화 버튼을 푸터에 둘까요, 헤더에 둘까요?", daysAgo(1, 10), TEAM.frontend),
                assigned("mod-f6-asg", C.f6, hoursAgo(16)),
                suggested("mod-f6-s", C.f6, "푸터 safe-area + sticky. 확인 부탁.", hoursAgo(4)),
            ],
            position: modalAnchorPosition("demo-modal-filter", "item", "demo-modal-filter", 100, 0.4),
        }),

        feed("feed-seed-modal-opinion", {
            report_id: "demo-modal-opinion",
            report_type: "item",
            cases: [
                createReportCase("의견 모달 감정 칩이 한 줄에 안 들어가요.", {
                    id: C.o1,
                    assignee_name: TEAM.frontend,
                    created_at: daysAgo(4),
                }),
                createReportCase("의견 textarea 최소 높이가 시안보다 낮아요.", {
                    id: C.o2,
                    assignee_name: TEAM.frontend,
                    created_at: daysAgo(2),
                }),
                createReportCase("의견 등록 버튼이 빈 입력에서도 활성처럼 보여요.", {
                    id: C.o3,
                    assignee_name: TEAM.frontend,
                    created_at: daysAgo(1),
                }),
            ],
            field_values: seedFields("[모달 · 의견 · 3 · Ask] 질문 대기"),
            replies: [
                assigned("mod-o1-asg", C.o1, daysAgo(3, 9)),
                ask("mod-o1-q", C.o1, "칩을 wrap할까요, 가로 스크롤할까요?", daysAgo(2, 11), TEAM.frontend),
                assigned("mod-o2-asg", C.o2, daysAgo(1, 9)),
                ask("mod-o2-q", C.o2, "min-height 120이 시안 맞나요?", hoursAgo(16), TEAM.frontend),
                assigned("mod-o3-asg", C.o3, hoursAgo(12)),
                ask("mod-o3-q", C.o3, "disabled 스타일을 더 강하게 할까요?", hoursAgo(4), TEAM.frontend),
            ],
            position: modalAnchorPosition("demo-modal-opinion", "item", "demo-modal-opinion", 60, 0.4),
        }),

        home("home-seed-modal-login", {
            report_id: "demo-modal-login",
            report_type: "item",
            status: "resolved",
            cases: [
                createReportCase("로그인 모달 설명 문구가 시안과 달라요.", {
                    id: C.l1,
                    status: "resolved",
                    assignee_name: TEAM.frontend,
                    created_at: daysAgo(8),
                }),
                createReportCase("로그인 이동 버튼 대비가 부족해요.", {
                    id: C.l2,
                    status: "resolved",
                    assignee_name: TEAM.frontend,
                    created_at: daysAgo(6),
                }),
                createReportCase("모달 자물쇠 아이콘이 너무 커요.", {
                    id: C.l3,
                    status: "resolved",
                    assignee_name: TEAM.frontend,
                    created_at: daysAgo(4),
                }),
                createReportCase("닫기 버튼 터치 영역이 작아요.", {
                    id: C.l4,
                    status: "resolved",
                    assignee_name: TEAM.frontend,
                    created_at: daysAgo(2),
                }),
            ],
            field_values: seedFields("[모달 · 로그인 · 4 · 해결]"),
            replies: [
                ...resolvePath("mod-l1", C.l1, "설명 문구 시안 반영.", "문구 OK. 승인.", 4),
                ...resolvePath("mod-l2", C.l2, "버튼 대비 토큰.", "대비 OK. 해결.", 3),
                ...resolvePath("mod-l3", C.l3, "아이콘 크기 축소.", "크기 OK. 승인.", 2),
                ...resolvePath("mod-l4", C.l4, "닫기 터치 44px.", "터치 OK. 해결.", 1),
            ],
            position: modalAnchorPosition("demo-modal-login", "item", "demo-modal-login", 50, 0.42),
        }),

        home("home-seed-modal-login-wait", {
            report_id: "demo-modal-login-overlay",
            report_type: "group",
            cases: [
                createReportCase("로그인 모달 오버레이에서 바깥 클릭 닫힘이 시안과 달라요.", {
                    id: C.lw,
                    created_at: todayIso(),
                }),
            ],
            field_values: seedFields("[모달 · 로그인 overlay · 1 · 대기] 초기 접수"),
            position: modalAnchorPosition("demo-modal-login-overlay", "group", "demo-modal-login", 0, 0.4),
            created_at: todayIso(),
        }),
    ];
}

export function createDemoInvestFeedbackSeed(): ReportFeedback[] {
    return [
        ...createHomeSeeds(),
        ...createFeedSeeds(),
        ...createScreenerSeeds(),
        ...createIndicesSeeds(),
        ...createSigninSeeds(),
        ...createModalSeeds(),
    ];
}

export const DEMO_INVEST_FEEDBACK_SEED_IDS = createDemoInvestFeedbackSeed().map((item) => item.id);

export const DEMO_INVEST_FEEDBACK_SEED_CATALOG: DemoSeedCatalogEntry[] = [
    { id: "home-seed-open-wait", label: "홈 · 대기", summary: "1케이스 초기 접수" },
    { id: "home-seed-story-happy-multi", label: "홈 · 해피패스", summary: "4케이스 전원 해결" },
    { id: "home-seed-story-deny-loop", label: "홈 · 다중 반려", summary: "5케이스 거절 루프 후 해결" },
    { id: "home-seed-open-ask-mixed", label: "홈 · Ask 혼합", summary: "3케이스 질문/확인/담당" },
    { id: "home-seed-story-transfer", label: "홈 · 이관", summary: "4케이스 FE↔BE" },
    { id: "home-seed-open-mention", label: "홈 · 태그", summary: "3케이스 멘션" },
    { id: "home-seed-open-diverged", label: "홈 · 6분기", summary: "케이스별 다른 진행" },
    { id: "feed-seed-open-wait", label: "피드 · 대기", summary: "1케이스 초기 접수" },
    { id: "feed-seed-story-deny-recheck", label: "피드 · 거절의 거절", summary: "4케이스 왕복 후 해결" },
    { id: "feed-seed-story-triple-deny", label: "피드 · 삼중 거절", summary: "5케이스 거절×3 멈춤" },
    { id: "feed-seed-story-long-qa", label: "피드 · 장문 Q&A", summary: "4케이스 교차 후 해결" },
    { id: "feed-seed-open-recheck", label: "피드 · recheck", summary: "3케이스 오류 아님" },
    { id: "feed-seed-open-ask-cross", label: "피드 · Ask 교차", summary: "3케이스 FE↔BE" },
    { id: "feed-seed-open-confirm", label: "피드 · Confirm", summary: "1케이스 확인 요청" },
    { id: "screener-seed-open-wait", label: "골라보기 · 대기", summary: "1케이스 초기 접수" },
    { id: "screener-seed-story-deny-open", label: "골라보기 · 거절 진행", summary: "4케이스 재거절 open" },
    { id: "screener-seed-story-minimal-resolve", label: "골라보기 · 최소 해결", summary: "1케이스 담당→확인→해결" },
    { id: "screener-seed-story-transfer", label: "골라보기 · 이관", summary: "4케이스 프론트→백엔드" },
    { id: "screener-seed-open-mixed-6", label: "골라보기 · 6혼합", summary: "6케이스 분기" },
    { id: "screener-seed-open-confirm", label: "골라보기 · Confirm", summary: "3케이스 확인 요청" },
    { id: "indices-seed-open-wait", label: "지수 · 대기", summary: "1케이스 초기 접수" },
    { id: "indices-seed-story-happy", label: "지수 · 해피패스", summary: "3케이스 해결" },
    { id: "indices-seed-open-long-ask", label: "지수 · 장문 Ask", summary: "5케이스 질문만" },
    { id: "indices-seed-story-denied", label: "지수 · Denied", summary: "3케이스 거절 대기" },
    { id: "indices-seed-story-double-xfer", label: "지수 · 이관 2회", summary: "4케이스 QA→FE→BE" },
    { id: "indices-seed-open-mention", label: "지수 · 태그", summary: "3케이스 차트 멘션" },
    { id: "indices-seed-open-partial", label: "지수 · 부분 해결", summary: "4케이스 2해결/2진행" },
    { id: "signin-seed-open-wait", label: "로그인 · 대기", summary: "1케이스 초기 접수" },
    { id: "signin-seed-story-deny-approve", label: "로그인 · 거절→승인", summary: "4케이스 Denied 후 해결" },
    { id: "signin-seed-open-ask", label: "로그인 · Ask", summary: "3케이스 QA↔FE" },
    { id: "signin-seed-story-all-resolved", label: "로그인 · 전원 해결", summary: "5케이스 전부 해결" },
    { id: "signin-seed-story-transfer", label: "로그인 · 이관", summary: "3케이스 FE↔BE" },
    { id: "signin-seed-story-stuck", label: "로그인 · Denied", summary: "3케이스 거절 멈춤" },
    { id: "home-seed-modal-search-overlay", label: "모달 · 검색 overlay", summary: "4케이스 혼합" },
    { id: "home-seed-modal-search-body", label: "모달 · 검색 본문", summary: "3케이스 해피패스" },
    { id: "home-seed-modal-watchlist", label: "모달 · 관심종목", summary: "5케이스 이관·거절" },
    { id: "screener-seed-modal-filter", label: "모달 · 필터", summary: "6케이스 거절 루프" },
    { id: "feed-seed-modal-opinion", label: "모달 · 의견", summary: "3케이스 Ask" },
    { id: "home-seed-modal-login", label: "모달 · 로그인", summary: "4케이스 해결" },
    { id: "home-seed-modal-login-wait", label: "모달 · 로그인 대기", summary: "1케이스 초기 접수" },
];
