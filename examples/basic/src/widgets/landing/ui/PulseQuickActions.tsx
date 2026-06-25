import { Link } from "react-router-dom";

import { useModalDemo } from "../../../features/modals/model/ModalDemoContext";
import { useModalZustandStore } from "../../../features/modals/model/modalZustandStore";

const modalCases = [
    { key: "opacity" as const, label: "opacity" },
    { key: "display" as const, label: "display:none" },
    { key: "visibility" as const, label: "hidden" },
    { key: "conditional" as const, label: "conditional" },
    { key: "offscreen" as const, label: "off-screen" },
];

export function PulseQuickActions() {
    const { openModal } = useModalDemo();
    const openZustand = useModalZustandStore((state) => state.open);

    return (
        <section className="pulse-panel" data-report-id="pulse-quick-actions" data-report-type="group">
            <header className="pulse-panel__header">Quick actions</header>
            <div className="pulse-quick-actions">
                <p className="pulse-quick-actions__desc">
                    Create issues, export reports, or open scroll and modal demos for fivepixels feedback testing.
                </p>
                <div className="pulse-quick-actions__buttons">
                    <button
                        type="button"
                        className="pulse-btn pulse-btn--primary"
                        data-report-id="pulse-action-new-issue"
                        data-report-type="item"
                    >
                        New issue
                    </button>
                    <button
                        type="button"
                        className="pulse-btn pulse-btn--secondary"
                        data-report-id="pulse-action-export"
                        data-report-type="item"
                    >
                        Export report
                    </button>
                    <Link
                        to="/issues"
                        className="pulse-btn pulse-btn--blue"
                        data-report-id="pulse-action-list"
                        data-report-type="item"
                    >
                        Go to Issues
                        <span className="pulse-btn__arrow" aria-hidden>
                            →
                        </span>
                    </Link>
                    <Link
                        to="/settings"
                        className="pulse-btn pulse-btn--purple"
                        data-report-id="pulse-action-modals-page"
                        data-report-type="item"
                    >
                        Go to Modal Lab
                        <span className="pulse-btn__arrow" aria-hidden>
                            →
                        </span>
                    </Link>
                </div>

                <div className="pulse-modal-picker" data-report-id="pulse-modal-picker" data-report-type="group">
                    <p className="pulse-modal-picker__label">Open modal case</p>
                    <div className="pulse-modal-picker__grid">
                        {modalCases.map((item) => (
                            <button
                                key={item.key}
                                type="button"
                                className="pulse-modal-picker__btn"
                                data-report-id={`pulse-open-modal-${item.key}`}
                                data-report-type="item"
                                onClick={() => openModal(item.key)}
                            >
                                {item.label}
                            </button>
                        ))}
                        <button
                            type="button"
                            className="pulse-modal-picker__btn pulse-modal-picker__btn--zustand"
                            data-report-id="pulse-open-modal-zustand"
                            data-report-type="item"
                            onClick={openZustand}
                        >
                            zustand
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
}
