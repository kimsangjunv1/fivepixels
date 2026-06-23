import { createContext, useCallback, useContext, useEffect, useMemo, useState, type PropsWithChildren, type ReactNode } from "react";
import type { ReportFeedback } from "@fivepixels-js/react";

import { registerModalRevealHandler } from "./modalRevealRegistry";

type ModalCaseKey = "opacity" | "display" | "conditional" | "visibility";

type ModalDemoContextValue = {
    isOpen: (key: ModalCaseKey) => boolean;
    openModal: (key: ModalCaseKey) => void;
    closeModal: (key: ModalCaseKey) => void;
};

const ModalDemoContext = createContext<ModalDemoContextValue | null>(null);

const revealTargetByCase: Record<ModalCaseKey, string> = {
    opacity: "modal-opacity-target",
    display: "modal-display-target",
    conditional: "modal-conditional-target",
    visibility: "modal-visibility-target",
};

export function ModalDemoProvider({ children }: PropsWithChildren) {
    const [openState, setOpenState] = useState<Record<ModalCaseKey, boolean>>({
        opacity: false,
        display: false,
        conditional: false,
        visibility: false,
    });

    const openModal = useCallback((key: ModalCaseKey) => {
        setOpenState((current) => ({ ...current, [key]: true }));
    }, []);

    const closeModal = useCallback((key: ModalCaseKey) => {
        setOpenState((current) => ({ ...current, [key]: false }));
    }, []);

    const isOpen = useCallback((key: ModalCaseKey) => openState[key], [openState]);

    useEffect(() => {
        registerModalRevealHandler((report: ReportFeedback) => {
            const matchedCase = (Object.entries(revealTargetByCase) as Array<[ModalCaseKey, string]>).find(([, targetId]) => targetId === report.report_id)?.[0];

            if (!matchedCase) {
                return false;
            }

            openModal(matchedCase);
            return true;
        });

        return () => {
            registerModalRevealHandler(null);
        };
    }, [openModal]);

    const value = useMemo(
        () => ({
            isOpen,
            openModal,
            closeModal,
        }),
        [closeModal, isOpen, openModal],
    );

    return <ModalDemoContext.Provider value={value}>{children}</ModalDemoContext.Provider>;
}

export function useModalDemo() {
    const context = useContext(ModalDemoContext);

    if (!context) {
        throw new Error("useModalDemo must be used within ModalDemoProvider");
    }

    return context;
}

type ModalDemoDialogProps = {
    title: string;
    description: string;
    targetId: string;
    onClose: () => void;
    children?: ReactNode;
};

export function ModalDemoDialog({ title, description, targetId, onClose, children }: ModalDemoDialogProps) {
    return (
        <div
            className="modal-demo-dialog"
            data-report-id={targetId}
            data-report-type="item"
            role="dialog"
            aria-modal="true"
            aria-labelledby={`${targetId}-title`}
        >
            <header className="modal-demo-dialog__header">
                <p className="modal-demo-dialog__eyebrow">item target</p>
                <h3 id={`${targetId}-title`}>{title}</h3>
                <p>{description}</p>
            </header>

            {children}

            <div className="modal-demo-dialog__actions">
                <button
                    type="button"
                    className="ghost-button"
                    onClick={onClose}
                >
                    닫기
                </button>
                <button
                    type="button"
                    className="primary-button"
                >
                    확인
                </button>
            </div>
        </div>
    );
}
