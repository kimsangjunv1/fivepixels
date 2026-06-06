export function NaverPromoBanner() {
    return (
        <section className="naver-promo" data-report-id="naver-promo" data-report-type="group">
            <div className="naver-promo__inner">
                <div className="naver-promo__copy" data-report-id="naver-promo-copy" data-report-type="item">
                    <p className="naver-promo__eyebrow">We the Navigators</p>
                    <h2 className="naver-promo__title">네이버 기획자·디자이너는 업무 노트 이렇게 씁니다</h2>
                    <p className="naver-promo__description">
                        네이버의 업무 문화와 협업 방식을 담은 Navigators Diary와 Project Note를 소개합니다.
                    </p>
                    <button className="naver-promo__link" type="button" data-report-id="naver-promo-cta" data-report-type="item">
                        자세히 보기 &gt;
                    </button>
                </div>
                <div className="naver-promo__visual" data-report-id="naver-promo-visual" data-report-type="item" aria-hidden="true">
                    <div className="naver-promo__diary">
                        <span>2024</span>
                        <strong>Navigators Diary</strong>
                        <em>OPEN</em>
                    </div>
                    <div className="naver-promo__note">Project Note</div>
                </div>
            </div>
            <div className="naver-promo__pager" aria-hidden="true">
                <span className="naver-promo__pager-dot naver-promo__pager-dot--active" />
                <span className="naver-promo__pager-dot" />
                <span className="naver-promo__pager-dot" />
            </div>
        </section>
    );
}
