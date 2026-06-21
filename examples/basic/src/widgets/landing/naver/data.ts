export const navLinks = [
    { id: "naver-nav-about", label: "회사소개" },
    { id: "naver-nav-services", label: "서비스" },
    { id: "naver-nav-values", label: "가치" },
    { id: "naver-nav-esg", label: "지속가능경영" },
    { id: "naver-nav-ir", label: "투자정보" },
    { id: "naver-nav-news", label: "뉴스룸" },
    { id: "naver-nav-careers", label: "채용" },
] as const;

export const heroWidgets = [
    {
        id: "naver-hero-esg",
        category: "지속가능경영",
        title: "2023년 통합보고서(ESG리포트)",
        tone: "light" as const,
    },
    {
        id: "naver-hero-ir",
        category: "투자정보",
        title: "2023년 3분기 실적발표",
        tone: "dark" as const,
    },
    {
        id: "naver-hero-careers",
        category: "채용",
        title: "당신의 가능성이 네이버의 기술이 됩니다",
        tone: "brand" as const,
    },
] as const;

export const newsCards = [
    {
        id: "naver-news-ai",
        category: "보도자료",
        date: "2023.09.20",
        title: "NAVER의 초거대 AI 하이퍼클로바X, 사용자에게 먼저 말을 건네다",
        excerpt: "AI 에이전트가 사용자의 의도를 먼저 파악하고 맞춤형 정보를 제안합니다.",
        tone: "yellow" as const,
    },
    {
        id: "naver-news-webtoon",
        category: "네이버 스토리",
        date: "2023.09.18",
        title: "NAVER WEBTOON, 글로벌 IP 확장을 위한 새로운 전략 발표",
        excerpt: "웹툰 IP를 기반으로 한 다양한 콘텐츠 확장 계획을 공유합니다.",
        tone: "green" as const,
    },
    {
        id: "naver-news-event",
        category: "보도자료",
        date: "2023.09.15",
        title: "2023 NAVER Developers Conference 개최",
        excerpt: "개발자 커뮤니티와 함께하는 기술 컨퍼런스가 성황리에 마무리되었습니다.",
        tone: "photo" as const,
    },
    {
        id: "naver-news-tech",
        category: "기술",
        date: "2023.09.12",
        title: "검색에서 탐색으로, On-Service AI 기술 로드맵 공개",
        excerpt: "서비스 전반에 AI를 적용하는 기술 전략과 비전을 소개합니다.",
        tone: "blue" as const,
    },
    {
        id: "naver-news-partner",
        category: "파트너",
        date: "2023.09.08",
        title: "스마트스토어 파트너 성장 프로그램 확대",
        excerpt: "중소상공인과 브랜드를 위한 지원 프로그램을 강화합니다.",
        tone: "purple" as const,
    },
    {
        id: "naver-news-culture",
        category: "네이버 스토리",
        date: "2023.09.05",
        title: "We the Navigators, 네이버의 새로운 기업 문화를 소개합니다",
        excerpt: "네비게이터들의 이야기와 네이버의 문화를 담은 콘텐츠입니다.",
        tone: "orange" as const,
    },
] as const;

export const serviceCards = [
    {
        id: "naver-service-ai",
        title: "검색에서 탐색으로 변화 On-Service AI",
        description: "AI 기술로 검색 경험을 넘어 탐색형 서비스로 진화합니다.",
        tone: "navy" as const,
    },
    {
        id: "naver-service-city",
        title: "도시와 연결되는 네이버의 기술",
        description: "지도, 모빌리티, 로컬 서비스를 아우르는 연결 경험.",
        tone: "city" as const,
    },
    {
        id: "naver-service-brand",
        title: "NAVER",
        description: "일상의 모든 순간을 연결하는 네이버의 서비스 생태계.",
        tone: "brand" as const,
    },
] as const;

export const partnerLinks = [
    { id: "naver-partner-ads", label: "네이버 광고주센터" },
    { id: "naver-partner-store", label: "스마트스토어센터" },
    { id: "naver-partner-place", label: "스마트플레이스" },
    { id: "naver-partner-cloud", label: "네이버 클라우드 플랫폼" },
    { id: "naver-partner-pay", label: "네이버페이" },
    { id: "naver-partner-dev", label: "네이버 개발자센터" },
] as const;

export const footerColumns = [
    {
        id: "naver-footer-about",
        title: "회사소개",
        links: ["기업정보", "인재채용", "투자정보", "지속가능경영"],
    },
    {
        id: "naver-footer-service",
        title: "서비스",
        links: ["네이버", "네이버페이", "네이버웹툰", "네이버클라우드"],
    },
    {
        id: "naver-footer-news",
        title: "뉴스룸",
        links: ["보도자료", "네이버 스토리", "미디어 행사", "뉴스레터"],
    },
    {
        id: "naver-footer-support",
        title: "고객지원",
        links: ["고객센터", "이용약관", "개인정보처리방침", "책임의 한계"],
    },
] as const;
