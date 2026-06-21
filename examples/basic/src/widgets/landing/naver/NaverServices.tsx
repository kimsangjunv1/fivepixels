import { serviceCards } from "./data";

export function NaverServices() {
    return (
        <section className="naver-services" data-report-id="naver-services" data-report-type="group">
            <div className="naver-services__inner">
                <h2 className="naver-services__title" data-report-id="naver-services-title" data-report-type="item">
                    주요 서비스와 기술 요약
                </h2>
                <div className="naver-services__grid">
                    {serviceCards.map((card) => (
                        <article
                            key={card.id}
                            className={`naver-service-card naver-service-card--${card.tone}`}
                            data-report-id={card.id}
                            data-report-type="item"
                        >
                            <div className="naver-service-card__visual" aria-hidden="true" />
                            <div className="naver-service-card__body">
                                <h3>{card.title}</h3>
                                <p>{card.description}</p>
                            </div>
                        </article>
                    ))}
                </div>
            </div>
        </section>
    );
}
