import { useContactProvider } from "../../../features/contact/model/ContactContext";

export function InquiryForm() {
    const { topics } = useContactProvider();

    return (
        <section
            className="inquiry-form"
            data-report-id="contact-form"
            data-report-type="group"
        >
            <header className="section-header">
                <span className="section-badge">group target</span>
                <h2>문의 남기기</h2>
                <p>폼 필드와 제출 버튼에도 item target을 연결해 두었습니다.</p>
            </header>
            <form
                className="inquiry-form__grid"
                onSubmit={(event) => event.preventDefault()}
            >
                <label
                    className="form-field"
                    data-report-id="contact-field-name"
                    data-report-type="item"
                >
                    <span>이름</span>
                    <input
                        type="text"
                        name="name"
                        placeholder="홍길동"
                    />
                </label>
                <label
                    className="form-field"
                    data-report-id="contact-field-email"
                    data-report-type="item"
                >
                    <span>이메일</span>
                    <input
                        type="email"
                        name="email"
                        placeholder="you@company.com"
                    />
                </label>
                <fieldset
                    className="form-field form-field--full"
                    data-report-id="contact-field-topic"
                    data-report-type="item"
                >
                    <legend>문의 유형</legend>
                    <div className="topic-options">
                        {topics.map((topic) => (
                            <label
                                key={topic.id}
                                className="topic-option"
                            >
                                <input
                                    type="radio"
                                    name="topic"
                                    value={topic.id}
                                />
                                <span>{topic.label}</span>
                            </label>
                        ))}
                    </div>
                </fieldset>
                <label
                    className="form-field form-field--full"
                    data-report-id="contact-field-message"
                    data-report-type="item"
                >
                    <span>메시지</span>
                    <textarea
                        name="message"
                        rows={5}
                        placeholder="도입 배경과 팀 규모를 알려주세요."
                    />
                </label>
                <div className="form-actions form-field--full">
                    <button
                        className="primary-button"
                        type="submit"
                        data-report-id="contact-submit"
                        data-report-type="item"
                    >
                        문의 보내기
                    </button>
                    <button
                        className="ghost-button"
                        type="reset"
                        data-report-id="contact-reset"
                        data-report-type="item"
                    >
                        초기화
                    </button>
                </div>
            </form>
        </section>
    );
}

export function ContactInfo() {
    const { channels, officeHours } = useContactProvider();

    return (
        <section
            className="contact-info"
            data-report-id="contact-channels"
            data-report-type="group"
        >
            <header className="section-header">
                <span className="section-badge">group target</span>
                <h2>다른 연락 방법</h2>
                <p>{officeHours}</p>
            </header>
            <div className="contact-info__grid">
                {channels.map((channel) => (
                    <article
                        key={channel.id}
                        className="contact-card"
                        data-report-id={channel.id}
                        data-report-type="item"
                    >
                        <span className="section-badge">item target</span>
                        <h3>{channel.label}</h3>
                        <p className="contact-card__value">{channel.value}</p>
                        <p>{channel.description}</p>
                        <button
                            className="text-button"
                            type="button"
                            data-report-id={`${channel.id}-action`}
                            data-report-type="item"
                        >
                            {channel.label}로 연결
                        </button>
                    </article>
                ))}
            </div>
        </section>
    );
}

export function FaqList() {
    const { faqs } = useContactProvider();

    return (
        <section
            className="faq-list"
            data-report-id="contact-faq"
            data-report-type="group"
        >
            <header className="section-header">
                <span className="section-badge">group target</span>
                <h2>자주 묻는 질문</h2>
                <p>각 FAQ 항목도 item target으로 표시됩니다.</p>
            </header>
            <div className="faq-list__items">
                {faqs.map((faq) => (
                    <details
                        key={faq.id}
                        className="faq-item"
                        data-report-id={faq.id}
                        data-report-type="item"
                    >
                        <summary>{faq.question}</summary>
                        <p>{faq.answer}</p>
                    </details>
                ))}
            </div>
        </section>
    );
}
