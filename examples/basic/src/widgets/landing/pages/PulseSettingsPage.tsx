import { useModalDemo } from "../../../features/modals/model/ModalDemoContext";
import { useModalZustandStore } from "../../../features/modals/model/modalZustandStore";

function ModalCaseBadge({ label, className = "" }: { label: string; className?: string }) {
    return <span className={`modal-demo-badge ${className}`.trim()}>{label}</span>;
}

function OpacityModalCase() {
    const { openModal } = useModalDemo();

    return (
        <section className="modal-demo-card" data-report-id="modal-opacity-demo" data-report-type="group">
            <header className="section-header">
                <ModalCaseBadge label="opacity: 0" />
                <h3>Opacity로 숨기는 모달</h3>
                <p>닫힌 뒤 locate하면 onRevealTarget으로 opacity가 복구됩니다.</p>
            </header>
            <button type="button" className="primary-button" data-report-id="modal-opacity-open" data-report-type="item" onClick={() => openModal("opacity")}>
                모달 열기
            </button>
        </section>
    );
}

function DisplayModalCase() {
    const { openModal } = useModalDemo();

    return (
        <section className="modal-demo-card" data-report-id="modal-display-demo" data-report-type="group">
            <header className="section-header">
                <ModalCaseBadge label="display: none" />
                <h3>display:none 모달</h3>
                <p>getBoundingClientRect()가 0×0이 되어 detached로 처리됩니다.</p>
            </header>
            <button type="button" className="primary-button" data-report-id="modal-display-open" data-report-type="item" onClick={() => openModal("display")}>
                모달 열기
            </button>
        </section>
    );
}

function ConditionalModalCase() {
    const { openModal } = useModalDemo();

    return (
        <section className="modal-demo-card" data-report-id="modal-conditional-demo" data-report-type="group">
            <header className="section-header">
                <ModalCaseBadge label="conditional render" />
                <h3>조건부 렌더링 모달</h3>
                <p>닫으면 React state에 따라 모달 전체가 언마운트됩니다.</p>
            </header>
            <button type="button" className="primary-button" data-report-id="modal-conditional-open" data-report-type="item" onClick={() => openModal("conditional")}>
                모달 열기
            </button>
        </section>
    );
}

function VisibilityModalCase() {
    const { openModal } = useModalDemo();

    return (
        <section className="modal-demo-card" data-report-id="modal-visibility-demo" data-report-type="group">
            <header className="section-header">
                <ModalCaseBadge label="visibility: hidden" />
                <h3>visibility:hidden 모달</h3>
                <p>opacity와 별도로 visibility만 변경하는 케이스입니다.</p>
            </header>
            <button type="button" className="primary-button" data-report-id="modal-visibility-open" data-report-type="item" onClick={() => openModal("visibility")}>
                모달 열기
            </button>
        </section>
    );
}

function OffscreenModalCase() {
    const { openModal } = useModalDemo();

    return (
        <section className="modal-demo-card" data-report-id="modal-offscreen-demo" data-report-type="group">
            <header className="section-header">
                <ModalCaseBadge label="transform off-screen" />
                <h3>화면 밖 transform 모달</h3>
                <p>닫히면 translateX로 뷰포트 밖으로 이동합니다.</p>
            </header>
            <button type="button" className="primary-button" data-report-id="modal-offscreen-open" data-report-type="item" onClick={() => openModal("offscreen")}>
                모달 열기
            </button>
        </section>
    );
}

function ZustandModalCase() {
    const open = useModalZustandStore((state) => state.open);

    return (
        <section className="modal-demo-card" data-report-id="modal-zustand-demo" data-report-type="group">
            <header className="section-header">
                <ModalCaseBadge label="zustand boolean" className="modal-demo-badge--zustand" />
                <h3>Zustand store 모달</h3>
                <p>onRevealTarget에서는 getState().open()만 호출해 복구합니다.</p>
            </header>
            <button type="button" className="primary-button" data-report-id="modal-zustand-open" data-report-type="item" onClick={open}>
                모달 열기
            </button>
        </section>
    );
}

export function PulseSettingsPage() {
    return (
        <section className="pulse-page-section pulse-settings-lab" data-report-id="pulse-settings-page" data-report-type="group">
            <header className="pulse-page-section__header">
                <h2 className="pulse-page-section__title">Settings · Modal QA Lab</h2>
                <p className="pulse-page-section__desc">다양한 숨김 방식의 모달을 열고 피드백을 남긴 뒤, 닫고 detached 마커 복원을 테스트하세요.</p>
            </header>
            <div className="pulse-settings-lab__grid">
                <OpacityModalCase />
                <DisplayModalCase />
                <ConditionalModalCase />
                <VisibilityModalCase />
                <OffscreenModalCase />
                <ZustandModalCase />
            </div>
        </section>
    );
}
