import { ModalDemoDialog, useModalDemo } from "../../../features/modals/model/ModalDemoContext";
import { useModalZustandStore } from "../../../features/modals/model/modalZustandStore";

function ModalCaseBadge({ label, className = "" }: { label: string; className?: string }) {
    return <span className={`modal-demo-badge ${className}`.trim()}>{label}</span>;
}

function OpacityModalCase() {
    const { isOpen, openModal, closeModal } = useModalDemo();
    const open = isOpen("opacity");

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
            <div className={`modal-demo-overlay ${open ? "modal-demo-overlay--interactive" : "modal-demo-overlay--hidden-opacity"}`} aria-hidden={!open}>
                <ModalDemoDialog title="Opacity 모달" description="이 영역에 피드백을 남긴 뒤 모달을 닫아보세요." targetId="modal-opacity-target" onClose={() => closeModal("opacity")}>
                    <p className="modal-demo-dialog__note">닫히면 이 패널은 opacity: 0 상태로 남습니다.</p>
                </ModalDemoDialog>
            </div>
        </section>
    );
}

function DisplayModalCase() {
    const { isOpen, openModal, closeModal } = useModalDemo();
    const open = isOpen("display");

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
            <div className="modal-demo-overlay" style={{ display: open ? "flex" : "none" }}>
                <ModalDemoDialog title="display:none 모달" description="닫으면 display가 none으로 바뀝니다." targetId="modal-display-target" onClose={() => closeModal("display")}>
                    <p className="modal-demo-dialog__note">타겟 요소는 DOM에 있지만 화면에 그려지지 않습니다.</p>
                </ModalDemoDialog>
            </div>
        </section>
    );
}

function ConditionalModalCase() {
    const { isOpen, openModal, closeModal } = useModalDemo();
    const open = isOpen("conditional");

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
            {open ? (
                <div className="modal-demo-overlay modal-demo-overlay--interactive">
                    <ModalDemoDialog title="조건부 렌더 모달" description="닫으면 이 컴포넌트 트리가 DOM에서 사라집니다." targetId="modal-conditional-target" onClose={() => closeModal("conditional")}>
                        <p className="modal-demo-dialog__note">locate 시 onRevealTarget이 모달을 다시 마운트합니다.</p>
                    </ModalDemoDialog>
                </div>
            ) : null}
        </section>
    );
}

function VisibilityModalCase() {
    const { isOpen, openModal, closeModal } = useModalDemo();
    const open = isOpen("visibility");

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
            <div className={`modal-demo-overlay ${open ? "modal-demo-overlay--interactive" : "modal-demo-overlay--hidden-visibility"}`} aria-hidden={!open}>
                <ModalDemoDialog title="visibility:hidden 모달" description="닫히면 visibility가 hidden으로 유지됩니다." targetId="modal-visibility-target" onClose={() => closeModal("visibility")}>
                    <p className="modal-demo-dialog__note">opacity와 달리 visibility만 변경하는 케이스입니다.</p>
                </ModalDemoDialog>
            </div>
        </section>
    );
}

function OffscreenModalCase() {
    const { isOpen, openModal, closeModal } = useModalDemo();
    const open = isOpen("offscreen");

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
            <div className={`modal-demo-overlay ${open ? "modal-demo-overlay--interactive" : "modal-demo-overlay--hidden-offscreen"}`} aria-hidden={!open}>
                <ModalDemoDialog title="Off-screen 모달" description="닫히면 transform으로 화면 밖으로 이동합니다." targetId="modal-offscreen-target" onClose={() => closeModal("offscreen")}>
                    <p className="modal-demo-dialog__note">DOM에는 남아 있지만 시각적으로 보이지 않습니다.</p>
                </ModalDemoDialog>
            </div>
        </section>
    );
}

function ZustandModalCase() {
    const isOpen = useModalZustandStore((state) => state.isOpen);
    const open = useModalZustandStore((state) => state.open);
    const close = useModalZustandStore((state) => state.close);

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
            {isOpen ? (
                <div className="modal-demo-overlay modal-demo-overlay--interactive">
                    <ModalDemoDialog title="Zustand 모달" description="닫으면 store의 isOpen이 false가 되며 언마운트됩니다." targetId="modal-zustand-target" onClose={close}>
                        <p className="modal-demo-dialog__note">locate 시 modalRevealRegistry → revealZustandModal 순서로 복구됩니다.</p>
                    </ModalDemoDialog>
                </div>
            ) : null}
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
