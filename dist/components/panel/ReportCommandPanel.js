import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
export function ReportCommandPanel({ onExecute, onClose, notice = null, onNoticeClear }) {
    const [raw, setRaw] = useState("");
    const [statusMessage, setStatusMessage] = useState("");
    const [isError, setIsError] = useState(false);
    const [isExecuting, setIsExecuting] = useState(false);
    useEffect(() => {
        if (!notice) {
            return;
        }
        setStatusMessage(notice.message);
        setIsError(notice.isError);
        onNoticeClear?.();
    }, [notice, onNoticeClear]);
    const handleExecute = () => {
        if (!raw.trim() || isExecuting) {
            return;
        }
        setIsExecuting(true);
        setStatusMessage("");
        setIsError(false);
        void onExecute(raw.trim())
            .then((result) => {
            if (result.status === "pending") {
                return;
            }
            setStatusMessage(result.message);
            setIsError(false);
        })
            .catch((error) => {
            setStatusMessage(error instanceof Error ? error.message : "데이터 삽입에 실패했어요.");
            setIsError(true);
        })
            .finally(() => {
            setIsExecuting(false);
        });
    };
    return (_jsxs("section", { className: "flex min-h-0 flex-1 flex-col bg-[var(--adaptive-black50)] rounded-[0_0_24px_24px] overflow-hidden", children: [_jsxs("div", { className: "border-b border-[var(--adaptive-black200)] p-[12px]", children: [_jsx("p", { className: "text-[14px] font-bold text-[var(--adaptive-black900)]", children: "Command" }), _jsx("p", { className: "mt-[4px] text-[12px] leading-[1.5] text-[var(--adaptive-black500)]", children: "\uBCF5\uC0AC\uD55C \uD53C\uB4DC\uBC31 JSON\uC744 \uBD99\uC5EC\uB123\uACE0 \uC2E4\uD589\uD558\uBA74 localStorage\uC5D0 \uC0BD\uC785\uB429\uB2C8\uB2E4." })] }), _jsxs("div", { className: "flex min-h-0 flex-1 flex-col gap-[8px]", children: [_jsx("textarea", { value: raw, onChange: (event) => setRaw(event.target.value), placeholder: '{"id":"...","pathname":"...", ...}', spellCheck: false, className: "min-h-[160px] flex-1 resize-none bg-[var(--adaptive-black900)] p-[4px] font-mono text-[12px] leading-[1.5] text-[var(--adaptive-black400)] outline-none placeholder:text-[var(--adaptive-black700)]" }), statusMessage ? _jsx("p", { className: `text-[12px] ${isError ? "text-rose-700" : "text-[var(--adaptive-green600,#2e7d32)]"}`, children: statusMessage }) : null, _jsxs("div", { className: "flex items-center justify-end gap-[8px]", children: [_jsx("button", { type: "button", onClick: onClose, className: "rounded-[8px] border border-[var(--adaptive-black300)] px-[12px] py-[6px] text-[12px] font-semibold text-[var(--adaptive-black700)]", children: "\uB2EB\uAE30" }), _jsx("button", { type: "button", disabled: !raw.trim() || isExecuting, onClick: handleExecute, className: "rounded-[8px] bg-[var(--adaptive-blue500)] px-[12px] py-[6px] text-[12px] font-bold text-white disabled:cursor-not-allowed disabled:opacity-50", children: isExecuting ? "실행 중..." : "실행" })] })] })] }));
}
//# sourceMappingURL=ReportCommandPanel.js.map