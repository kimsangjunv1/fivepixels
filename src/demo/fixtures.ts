import type { ReportLocale } from "@/shared/i18n/types.js";
import type { MarkerShape } from "@/shared/constants/markerAppearance.js";
import type { FivePixelsDemoScene } from "./types.js";

export type DemoCopy = {
    localeLabel: string;
    close: string;
    minimize: string;
    maximize: string;
    marker: {
        title: string;
        category: string;
        author: string;
        age: string;
        score: string;
    };
    composer: {
        placeholder: string;
        caseLabel: string;
        categoryLabel: string;
        categories: string[];
        send: string;
    };
    panel: {
        activity: string;
        created: string;
        replied: string;
        assigned: string;
        currentPage: string;
        network: string;
        today: string;
        yesterday: string;
        statuses: string[];
        project: string;
        environment: string;
    };
    inspector: {
        recent: string[];
        tag: string;
        size: string;
        display: string;
        padding: string;
        margin: string;
        reportId: string;
        edit: string;
        reset: string;
        color: string;
        spacing: string;
    };
    device: {
        title: string;
        url: string;
        go: string;
        previewTitle: string;
        cards: string[];
    };
    thread: {
        title: string;
        unassigned: string;
        newCase: string;
        share: string;
        askAi: string;
        caseLabel: string;
        score: string;
        message: string;
        reply: string;
        replyPlaceholder: string;
        delete: string;
        creator: string;
        mine: string;
        status: string;
    };
    settings: {
        title: string;
        appearance: string;
        markerShape: string;
        markerSize: string;
        themeOptions: string[];
        shapeLabels: Record<MarkerShape, string>;
        sizes: string[];
    };
    notifications: {
        editMode: string;
        reset: string;
        undo: string;
        redo: string;
        networkError: string;
        retry: string;
        hiddenMarkers: string;
        show: string;
        activity: string;
        activityItems: string[];
    };
};

const COPY: Record<ReportLocale, DemoCopy> = {
    ko: {
        localeLabel: "데모 언어",
        close: "닫기",
        minimize: "최소화",
        maximize: "최대화",
        marker: { title: "결제 버튼 문구를 더 명확하게", category: "확인 요청", author: "김상준", age: "4일 전", score: "이슈 점수" },
        composer: {
            placeholder: "두번째 피드백 남겨주세요",
            caseLabel: "케이스 1번째",
            categoryLabel: "카테고리",
            categories: ["답변 대기", "추가 질문", "확인 요청", "오류 발견"],
            send: "피드백 보내기",
        },
        panel: {
            activity: "내 모든 활동",
            created: "생성",
            replied: "답변",
            assigned: "담당",
            currentPage: "현재 페이지",
            network: "네트워크",
            today: "오늘",
            yesterday: "어제",
            statuses: ["이슈 점수", "답변 대기", "추가 질문", "확인 요청", "오류 발견", "Git Issued", "해결됨"],
            project: "fivepixels-demo",
            environment: "STAGED",
        },
        inspector: {
            recent: ["필터 칩 제거 시 이전 결과 유지", "투자위험 숨기기 토글 상태 확인", "지역 탭 전환 시 스크롤 위치 유지"],
            tag: "태그",
            size: "크기",
            display: "display",
            padding: "padding",
            margin: "margin",
            reportId: "data-report-id",
            edit: "수정하기",
            reset: "원래대로",
            color: "배경 색상",
            spacing: "안쪽 여백",
        },
        device: {
            title: "iPhone 14 (390×844)",
            url: "https://demo.fivepixels.dev",
            go: "이동",
            previewTitle: "모바일 QA 미리보기",
            cards: ["가입 전환율", "미해결 피드백", "오늘의 리뷰"],
        },
        thread: {
            title: "결제 버튼 문구를 더 명확하게",
            unassigned: "아직 배정된 담당자가 없습니다",
            newCase: "새 케이스",
            share: "공유",
            askAi: "Ask AI",
            caseLabel: "케이스 1",
            score: "이슈 점수",
            message: "버튼만 보고도 다음 단계가 무엇인지 알 수 있게 바꿔주세요.",
            reply: "‘결제 계속하기’로 변경하고 모바일 화면도 확인했습니다.",
            replyPlaceholder: "답변을 입력하세요",
            delete: "삭제",
            creator: "생성자",
            mine: "MY",
            status: "확인 요청",
        },
        settings: {
            title: "화면 설정",
            appearance: "테마",
            markerShape: "마커 모양",
            markerSize: "마커 크기",
            themeOptions: ["라이트", "다크", "시스템"],
            shapeLabels: {
                circle: "원",
                square: "사각형",
                cookie4: "쿠키 4",
                sunny: "해",
                cookie6: "쿠키 6",
                clover4: "클로버",
                flower: "꽃",
                ghostish: "고스트",
                bun: "번",
                gem: "젬",
                pill: "필",
                pentagon: "오각형",
                puffy: "퍼피",
            },
            sizes: ["작게", "보통", "크게"],
        },
        notifications: {
            editMode: "현재 UI Edit 모드 적용 중",
            reset: "초기화",
            undo: "실행 취소",
            redo: "다시 실행",
            networkError: "데이터를 불러오지 못했습니다.",
            retry: "다시 시도",
            hiddenMarkers: "숨겨진 마커가 3개 있습니다.",
            show: "표시",
            activity: "최근 알림",
            activityItems: ["김지윤님이 답변을 남겼습니다.", "케이스가 확인 요청으로 변경됐습니다.", "GitHub Issue #124가 생성됐습니다."],
        },
    },
    en: {
        localeLabel: "Demo language",
        close: "Close",
        minimize: "Minimize",
        maximize: "Maximize",
        marker: { title: "Make the payment button clearer", category: "Review requested", author: "Alex Kim", age: "4 days ago", score: "Issue score" },
        composer: {
            placeholder: "Leave another piece of feedback",
            caseLabel: "Case 1",
            categoryLabel: "Category",
            categories: ["Waiting for reply", "Follow-up", "Review requested", "Bug found"],
            send: "Send feedback",
        },
        panel: {
            activity: "All my activity",
            created: "Created",
            replied: "Replied",
            assigned: "Assigned",
            currentPage: "Current page",
            network: "Network",
            today: "Today",
            yesterday: "Yesterday",
            statuses: ["Issue score", "Waiting for reply", "Follow-up", "Review requested", "Bug found", "Git Issued", "Resolved"],
            project: "fivepixels-demo",
            environment: "STAGED",
        },
        inspector: {
            recent: ["Keep results after removing filter chip", "Verify risk toggle state", "Keep scroll position on tab change"],
            tag: "Tag",
            size: "Size",
            display: "display",
            padding: "padding",
            margin: "margin",
            reportId: "data-report-id",
            edit: "Edit UI",
            reset: "Reset",
            color: "Background",
            spacing: "Padding",
        },
        device: {
            title: "iPhone 14 (390×844)",
            url: "https://demo.fivepixels.dev",
            go: "Go",
            previewTitle: "Mobile QA preview",
            cards: ["Signup conversion", "Open feedback", "Today's reviews"],
        },
        thread: {
            title: "Make the payment button clearer",
            unassigned: "No assignee yet",
            newCase: "New case",
            share: "Share",
            askAi: "Ask AI",
            caseLabel: "Case 1",
            score: "Issue score",
            message: "Please make the next step clear from the button label alone.",
            reply: "Changed it to ‘Continue to payment’ and verified the mobile layout.",
            replyPlaceholder: "Write a reply",
            delete: "Delete",
            creator: "Creator",
            mine: "MY",
            status: "Review requested",
        },
        settings: {
            title: "Appearance settings",
            appearance: "Theme",
            markerShape: "Marker shape",
            markerSize: "Marker size",
            themeOptions: ["Light", "Dark", "System"],
            shapeLabels: {
                circle: "Circle",
                square: "Square",
                cookie4: "Cookie 4",
                sunny: "Sunny",
                cookie6: "Cookie 6",
                clover4: "Clover",
                flower: "Flower",
                ghostish: "Ghost",
                bun: "Bun",
                gem: "Gem",
                pill: "Pill",
                pentagon: "Pentagon",
                puffy: "Puffy",
            },
            sizes: ["Small", "Medium", "Large"],
        },
        notifications: {
            editMode: "UI Edit mode is active",
            reset: "Reset",
            undo: "Undo",
            redo: "Redo",
            networkError: "Could not load data.",
            retry: "Try again",
            hiddenMarkers: "3 markers are hidden.",
            show: "Show",
            activity: "Recent notifications",
            activityItems: ["Jiyoon Kim left a reply.", "The case changed to review requested.", "GitHub Issue #124 was created."],
        },
    },
};

export const DEMO_SCENE_SIZE: Record<FivePixelsDemoScene, { width: number; height: number }> = {
    "marker-tooltip": { width: 380, height: 230 },
    "feedback-composer": { width: 430, height: 300 },
    "panel-overview": { width: 390, height: 540 },
    "element-inspector": { width: 410, height: 455 },
    "device-preview": { width: 420, height: 620 },
    "feedback-thread": { width: 680, height: 520 },
    settings: { width: 480, height: 530 },
    notifications: { width: 440, height: 360 },
};

export function getDemoCopy(locale: ReportLocale): DemoCopy {
    return COPY[locale];
}
