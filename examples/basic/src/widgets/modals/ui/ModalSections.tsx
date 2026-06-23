import { ModalDemoDialog, useModalDemo } from "../../../features/modals/model/ModalDemoContext";
import { useModalZustandStore } from "../../../features/modals/model/modalZustandStore";

function ModalCaseBadge({ label, className = "" }: { label: string; className?: string }) {
    return <span className={`modal-demo-badge ${className}`.trim()}>{label}</span>;
}

export function OpacityModalDemo() {
    const { isOpen, openModal, closeModal } = useModalDemo();
    const open = isOpen("opacity");

    return (
        <section
            className="modal-demo-card"
            data-report-id="modal-opacity-demo"
            data-report-type="group"
        >
            <header className="section-header">
                <ModalCaseBadge label="opacity: 0" />
                <h2>Opacity로 숨기는 모달</h2>
                <p>모달은 DOM에 남아 있지만 `opacity: 0`으로 보이지 않습니다. 닫힌 뒤 피드백을 locate하면 detached 마커와 `onRevealTarget` 동작을 확인할 수 있습니다.</p>
            </header>

            <button
                type="button"
                className="primary-button"
                data-report-id="modal-opacity-open"
                data-report-type="item"
                onClick={() => openModal("opacity")}
            >
                모달 열기
            </button>

            <div
                className={`modal-demo-overlay ${open ? "modal-demo-overlay--interactive" : "modal-demo-overlay--hidden-opacity"}`}
                aria-hidden={!open}
            >
                <ModalDemoDialog
                    title="Opacity 모달"
                    description="이 영역에 피드백을 남긴 뒤 모달을 닫아보세요."
                    targetId="modal-opacity-target"
                    onClose={() => closeModal("opacity")}
                >
                    <p className="modal-demo-dialog__note">닫히면 이 패널은 `opacity: 0` 상태로 남습니다.</p>
                </ModalDemoDialog>
            </div>
        </section>
    );
}

export function DisplayNoneModalDemo() {
    const { isOpen, openModal, closeModal } = useModalDemo();
    const open = isOpen("display");

    return (
        <section
            className="modal-demo-card"
            data-report-id="modal-display-demo"
            data-report-type="group"
        >
            <header className="section-header">
                <ModalCaseBadge label="display: none" />
                <h2>display:none 모달</h2>
                <p>오버레이는 마운트되어 있지만 `display: none`으로 레이아웃에서 제외됩니다. `getBoundingClientRect()`가 0×0이 되어 detached로 처리됩니다.</p>
            </header>

            <button
                type="button"
                className="primary-button"
                data-report-id="modal-display-open"
                data-report-type="item"
                onClick={() => openModal("display")}
            >
                모달 열기
            </button>

            <div
                className="modal-demo-overlay"
                style={{ display: open ? "flex" : "none" }}
            >
                <ModalDemoDialog
                    title="display:none 모달"
                    description="닫으면 display가 none으로 바뀝니다."
                    targetId="modal-display-target"
                    onClose={() => closeModal("display")}
                >
                    <p className="modal-demo-dialog__note">타겟 요소는 DOM에 있지만 화면에 그려지지 않습니다.</p>
                </ModalDemoDialog>
            </div>
        </section>
    );
}

export function ConditionalModalDemo() {
    const { isOpen, openModal, closeModal } = useModalDemo();
    const open = isOpen("conditional");

    return (
        <section
            className="modal-demo-card"
            data-report-id="modal-conditional-demo"
            data-report-type="group"
        >
            <header className="section-header">
                <ModalCaseBadge label="conditional render" />
                <h2>조건부 렌더링 모달</h2>
                <p>닫으면 React state에 따라 모달 전체가 언마운트됩니다. `querySelector`가 실패해 document 좌표 폴백 detached 마커가 생깁니다.</p>
            </header>

            <button
                type="button"
                className="primary-button"
                data-report-id="modal-conditional-open"
                data-report-type="item"
                onClick={() => openModal("conditional")}
            >
                모달 열기
            </button>

            {open ? (
                <div className="modal-demo-overlay modal-demo-overlay--interactive">
                    <ModalDemoDialog
                        title="조건부 렌더 모달"
                        description="닫으면 이 컴포넌트 트리가 DOM에서 사라집니다."
                        targetId="modal-conditional-target"
                        onClose={() => closeModal("conditional")}
                    >
                        <p className="modal-demo-dialog__note">locate 시 `onRevealTarget`이 모달을 다시 마운트합니다.</p>
                    </ModalDemoDialog>
                </div>
            ) : null}
        </section>
    );
}

export function VisibilityModalDemo() {
    const { isOpen, openModal, closeModal } = useModalDemo();
    const open = isOpen("visibility");

    return (
        <section
            className="modal-demo-card"
            data-report-id="modal-visibility-demo"
            data-report-type="group"
        >
            <header className="section-header">
                <ModalCaseBadge label="visibility: hidden" />
                <h2>visibility:hidden 모달</h2>
                <p>요소는 레이아웃 공간을 유지할 수 있지만 `visibility: hidden`으로 보이지 않습니다. opacity와 별도로 가시성 판정을 테스트합니다.</p>
            </header>

            <button
                type="button"
                className="primary-button"
                data-report-id="modal-visibility-open"
                data-report-type="item"
                onClick={() => openModal("visibility")}
            >
                모달 열기
            </button>

            <div
                className={`modal-demo-overlay ${open ? "modal-demo-overlay--interactive" : "modal-demo-overlay--hidden-visibility"}`}
                aria-hidden={!open}
            >
                <ModalDemoDialog
                    title="visibility:hidden 모달"
                    description="닫히면 visibility가 hidden으로 유지됩니다."
                    targetId="modal-visibility-target"
                    onClose={() => closeModal("visibility")}
                >
                    <p className="modal-demo-dialog__note">opacity와 달리 visibility만 변경하는 케이스입니다.</p>
                </ModalDemoDialog>
            </div>
        </section>
    );
}

export function ZustandModalDemo() {
    const isOpen = useModalZustandStore((state) => state.isOpen);
    const open = useModalZustandStore((state) => state.open);
    const close = useModalZustandStore((state) => state.close);

    return (
        <section
            className="modal-demo-card"
            data-report-id="modal-zustand-demo"
            data-report-type="group"
        >
            <header className="section-header">
                <ModalCaseBadge
                    label="zustand boolean"
                    className="modal-demo-badge--zustand"
                />
                <h2>Zustand store 모달</h2>
                <p>
                    모달 open 상태를 Zustand boolean으로 관리합니다. onRevealTarget에서는 React Provider 없이 useModalZustandStore.getState().open()만
                    호출합니다.
                </p>
            </header>

            <button
                type="button"
                className="primary-button"
                data-report-id="modal-zustand-open"
                data-report-type="item"
                onClick={open}
            >
                모달 열기
            </button>

            {isOpen ? (
                <div className="modal-demo-overlay modal-demo-overlay--interactive">
                    <ModalDemoDialog
                        title="Zustand 모달"
                        description="닫으면 store의 isOpen이 false가 되며 언마운트됩니다."
                        targetId="modal-zustand-target"
                        onClose={close}
                    >
                        <p className="modal-demo-dialog__note">
                            locate 시 modalRevealRegistry → revealZustandModal → getState().open() 순서로 복구됩니다.
                        </p>
                    </ModalDemoDialog>
                </div>
            ) : null}
        </section>
    );
}
