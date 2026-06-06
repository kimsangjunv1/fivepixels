import { footerColumns } from "./data";

const socialLinks = ["Blog", "Post", "YouTube", "LinkedIn"];

export function NaverFooter() {
    return (
        <footer className="naver-footer" data-report-id="naver-footer" data-report-type="group">
            <div className="naver-footer__inner">
                <div className="naver-footer__top">
                    <p className="naver-footer__brand" data-report-id="naver-footer-brand" data-report-type="item">
                        We the Navigators
                    </p>
                    <div className="naver-footer__columns">
                        {footerColumns.map((column) => (
                            <div key={column.id} className="naver-footer__column" data-report-id={column.id} data-report-type="item">
                                <h3>{column.title}</h3>
                                <ul>
                                    {column.links.map((link) => (
                                        <li key={link}>
                                            <a href="#">{link}</a>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="naver-footer__bottom">
                    <p className="naver-footer__corp" data-report-id="naver-footer-corp" data-report-type="item">
                        © NAVER CORP.
                    </p>
                    <div className="naver-footer__social" data-report-id="naver-footer-social" data-report-type="item">
                        {socialLinks.map((label) => (
                            <a key={label} href="#" aria-label={label}>
                                {label.slice(0, 1)}
                            </a>
                        ))}
                    </div>
                    <div className="naver-footer__legal" data-report-id="naver-footer-legal" data-report-type="item">
                        <a href="#">이용약관</a>
                        <a href="#">개인정보처리방침</a>
                        <a href="#">책임의 한계와 법적고지</a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
