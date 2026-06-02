import { Link } from "react-router-dom";

import { useLandingProvider } from "../../../features/landing/model/LandingContext";

export function HeroIntro() {
    const { heroActions } = useLandingProvider();

    return (
        <section className="hero-card" data-report-id="landing-hero" data-report-type="group">
            <span className="section-badge">group target</span>
            <h2>팀 피드백을 한곳에서 수집하세요</h2>
            <p>
                stitchable은 DOM 요소에 마커를 남기고 팀과 공유하는 피드백 라이브러리입니다. 랜딩, 요금, 문의
                페이지를 오가며 마커 복원을 확인해보세요.
            </p>
            <div className="hero-actions">
                {heroActions.map((action) => (
                    <button
                        key={action.id}
                        className={action.variant}
                        type="button"
                        data-report-id={action.id}
                        data-report-type="item"
                    >
                        {action.label}
                    </button>
                ))}
            </div>
        </section>
    );
}

export function FeatureGrid() {
    const { features } = useLandingProvider();

    return (
        <section className="feature-grid" data-report-id="landing-features" data-report-type="group">
            {features.map((feature) => (
                <article
                    key={feature.id}
                    className="feature-card"
                    data-report-id={feature.id}
                    data-report-type="item"
                >
                    <span className="section-badge">item target</span>
                    <h3>{feature.title}</h3>
                    <p>{feature.description}</p>
                    <button
                        className="text-button"
                        type="button"
                        data-report-id={`${feature.id}-cta`}
                        data-report-type="item"
                    >
                        {feature.cta}
                    </button>
                </article>
            ))}
        </section>
    );
}

export function BottomCta() {
    const { bottomCta } = useLandingProvider();

    return (
        <section className="bottom-cta" data-report-id={bottomCta.id} data-report-type="group">
            <div className="bottom-cta__copy">
                <span className="section-badge">group target</span>
                <h3>{bottomCta.title}</h3>
                <p>{bottomCta.description}</p>
            </div>
            <div className="bottom-cta__actions">
                <Link
                    className="primary-button"
                    to="/pricing"
                    data-report-id={`${bottomCta.id}-pricing`}
                    data-report-type="item"
                >
                    {bottomCta.primaryLabel}
                </Link>
                <Link
                    className="ghost-button"
                    to={bottomCta.secondaryPath}
                    data-report-id={`${bottomCta.id}-contact`}
                    data-report-type="item"
                >
                    {bottomCta.secondaryLabel}
                </Link>
            </div>
        </section>
    );
}
