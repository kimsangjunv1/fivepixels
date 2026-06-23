import { Link } from "react-router-dom";

import { usePricingProvider } from "../../../features/pricing/model/PricingContext";

export function PlanCards() {
    const { plans, billingNote } = usePricingProvider();

    return (
        <section className="pricing-section" data-report-id="pricing-plans" data-report-type="group">
            <header className="section-header">
                <span className="section-badge">group target</span>
                <h2>팀 규모에 맞는 요금제</h2>
                <p>{billingNote}</p>
            </header>
            <div className="plan-grid">
                {plans.map((plan) => (
                    <article
                        key={plan.id}
                        className={plan.featured ? "plan-card plan-card--featured" : "plan-card"}
                        data-report-id={plan.id}
                        data-report-type="item"
                    >
                        <span className="section-badge">item target</span>
                        <h3>{plan.name}</h3>
                        <p className="plan-price">
                            <strong>{plan.price}</strong>
                            <span>{plan.period}</span>
                        </p>
                        <p className="plan-description">{plan.description}</p>
                        <ul className="plan-highlights">
                            {plan.highlights.map((highlight) => (
                                <li key={highlight}>{highlight}</li>
                            ))}
                        </ul>
                        <button
                            className={plan.featured ? "primary-button" : "ghost-button"}
                            type="button"
                            data-report-id={`${plan.id}-cta`}
                            data-report-type="item"
                        >
                            {plan.cta}
                        </button>
                    </article>
                ))}
            </div>
        </section>
    );
}

export function FeatureComparison() {
    const { comparison } = usePricingProvider();

    return (
        <section className="comparison-section" data-report-id="pricing-comparison" data-report-type="group">
            <header className="section-header">
                <span className="section-badge">group target</span>
                <h2>플랜별 기능 비교</h2>
                <p>세부 기능 차이를 한눈에 확인하고 문의가 필요하면 contact 페이지로 이동하세요.</p>
            </header>
            <div className="comparison-table" role="table">
                <div className="comparison-row comparison-row--head" role="row">
                    <span role="columnheader">기능</span>
                    <span role="columnheader">Free</span>
                    <span role="columnheader">Pro</span>
                    <span role="columnheader">Team</span>
                </div>
                {comparison.map((row) => (
                    <div
                        key={row.id}
                        className="comparison-row"
                        role="row"
                        data-report-id={row.id}
                        data-report-type="item"
                    >
                        <span role="cell">{row.label}</span>
                        <span role="cell">{row.free}</span>
                        <span role="cell">{row.pro}</span>
                        <span role="cell">{row.team}</span>
                    </div>
                ))}
            </div>
            <div className="comparison-footer">
                <Link
                    className="text-button"
                    to="/contact"
                    data-report-id="pricing-comparison-contact"
                    data-report-type="item"
                >
                    맞춤 견적 문의하기
                </Link>
            </div>
        </section>
    );
}
