import { useBasicProvider } from "../../../features/basic/model/BasicContext";

export function HeroCard() {
    const { heroActions } = useBasicProvider();

    return (
        <section className="hero-card" data-report-id="hero" data-report-type="group">
            <span className="hero-badge">group target</span>
            <h2>팀 피드백을 수집하는 프로덕트 화면</h2>
            <p>카드 전체는 group, 각 액션은 item target으로 연결되어 마커 복원 동작을 함께 확인할 수 있습니다.</p>
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
