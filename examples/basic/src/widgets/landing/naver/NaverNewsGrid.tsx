import { newsCards } from "./data";

export function NaverNewsGrid() {
    return (
        <section className="naver-news" data-report-id="naver-news" data-report-type="group">
            <div className="naver-news__inner">
                <h2 className="naver-news__title" data-report-id="naver-news-title" data-report-type="item">
                    We the Navigators
                </h2>
                <div className="naver-news__grid">
                    {newsCards.map((card) => (
                        <article
                            key={card.id}
                            className="naver-news-card"
                            data-report-id={card.id}
                            data-report-type="item"
                        >
                            <div className={`naver-news-card__thumb naver-news-card__thumb--${card.tone}`} aria-hidden="true" />
                            <div className="naver-news-card__body">
                                <p className="naver-news-card__meta">
                                    <span>{card.category}</span>
                                    <span>{card.date}</span>
                                </p>
                                <h3 className="naver-news-card__title">{card.title}</h3>
                                <p className="naver-news-card__excerpt">{card.excerpt}</p>
                            </div>
                        </article>
                    ))}
                </div>
                <div className="naver-news__actions">
                    <button
                        className="naver-btn naver-btn--dark"
                        type="button"
                        data-report-id="naver-news-more"
                        data-report-type="item"
                    >
                        더보기 (20/254)
                    </button>
                    <button
                        className="naver-btn naver-btn--outline"
                        type="button"
                        data-report-id="naver-newsletter"
                        data-report-type="item"
                    >
                        뉴스레터 구독하기
                    </button>
                </div>
            </div>
        </section>
    );
}
