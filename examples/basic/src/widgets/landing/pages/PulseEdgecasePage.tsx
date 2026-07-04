type EdgecaseItem = {
    id: string;
    title: string;
    description: string;
    tagged: boolean;
    reportType?: "group" | "item";
};

type LayoutProbe = {
    id: string;
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

const layoutProbes: LayoutProbe[] = [
    { id: "edge-flex-toolbar", tagged: true, reportType: "group" },
    { id: "edge-flex-btn-primary", tagged: true, reportType: "item" },
    { id: "edge-flex-btn-secondary", tagged: false },
    { id: "edge-flex-btn-ghost", tagged: false },
    { id: "edge-flex-stack", tagged: false },
    { id: "edge-flex-stack-title", tagged: true, reportType: "item" },
    { id: "edge-flex-stack-body", tagged: false },
    { id: "edge-flex-nested", tagged: true, reportType: "group" },
    { id: "edge-flex-nested-chip", tagged: true, reportType: "item" },
    { id: "edge-flex-nested-note", tagged: false },
    { id: "edge-grid-dashboard", tagged: true, reportType: "group" },
    { id: "edge-grid-cell-a", tagged: true, reportType: "item" },
    { id: "edge-grid-cell-b", tagged: false },
    { id: "edge-grid-cell-c", tagged: false },
    { id: "edge-grid-cell-span", tagged: true, reportType: "item" },
    { id: "edge-grid-nested", tagged: false },
    { id: "edge-grid-nested-flex", tagged: true, reportType: "group" },
    { id: "edge-grid-nested-pill", tagged: true, reportType: "item" },
    { id: "edge-grid-nested-caption", tagged: false },
];

function reportProps(probe: { id: string; tagged: boolean; reportType?: "group" | "item" }) {
    if (!probe.tagged) {
        return {};
    }

    return {
        "data-report-id": probe.id,
        "data-report-type": probe.reportType ?? "item",
    };
}

function layoutClass(tagged: boolean, base: string) {
    return `${base} ${tagged ? `${base}--tagged` : `${base}--untagged`}`;
}

function EdgecaseCard({ item }: { item: EdgecaseItem }) {
    return (
        <article className={layoutClass(item.tagged, "pulse-edgecase-card")} {...reportProps(item)}>
            <div className="pulse-edgecase-card__meta">
                <span className={layoutClass(item.tagged, "pulse-edgecase-card__badge")}>{item.tagged ? "data-report-id" : "no report id"}</span>
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

function EdgecaseFlexLayouts() {
    return (
        <div className="pulse-edgecase-layout-group">
            <h3 className="pulse-edgecase-layout-group__title">Flex layouts</h3>

            <div className="pulse-edgecase-layout-demo">
                <p className="pulse-edgecase-layout-demo__label">Row toolbar · display: flex</p>
                <div className="pulse-edgecase-flex-toolbar" {...reportProps({ id: "edge-flex-toolbar", tagged: true, reportType: "group" })}>
                    <button type="button" className="pulse-edgecase-flex-chip pulse-edgecase-flex-chip--tagged" {...reportProps({ id: "edge-flex-btn-primary", tagged: true, reportType: "item" })}>
                        Primary
                    </button>
                    <button type="button" className="pulse-edgecase-flex-chip pulse-edgecase-flex-chip--untagged">
                        Secondary
                    </button>
                    <span className="pulse-edgecase-flex-chip pulse-edgecase-flex-chip--ghost">Ghost link</span>
                </div>
            </div>

            <div className="pulse-edgecase-layout-demo">
                <p className="pulse-edgecase-layout-demo__label">Column stack · flex-direction: column</p>
                <div className="pulse-edgecase-flex-stack">
                    <strong className="pulse-edgecase-flex-stack__title" {...reportProps({ id: "edge-flex-stack-title", tagged: true, reportType: "item" })}>
                        Tagged title
                    </strong>
                    <p className="pulse-edgecase-flex-stack__body">Untagged body copy inside a flex column container.</p>
                </div>
            </div>

            <div className="pulse-edgecase-layout-demo">
                <p className="pulse-edgecase-layout-demo__label">Nested flex · flex inside flex</p>
                <div className="pulse-edgecase-flex-nested" {...reportProps({ id: "edge-flex-nested", tagged: true, reportType: "group" })}>
                    <div className="pulse-edgecase-flex-nested__row">
                        <span className="pulse-edgecase-flex-chip pulse-edgecase-flex-chip--tagged" {...reportProps({ id: "edge-flex-nested-chip", tagged: true, reportType: "item" })}>
                            Tagged chip
                        </span>
                        <span className="pulse-edgecase-flex-nested__note">Untagged note beside the chip</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

function EdgecaseGridLayouts() {
    return (
        <div className="pulse-edgecase-layout-group">
            <h3 className="pulse-edgecase-layout-group__title">Grid layouts</h3>

            <div className="pulse-edgecase-layout-demo">
                <p className="pulse-edgecase-layout-demo__label">2×2 dashboard · display: grid</p>
                <div className="pulse-edgecase-grid-board" {...reportProps({ id: "edge-grid-dashboard", tagged: true, reportType: "group" })}>
                    <div className="pulse-edgecase-grid-cell pulse-edgecase-grid-cell--tagged" {...reportProps({ id: "edge-grid-cell-a", tagged: true, reportType: "item" })}>
                        Tagged cell A
                    </div>
                    <div className="pulse-edgecase-grid-cell pulse-edgecase-grid-cell--untagged">Untagged cell B</div>
                    <div className="pulse-edgecase-grid-cell pulse-edgecase-grid-cell--untagged">Untagged cell C</div>
                    <div className="pulse-edgecase-grid-cell pulse-edgecase-grid-cell--tagged pulse-edgecase-grid-cell--span" {...reportProps({ id: "edge-grid-cell-span", tagged: true, reportType: "item" })}>
                        Tagged span · grid-column: span 2
                    </div>
                </div>
            </div>

            <div className="pulse-edgecase-layout-demo">
                <p className="pulse-edgecase-layout-demo__label">Grid + flex child · flex inside grid cell</p>
                <div className="pulse-edgecase-grid-board pulse-edgecase-grid-board--single">
                    <div className="pulse-edgecase-grid-cell pulse-edgecase-grid-cell--untagged pulse-edgecase-grid-cell--nested">
                        <div className="pulse-edgecase-grid-nested-flex" {...reportProps({ id: "edge-grid-nested-flex", tagged: true, reportType: "group" })}>
                            <span className="pulse-edgecase-flex-chip pulse-edgecase-flex-chip--tagged" {...reportProps({ id: "edge-grid-nested-pill", tagged: true, reportType: "item" })}>
                                Tagged pill
                            </span>
                            <span className="pulse-edgecase-grid-nested-flex__caption">Untagged caption in nested flex row</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export function PulseEdgecasePage() {
    const allProbes = [...edgecaseItems, ...layoutProbes];
    const taggedCount = allProbes.filter((item) => item.tagged).length;
    const untaggedCount = allProbes.length - taggedCount;

    return (
        <section className="pulse-page-section pulse-edgecase-page">
            <header className="pulse-page-section__header">
                <h2 className="pulse-page-section__title">Edgecase · Report ID Mix</h2>
                <p className="pulse-page-section__desc">
                    이 페이지는 요소 {allProbes.length}개 중 {taggedCount}개는 <code>data-report-id</code>가 있고, {untaggedCount}개는 없습니다. 카드뿐 아니라 flex·grid 레이아웃 요소에서도 피드백 추가 모드 hover 시 보라색 하이라이트와 라벨로 태깅 여부를 확인해 보세요.
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

            <div className="pulse-edgecase-layouts">
                <h3 className="pulse-edgecase-layouts__heading">Layout edgecases</h3>
                <p className="pulse-edgecase-layouts__desc">Flex·grid 컨테이너와 중첩 자식에서 요소 선택이 어떻게 동작하는지 검증합니다.</p>
                <EdgecaseFlexLayouts />
                <EdgecaseGridLayouts />
            </div>
        </section>
    );
}
