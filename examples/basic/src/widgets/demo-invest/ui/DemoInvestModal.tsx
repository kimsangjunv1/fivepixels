import { createPortal } from "react-dom";
import type { ReactNode } from "react";

type DemoInvestModalProps = {
    id: string;
    title: string;
    description: string;
    onClose: () => void;
    children: ReactNode;
    footer?: ReactNode;
};

export function DemoInvestModal({ id, title, description, onClose, children, footer }: DemoInvestModalProps) {
    return createPortal(
        <div
            className="demo-invest-modal__overlay"
            data-fp-view={id}
            data-report-id={`${id}-overlay`}
            data-report-type="group"
            role="presentation"
            onMouseDown={(event) => {
                if (event.currentTarget === event.target) {
                    onClose();
                }
            }}
        >
            <section
                className="demo-invest-modal"
                data-report-id={id}
                data-report-type="item"
                role="dialog"
                aria-modal="true"
                aria-labelledby={`${id}-title`}
            >
                <header>
                    <div>
                        <h2 id={`${id}-title`}>{title}</h2>
                        <p>{description}</p>
                    </div>
                    <button type="button" onClick={onClose} aria-label="모달 닫기">×</button>
                </header>
                <div className="demo-invest-modal__body">{children}</div>
                {footer ? <footer>{footer}</footer> : null}
            </section>
        </div>,
        document.body,
    );
}
