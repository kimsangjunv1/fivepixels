import { ModalDemoDialog, useModalDemo } from "../../../features/modals/model/ModalDemoContext";
import { useModalZustandStore } from "../../../features/modals/model/modalZustandStore";

export function DashboardModals() {
    const { isOpen, closeModal } = useModalDemo();
    const zustandOpen = useModalZustandStore((state) => state.isOpen);
    const closeZustand = useModalZustandStore((state) => state.close);

    const opacityOpen = isOpen("opacity");
    const displayOpen = isOpen("display");
    const conditionalOpen = isOpen("conditional");
    const visibilityOpen = isOpen("visibility");
    const offscreenOpen = isOpen("offscreen");

    return (
        <>
            <div
                className={`modal-demo-overlay ${opacityOpen ? "modal-demo-overlay--interactive" : "modal-demo-overlay--hidden-opacity"}`}
                aria-hidden={!opacityOpen}
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

            <div className="modal-demo-overlay" style={{ display: displayOpen ? "flex" : "none" }}>
                <ModalDemoDialog
                    title="display:none 모달"
                    description="닫으면 display가 none으로 바뀝니다."
                    targetId="modal-display-target"
                    onClose={() => closeModal("display")}
                >
                    <p className="modal-demo-dialog__note">타겟 요소는 DOM에 있지만 화면에 그려지지 않습니다.</p>
                </ModalDemoDialog>
            </div>

            {conditionalOpen ? (
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

            <div
                className={`modal-demo-overlay ${visibilityOpen ? "modal-demo-overlay--interactive" : "modal-demo-overlay--hidden-visibility"}`}
                aria-hidden={!visibilityOpen}
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

            <div
                className={`modal-demo-overlay ${offscreenOpen ? "modal-demo-overlay--interactive" : "modal-demo-overlay--hidden-offscreen"}`}
                aria-hidden={!offscreenOpen}
            >
                <ModalDemoDialog
                    title="Off-screen 모달"
                    description="닫히면 transform으로 화면 밖으로 이동합니다."
                    targetId="modal-offscreen-target"
                    onClose={() => closeModal("offscreen")}
                >
                    <p className="modal-demo-dialog__note">DOM에는 남아 있지만 시각적으로 보이지 않습니다.</p>
                </ModalDemoDialog>
            </div>

            {zustandOpen ? (
                <div className="modal-demo-overlay modal-demo-overlay--interactive">
                    <ModalDemoDialog
                        title="Zustand 모달"
                        description="닫으면 store의 isOpen이 false가 되며 언마운트됩니다."
                        targetId="modal-zustand-target"
                        onClose={closeZustand}
                    >
                        <p className="modal-demo-dialog__note">locate 시 modalRevealRegistry → revealZustandModal 순서로 복구됩니다.</p>
                    </ModalDemoDialog>
                </div>
            ) : null}
        </>
    );
}
