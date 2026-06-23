import { useLandingProvider } from "../../../features/landing/model/LandingContext";

export function PulseRecentActivity() {
    const { activities } = useLandingProvider();

    return (
        <section className="pulse-panel" data-report-id="pulse-activity" data-report-type="group">
            <header className="pulse-panel__header">Recent activity</header>
            <div className="pulse-panel__body">
                {activities.map((item) => (
                    <div key={item.id} className="pulse-activity__item" data-report-id={item.id} data-report-type="item">
                        <p className="pulse-activity__text">
                            <strong>{item.actor}</strong> {item.action}{" "}
                            <span className="pulse-activity__link" data-report-id={item.linkId} data-report-type="item">
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
