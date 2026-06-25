const listItems = Array.from({ length: 30 }, (_, index) => {
    const id = 1042 - index;
    const statuses = ["Open", "In Review", "Staged", "Resolved"] as const;
    const titles = [
        "Checkout button misaligned on mobile",
        "Update onboarding copy for trial users",
        "Focus ring missing on filter chips",
        "Contrast ratio on secondary buttons",
        "Empty state illustration off-brand",
        "Modal close button too small on tablet",
        "Avatar fallback initials style",
        "Search placeholder localization",
        "Sidebar collapse animation jitter",
        "Table header sticky offset fix",
    ];

    return {
        id: `ISS-${id}`,
        title: titles[index % titles.length],
        status: statuses[index % statuses.length],
    };
});

export function PulseIssuesPage() {
    return (
        <section className="pulse-page-section" data-report-id="pulse-issues-page" data-report-type="group">
            <header className="pulse-page-section__header">
                <h2 className="pulse-page-section__title">Issues</h2>
                <p className="pulse-page-section__desc">세로 스크롤이 있는 이슈 리스트입니다. 메인 컨텐츠 영역과 중첩 스크롤을 함께 테스트할 수 있습니다.</p>
            </header>
            <div className="pulse-list-scroll" data-report-id="pulse-list-scroll" data-report-type="group">
                {listItems.map((item) => (
                    <div
                        key={item.id}
                        className="pulse-list-item"
                        data-report-id={`list-item-${item.id}`}
                        data-report-type="item"
                    >
                        <span className="pulse-list-item__id">{item.id}</span>
                        <span className="pulse-list-item__title">{item.title}</span>
                        <span className="pulse-list-item__status">{item.status}</span>
                    </div>
                ))}
            </div>
        </section>
    );
}
