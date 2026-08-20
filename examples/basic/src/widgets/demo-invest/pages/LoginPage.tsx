import { useState } from "react";
import { Link } from "react-router-dom";

import { useModalDemo } from "../../../features/modals/model/ModalDemoContext";
import { DemoInvestModal } from "../ui/DemoInvestModal";

const agreements = [
    "필수 약관에 모두 동의",
    "개인정보 수집·이용 동의(토스인증서 로그인)",
    "개인정보 제3자 제공 동의(토스인증서 로그인)",
];

export function LoginPage() {
    const { isOpen, openModal, closeModal } = useModalDemo();
    const [method, setMethod] = useState<"phone" | "qr">("phone");
    const [fields, setFields] = useState({ name: "", birth: "", phone: "" });
    const [checked, setChecked] = useState([false, false, false]);
    const [withoutApp, setWithoutApp] = useState(false);
    const [dialogMode, setDialogMode] = useState<"login" | "join">("login");
    const canSubmit = Object.values(fields).every(Boolean) && checked.every(Boolean);

    const toggleAgreement = (index: number) => {
        if (index === 0) {
            setChecked(Array(3).fill(!checked[0]));
            return;
        }

        setChecked((current) => current.map((value, currentIndex) => currentIndex === index ? !value : value));
    };

    const showDialog = (mode: "login" | "join") => {
        setDialogMode(mode);
        openModal("investLogin");
    };

    return (
        <div className="demo-invest-login-page" data-report-id="demo-login-page" data-report-type="group">
            <Link to="/" className="demo-invest-login-page__brand">
                <img src="/demo-invest/logo-toss-white.png" alt="토스증권" />
            </Link>
            <Link to="/" className="demo-invest-login-page__close" aria-label="닫기">×</Link>

            <main className="demo-invest-login-page__main">
                <h1>토스 앱으로 로그인</h1>
                <section className="demo-invest-login-card">
                    <div className="demo-invest-login-card__tabs">
                        <button type="button" className={method === "phone" ? "is-active" : undefined} onClick={() => setMethod("phone")} data-report-id="demo-login-phone-tab" data-report-type="item">휴대폰 번호로 로그인</button>
                        <button type="button" className={method === "qr" ? "is-active" : undefined} onClick={() => setMethod("qr")} data-report-id="demo-login-qr-tab" data-report-type="item">QR코드로 로그인</button>
                    </div>
                    {method === "phone" ? <div data-report-id="demo-login-phone-panel" data-report-type="group">
                        {withoutApp ? <div className="demo-invest-login-card__alternative">
                            <p>토스 앱 없이 이메일로 로그인해요.</p>
                            <input aria-label="이메일" placeholder="이메일" />
                            <input aria-label="비밀번호" type="password" placeholder="비밀번호" />
                            <button type="button" onClick={() => showDialog("login")}>이메일로 로그인</button>
                        </div> : <>
                            <div className="demo-invest-login-card__fields">
                                <input aria-label="이름" placeholder="이름" value={fields.name} onChange={(event) => setFields((current) => ({ ...current, name: event.target.value }))} />
                                <input aria-label="생년월일 6자리" placeholder="생년월일 6자리" value={fields.birth} maxLength={6} inputMode="numeric" onChange={(event) => setFields((current) => ({ ...current, birth: event.target.value.replace(/\D/g, "") }))} />
                                <input aria-label="휴대폰 번호" placeholder="휴대폰 번호" value={fields.phone} inputMode="tel" onChange={(event) => setFields((current) => ({ ...current, phone: event.target.value }))} />
                            </div>
                            <div className="demo-invest-login-card__agreements">
                                {agreements.map((agreement, index) => (
                                    <label key={agreement}>
                                        <input type="checkbox" checked={checked[index]} onChange={() => toggleAgreement(index)} />
                                        <span>{agreement}</span>
                                        {index > 0 ? <b>›</b> : null}
                                    </label>
                                ))}
                            </div>
                            <button type="button" className="demo-invest-login-card__submit" disabled={!canSubmit} onClick={() => showDialog("login")} data-report-id="demo-login-submit" data-report-type="item">로그인</button>
                        </>}
                        <button type="button" className="demo-invest-login-card__without-app" onClick={() => setWithoutApp((current) => !current)}>{withoutApp ? "휴대폰 번호로 로그인하기" : "토스 앱 없이 로그인하기"}</button>
                    </div> : <div className="demo-invest-login-card__qr" data-report-id="demo-login-qr-panel" data-report-type="group">
                        <div className="demo-invest-login-card__qr-code" aria-label="QR 코드"><span /><span /><span /></div>
                        <strong>토스 앱으로 QR코드를 스캔해주세요</strong>
                        <p>토스 앱 &gt; 전체 &gt; QR 스캔<br />보안을 위해 2분 동안만 사용할 수 있어요.</p>
                        <button type="button">↻ QR코드 새로고침</button>
                    </div>}
                </section>
                <p>아직 토스증권 회원이 아닌가요? <button type="button" onClick={() => showDialog("join")}>가입하기</button></p>
            </main>

            {isOpen("investLogin") ? <DemoInvestModal
                id="demo-modal-login"
                title={dialogMode === "join" ? "토스증권 계좌 만들기" : "인증 요청을 보냈어요"}
                description={dialogMode === "join" ? "모바일 토스 앱에서 빠르게 계좌를 만들 수 있어요." : "토스 앱 알림을 열고 본인 인증을 완료해주세요."}
                onClose={() => closeModal("investLogin")}
                footer={<Link to="/" className="demo-invest-modal__primary" onClick={() => closeModal("investLogin")}>홈으로 돌아가기</Link>}
            >
                <div className="demo-invest-modal__login-visual">{dialogMode === "join" ? "📱" : "✓"}<strong>{dialogMode === "join" ? "가입 안내를 확인해주세요" : "휴대폰에서 인증 대기 중"}</strong><span>이 화면은 모달 전환과 완료 상태를 테스트하기 위한 데모예요.</span></div>
            </DemoInvestModal> : null}
        </div>
    );
}
