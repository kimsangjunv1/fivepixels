import { useLandingProvider } from "../../../features/landing/model/LandingContext";

const metaClass: Record<string, string> = {
    up: "pulse-stat-card__meta--up",
    info: "pulse-stat-card__meta--info",
    success: "pulse-stat-card__meta--success",
};

export function PulseStats() {
    const { stats } = useLandingProvider();

    return (
        <section className="pulse-stats" data-report-id="pulse-stats" data-report-type="group">
            {stats.map((stat) => (
                <article
                    key={stat.id}
                    className="pulse-stat-card"
                    data-report-id={stat.id}
                    data-report-type="item"
                >
                    <p className="pulse-stat-card__label">{stat.label}</p>
                    <p className="pulse-stat-card__value">{stat.value}</p>
                    <p className={`pulse-stat-card__meta ${metaClass[stat.metaTone]}`}>{stat.meta}</p>
                </article>
            ))}
        </section>
    );
}
