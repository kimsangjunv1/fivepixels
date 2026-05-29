import { useBasicProvider } from "../../../features/basic/model/BasicContext";

export function FeatureGrid() {
    const { features } = useBasicProvider();

    return (
        <section className="feature-grid" data-report-id="feature-grid" data-report-type="group">
            {features.map((feature) => (
                <article key={feature.id} className="feature-card">
                    <span className="feature-label">item target</span>
                    <h3>{feature.title}</h3>
                    <p>{feature.description}</p>
                    <button
                        className="text-button"
                        type="button"
                        data-report-id={feature.id}
                        data-report-type="item"
                    >
                        {feature.cta}
                    </button>
                </article>
            ))}
        </section>
    );
}
