type EdgecaseItem = {
    id: string;
    title: string;
    description: string;
    tagged: boolean;
    reportType?: "group" | "item";
};

const edgecaseItems: EdgecaseItem[] = [
    {
        id: "edge-hero-banner",
        title: "Hero banner",
        description: "data-report-id가 있는 상단 배너입니다. 피드백 추가로 바로 선택할 수 있어요.",
        tagged: true,
        reportType: "group",
    },
    {
        id: "edge-primary-cta",
        title: "Primary CTA",
        description: "태깅된 주요 버튼입니다.",
        tagged: true,
        reportType: "item",
    },
    {
        id: "edge-secondary-link",
        title: "Secondary link",
        description: "report id가 없습니다. 요소 선택 모드로 피드백을 남겨보세요.",
        tagged: false,
    },
    {
        id: "edge-metric-open",
        title: "Open issues metric",
        description: "태깅된 지표 카드입니다.",
        tagged: true,
        reportType: "item",
    },
    {
        id: "edge-metric-staged",
        title: "Staged feedback metric",
        description: "태깅되지 않은 지표 카드입니다.",
        tagged: false,
    },
    {
        id: "edge-warning-banner",
        title: "Warning banner",
        description: "경고 문구 블록 — selector만으로 추적해야 합니다.",
        tagged: false,
    },
    {
        id: "edge-search-field",
        title: "Filter input",
        description: "태깅된 입력 필드입니다.",
        tagged: true,
        reportType: "item",
    },
    {
        id: "edge-submit-action",
        title: "Submit action",
        description: "태깅되지 않은 제출 버튼입니다.",
        tagged: false,
    },
    {
        id: "edge-sidebar-note",
        title: "Sidebar note",
        description: "태깅된 안내 문구 블록입니다.",
        tagged: true,
        reportType: "item",
    },
    {
        id: "edge-footer-hint",
        title: "Footer hint",
        description: "하단 힌트 텍스트 — pick 모드 테스트용입니다.",
        tagged: false,
    },
];

function EdgecaseCard({ item }: { item: EdgecaseItem }) {
    const taggedProps = item.tagged
        ? {
              "data-report-id": item.id,
              "data-report-type": item.reportType ?? "item",
          }
        : {};

    return (
        <article className={`pulse-edgecase-card ${item.tagged ? "pulse-edgecase-card--tagged" : "pulse-edgecase-card--untagged"}`} {...taggedProps}>
            <div className="pulse-edgecase-card__meta">
                <span className={`pulse-edgecase-card__badge ${item.tagged ? "pulse-edgecase-card__badge--tagged" : "pulse-edgecase-card__badge--untagged"}`}>
                    {item.tagged ? "data-report-id" : "no report id"}
                </span>
                <code className="pulse-edgecase-card__id">{item.tagged ? item.id : "—"}</code>
            </div>
            <h3 className="pulse-edgecase-card__title">{item.title}</h3>
            <p className="pulse-edgecase-card__desc">{item.description}</p>
            {item.tagged ? (
                <button type="button" className="pulse-edgecase-card__action pulse-edgecase-card__action--tagged">
                    Tagged action
                </button>
            ) : (
                <button type="button" className="pulse-edgecase-card__action pulse-edgecase-card__action--untagged">
                    Untagged action
                </button>
            )}
        </article>
    );
}

export function PulseEdgecasePage() {
    const taggedCount = edgecaseItems.filter((item) => item.tagged).length;
    const untaggedCount = edgecaseItems.length - taggedCount;

    return (
        <section className="pulse-page-section pulse-edgecase-page">
            <header className="pulse-page-section__header">
                <h2 className="pulse-page-section__title">Edgecase · Report ID Mix</h2>
                <p className="pulse-page-section__desc">
                    이 페이지는 요소 {edgecaseItems.length}개 중 {taggedCount}개는 <code>data-report-id</code>가 있고, {untaggedCount}개는 없습니다. 피드백 추가 모드에서 hover 시 보라색 하이라이트와 라벨로 태깅 여부를 확인해 보세요.
                </p>
            </header>

            <div className="pulse-edgecase-legend" aria-label="Legend">
                <span className="pulse-edgecase-legend__item pulse-edgecase-legend__item--tagged">Tagged ({taggedCount})</span>
                <span className="pulse-edgecase-legend__item pulse-edgecase-legend__item--untagged">Untagged ({untaggedCount})</span>
            </div>

            <div className="pulse-edgecase-grid">
                {edgecaseItems.map((item) => (
                    <EdgecaseCard key={item.id} item={item} />
                ))}
            </div>
        </section>
    );
}
