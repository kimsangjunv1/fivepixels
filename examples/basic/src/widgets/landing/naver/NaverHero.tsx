import { heroWidgets } from "./data";

export function NaverHero() {
    return (
        <section className="naver-hero" data-report-id="naver-hero" data-report-type="group">
            <div className="naver-hero__inner">
                <article className="naver-hero__feature" data-report-id="naver-hero-feature" data-report-type="item">
                    <div className="naver-hero__visual" aria-hidden="true">
                        <div className="naver-hero__phone naver-hero__phone--left" />
                        <div className="naver-hero__phone naver-hero__phone--center" />
                        <div className="naver-hero__phone naver-hero__phone--right" />
                    </div>
                    <div className="naver-hero__copy">
                        <p className="naver-hero__eyebrow">보도자료</p>
                        <h1 className="naver-hero__title">
                            NAVER의 초거대 AI 하이퍼클로바X, 사용자에게 먼저 말을 건네다
                        </h1>
                    </div>
                </article>
                <aside className="naver-hero__sidebar">
                    {heroWidgets.map((widget) => (
                        <button
                            key={widget.id}
                            className={`naver-hero__widget naver-hero__widget--${widget.tone}`}
                            type="button"
                            data-report-id={widget.id}
                            data-report-type="item"
                        >
                            <span className="naver-hero__widget-category">{widget.category}</span>
                            <span className="naver-hero__widget-title">{widget.title}</span>
                            <span className="naver-hero__widget-arrow" aria-hidden="true">
                                →
                            </span>
                        </button>
                    ))}
                </aside>
            </div>
        </section>
    );
}
