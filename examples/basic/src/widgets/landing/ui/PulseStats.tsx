import { useLandingProvider } from "../../../features/landing/model/LandingContext";

const metaClass: Record<string, string> = {
    up: "pulse-stat-card__meta--up",
    info: "pulse-stat-card__meta--info",
    success: "pulse-stat-card__meta--success",
};

export function PulseStats() {
    const { stats } = useLandingProvider();

    return (
        <section className="pulse-stats" data-fp-id="pulse-stats" data-fp-type="group">
            {stats.map((stat) => (
                <article
                    key={stat.id}
                    className="pulse-stat-card"
                    data-fp-id={stat.id}
                    data-fp-type="item"
                >
                    <p className="pulse-stat-card__label">{stat.label}</p>
                    <p className="pulse-stat-card__value">{stat.value}</p>
                    <p className={`pulse-stat-card__meta ${metaClass[stat.metaTone]}`}>{stat.meta}</p>
                </article>
            ))}
        </section>
    );
}
