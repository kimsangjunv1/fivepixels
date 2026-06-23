const reviewColumns = [
    { id: "rev-col-design", title: "Design QA", width: 280 },
    { id: "rev-col-copy", title: "Copy review", width: 320 },
    { id: "rev-col-a11y", title: "Accessibility", width: 300 },
    { id: "rev-col-mobile", title: "Mobile layout", width: 340 },
    { id: "rev-col-perf", title: "Performance", width: 260 },
    { id: "rev-col-l10n", title: "Localization", width: 300 },
];

const reviewCards = Array.from({ length: 4 }, (_, row) =>
    reviewColumns.map((col, colIndex) => ({
        id: `review-${col.id}-${row}`,
        columnId: col.id,
        title: `${col.title} item #${row + 1}`,
        reviewer: ["Kim", "Lee", "Park", "Choi"][colIndex % 4],
    })),
).flat();

export function PulseReviewsPage() {
    return (
        <section className="pulse-page-section" data-report-id="pulse-reviews-page" data-report-type="group">
            <header className="pulse-page-section__header">
                <h2 className="pulse-page-section__title">Reviews</h2>
                <p className="pulse-page-section__desc">가로 스크롤 보드입니다. 좁은 뷰포트에서 horizontal overflow와 nested target을 테스트하세요.</p>
            </header>
            <div className="pulse-reviews-scroll" data-report-id="pulse-reviews-scroll" data-report-type="group">
                <div className="pulse-reviews-board">
                    {reviewColumns.map((column) => (
                        <div
                            key={column.id}
                            className="pulse-reviews-column"
                            style={{ minWidth: column.width }}
                            data-report-id={column.id}
                            data-report-type="group"
                        >
                            <header className="pulse-reviews-column__header">{column.title}</header>
                            <div className="pulse-reviews-column__cards">
                                {reviewCards
                                    .filter((card) => card.columnId === column.id)
                                    .map((card) => (
                                        <article
                                            key={card.id}
                                            className="pulse-reviews-card"
                                            data-report-id={card.id}
                                            data-report-type="item"
                                        >
                                            <h4>{card.title}</h4>
                                            <span>{card.reviewer}</span>
                                        </article>
                                    ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
