import { partnerLinks } from "./data";

export function NaverPartners() {
    return (
        <section className="naver-partners" data-report-id="naver-partners" data-report-type="group">
            <div className="naver-partners__inner">
                <h2 className="naver-partners__title" data-report-id="naver-partners-title" data-report-type="item">
                    함께 성장하는 네이버
                </h2>
                <div className="naver-partners__tabs" data-report-id="naver-partners-tabs" data-report-type="item">
                    <button className="naver-partners__tab naver-partners__tab--active" type="button">
                        파트너 지원
                    </button>
                    <button className="naver-partners__tab" type="button">
                        전문가 지원
                    </button>
                </div>
                <div className="naver-partners__grid">
                    {partnerLinks.map((link) => (
                        <a
                            key={link.id}
                            className="naver-partners__link"
                            href="#"
                            data-report-id={link.id}
                            data-report-type="item"
                        >
                            <span>{link.label}</span>
                            <span className="naver-partners__external" aria-hidden="true">
                                ↗
                            </span>
                        </a>
                    ))}
                </div>
            </div>
        </section>
    );
}
