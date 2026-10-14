import { useLandingProvider } from "../../../features/landing/model/LandingContext";

export function PulseRecentActivity() {
    const { activities } = useLandingProvider();

    return (
        <section className="pulse-panel" data-fp-id="pulse-activity" data-fp-type="group">
            <header className="pulse-panel__header">Recent activity</header>
            <div className="pulse-panel__body">
                {activities.map((item) => (
                    <div key={item.id} className="pulse-activity__item" data-fp-id={item.id} data-fp-type="item">
                        <p className="pulse-activity__text">
                            <strong>{item.actor}</strong> {item.action}{" "}
                            <span className="pulse-activity__link" data-fp-id={item.linkId} data-fp-type="item">
                                {item.linkLabel}
                            </span>
                        </p>
                        <span className="pulse-activity__time">{item.time}</span>
                    </div>
                ))}
            </div>
        </section>
    );
}
