const releases = [
    { id: "rel-1.4.0", version: "v1.4.0", date: "Jun 20, 2026", status: "Staged", notes: "Modal reveal registry improvements and detached marker polish." },
    { id: "rel-1.3.2", version: "v1.3.2", date: "Jun 12, 2026", status: "Production", notes: "GitHub issue sync and feedback list UX updates." },
    { id: "rel-1.3.1", version: "v1.3.1", date: "Jun 5, 2026", status: "Production", notes: "Hotfix for coordinate fallback on unmounted targets." },
    { id: "rel-1.3.0", version: "v1.3.0", date: "May 28, 2026", status: "Production", notes: "Pulse board demo, kanban targets, and scroll edge cases." },
    { id: "rel-1.2.0", version: "v1.2.0", date: "May 14, 2026", status: "Archived", notes: "Initial fivepixels report stylesheet bundle." },
    { id: "rel-1.1.0", version: "v1.1.0", date: "Apr 30, 2026", status: "Archived", notes: "Shadow DOM marker layer and draft state hooks." },
    { id: "rel-1.0.0", version: "v1.0.0", date: "Apr 10, 2026", status: "Archived", notes: "First public release of @fivepixels-js/react." },
];

export function PulseReleasePage() {
    return (
        <section className="pulse-page-section" data-report-id="pulse-release-page" data-report-type="group">
            <header className="pulse-page-section__header">
                <h2 className="pulse-page-section__title">Releases</h2>
                <p className="pulse-page-section__desc">배포 타임라인 더미 데이터입니다. 릴리즈 노트와 상태 뱃지에 피드백을 남겨보세요.</p>
            </header>
            <div className="pulse-release-list" data-report-id="pulse-release-list" data-report-type="group">
                {releases.map((release) => (
                    <article
                        key={release.id}
                        className="pulse-release-item"
                        data-report-id={release.id}
                        data-report-type="item"
                    >
                        <div className="pulse-release-item__meta">
                            <span className="pulse-release-item__version">{release.version}</span>
                            <span className={`pulse-release-item__status pulse-release-item__status--${release.status.toLowerCase()}`}>
                                {release.status}
                            </span>
                        </div>
                        <p className="pulse-release-item__notes">{release.notes}</p>
                        <time className="pulse-release-item__date">{release.date}</time>
                    </article>
                ))}
            </div>
        </section>
    );
}
