import { useState } from "react";
import { FIVE_PIXELS_DEMO_SCENES, FivePixelsDemo, type FivePixelsDemoScene } from "@fivepixels-js/react/demo";

type Locale = "ko" | "en";

type ShowcaseCopy = {
    navigation: { features: string; install: string };
    hero: { badge: string; title: string; description: string; primary: string; secondary: string; hint: string };
    language: string;
    metrics: { value: string; label: string }[];
    featureIntro: { eyebrow: string; title: string; description: string };
    features: Record<FivePixelsDemoScene, { title: string; description: string; action: string }>;
    install: { eyebrow: string; title: string; description: string; commandLabel: string; exampleLabel: string };
    closing: { eyebrow: string; title: string; description: string; action: string };
    footer: string;
};

const LOCALES = ["ko", "en"] as const;

const COPY: Record<Locale, ShowcaseCopy> = {
    ko: {
        navigation: { features: "기능", install: "사용 방법" },
        hero: {
            badge: "설치 없이 둘러보는 라이브 데모",
            title: "웹사이트 위의 대화를, 더 선명하게.",
            description: "FivePixels는 화면의 정확한 위치에 피드백을 남기고, 팀이 같은 맥락에서 확인하고 해결하도록 돕습니다.",
            primary: "직접 체험하기",
            secondary: "사용 코드 보기",
            hint: "오른쪽 UI의 탭과 버튼을 직접 눌러보세요.",
        },
        language: "언어",
        metrics: [
            { value: "12", label: "인터랙티브 UI" },
            { value: "2", label: "한국어 · English" },
            { value: "0", label: "필요한 백엔드" },
            { value: "100%", label: "격리된 데모 상태" },
        ],
        featureIntro: {
            eyebrow: "제품을 가장 빠르게 이해하는 방법",
            title: "설명보다 먼저, 직접 만져보세요",
            description: "실제 제품의 주요 흐름을 데모 데이터와 함께 담았습니다. 각 장면은 독립적으로 사용할 수 있고, 페이지 배경을 가리지 않습니다.",
        },
        features: {
            "marker-tooltip": { title: "맥락 위에 남는 마커", description: "화면의 정확한 위치에서 피드백 요약을 확인합니다.", action: "마커를 눌러 열고 닫아보세요" },
            "feedback-composer": { title: "빠르게 작성하는 피드백", description: "내용과 카테고리를 고르고 바로 새로운 케이스를 만듭니다.", action: "메시지를 입력하고 카테고리를 바꿔보세요" },
            "memo-composer": { title: "가볍게 남기는 메모", description: "정식 피드백으로 전환하기 전에도 화면 위에 생각을 바로 기록합니다.", action: "메모를 입력하고 저장해보세요" },
            "panel-overview": { title: "한눈에 보는 프로젝트 상태", description: "현재 페이지와 네트워크의 활동을 하나의 패널에서 살펴봅니다.", action: "상단 탭과 필터를 전환해보세요" },
            "network-monitor": { title: "요청 흐름까지 한자리에서", description: "성공과 실패 요청, 응답 시간과 상세 데이터를 화면 맥락 안에서 확인합니다.", action: "필터를 바꾸고 요청 상세를 열어보세요" },
            "memo-list": { title: "흩어지지 않는 화면 메모", description: "페이지에 남긴 메모를 날짜별 목록에서 검색하고 다시 찾아갑니다.", action: "메모를 검색하고 항목을 선택해보세요" },
            "element-inspector": { title: "말 대신 보여주는 UI Edit", description: "선택한 요소의 정보와 여백, 색상 변경 요청을 함께 전달합니다.", action: "오른쪽 값을 바꾸고 Before와 After를 비교해보세요" },
            "device-preview": { title: "기기별로 바로 확인", description: "동일한 화면을 모바일 기기별 크기와 프레임에서 검토합니다.", action: "iPhone과 Galaxy를 전환해보세요" },
            "feedback-thread": { title: "맥락이 이어지는 대화", description: "케이스, 답변, 담당 상태를 하나의 창에서 관리합니다.", action: "대화를 선택하고 답변을 남겨보세요" },
            settings: { title: "프로젝트에 맞는 표현", description: "팀의 작업 방식에 맞춰 테마와 마커의 모양, 크기를 정합니다.", action: "테마와 마커 스타일을 바꿔보세요" },
            "settings-customization": { title: "세밀하게 맞추는 커스터마이징", description: "테마, 대화 방식, 피드백 점과 마커의 형태·색상·글꼴을 직접 조정합니다.", action: "각 외형 항목을 열어 값을 바꿔보세요" },
            notifications: { title: "놓치지 않는 상태 변화", description: "편집 모드, 오류, 숨겨진 마커와 새로운 활동을 바로 확인합니다.", action: "알림 항목을 선택해보세요" },
        },
        install: {
            eyebrow: "Drop-in demo",
            title: "한 줄로 원하는 장면을 꺼내세요",
            description: "서비스 연결 없이도 완성된 데모 데이터가 함께 표시됩니다. 랜딩 페이지, 문서, 세일즈 페이지 어디서든 같은 API를 사용합니다.",
            commandLabel: "설치",
            exampleLabel: "React 예시",
        },
        closing: {
            eyebrow: "FivePixels Demo",
            title: "정적인 캡처보다 기억에 남는 소개",
            description: "필요한 장면만 골라 제품의 사용감을 그대로 전달해보세요.",
            action: "처음부터 다시 보기",
        },
        footer: "실제 FivePixels 컴포넌트와 데모 데이터로 구성된 소개 페이지입니다.",
    },
    en: {
        navigation: { features: "Features", install: "How to use" },
        hero: {
            badge: "A live demo, no setup required",
            title: "Make every website conversation clearer.",
            description: "FivePixels pins feedback to the exact point on a page, so teams can review and resolve it with the full context intact.",
            primary: "Try it live",
            secondary: "View the code",
            hint: "Try the tabs and controls in the live UI.",
        },
        language: "Language",
        metrics: [
            { value: "12", label: "interactive scenes" },
            { value: "2", label: "Korean · English" },
            { value: "0", label: "backend required" },
            { value: "100%", label: "isolated demo state" },
        ],
        featureIntro: {
            eyebrow: "The fastest way to understand the product",
            title: "Try it before we explain it",
            description: "The key product flows are ready with realistic demo data. Every scene works independently and keeps your page background visible.",
        },
        features: {
            "marker-tooltip": { title: "Markers that keep context", description: "Review feedback exactly where it belongs on the screen.", action: "Press the marker to open and close it" },
            "feedback-composer": { title: "Fast, focused feedback", description: "Write a message, choose a category, and create a case in place.", action: "Type a message and switch categories" },
            "memo-composer": { title: "Capture a quick memo", description: "Record a thought on the page before it needs to become formal feedback.", action: "Write a memo and save it" },
            "panel-overview": { title: "Project status at a glance", description: "Review page activity and network requests in one compact panel.", action: "Switch the tabs and filters" },
            "network-monitor": { title: "See every request in context", description: "Inspect successful and failed requests, timings, and response details without leaving the page.", action: "Filter requests and open the details" },
            "memo-list": { title: "Keep page notes together", description: "Search page memos by date and return to the exact context where they were created.", action: "Search and select a memo" },
            "element-inspector": { title: "Show changes with UI Edit", description: "Share the selected element, its spacing, and color changes together.", action: "Change a value, then compare Before and After" },
            "device-preview": { title: "Review across devices", description: "Preview the same page at common mobile sizes and device frames.", action: "Switch between iPhone and Galaxy" },
            "feedback-thread": { title: "Conversations with context", description: "Manage cases, replies, and ownership in a single window.", action: "Select a thread and leave a reply" },
            settings: { title: "Make it fit your project", description: "Tune the theme, marker shape, and size to match your workflow.", action: "Change the theme and marker style" },
            "settings-customization": { title: "Customize every visual detail", description: "Adjust themes, thread behavior, feedback dots, marker form, colors, and typography.", action: "Open each appearance group and change a value" },
            notifications: { title: "Stay on top of changes", description: "See edit mode, errors, hidden markers, and new activity at once.", action: "Select a notification item" },
        },
        install: {
            eyebrow: "Drop-in demo",
            title: "Render any scene with one component",
            description: "Finished demo data appears without connecting your service. Use the same API in landing pages, docs, and sales material.",
            commandLabel: "Install",
            exampleLabel: "React example",
        },
        closing: {
            eyebrow: "FivePixels Demo",
            title: "A product story more memorable than screenshots",
            description: "Choose only the scenes you need and let visitors feel how the product works.",
            action: "Explore from the top",
        },
        footer: "Built with real FivePixels components and isolated demo data.",
    },
};

export function DemoShowcasePage() {
    const [locale, setLocale] = useState<Locale>("ko");
    const copy = COPY[locale];

    return (
        <main className="demo-showcase">
            <nav className="demo-showcase__nav" aria-label="FivePixels demo">
                <a className="demo-showcase__brand" href="#top" aria-label="FivePixels demo home"><span>fp.</span>fivepixels</a>
                <div className="demo-showcase__nav-links">
                    <a href="#features">{copy.navigation.features}</a>
                    <a href="#install">{copy.navigation.install}</a>
                </div>
                <div className="demo-showcase__locale" role="group" aria-label={copy.language}>
                    {LOCALES.map((option) => (
                        <button key={option} type="button" aria-pressed={locale === option} onClick={() => setLocale(option)}>{option.toUpperCase()}</button>
                    ))}
                </div>
            </nav>

            <header id="top" className="demo-showcase__hero">
                <div className="demo-showcase__hero-copy">
                    <span className="demo-showcase__badge"><span aria-hidden="true" />{copy.hero.badge}</span>
                    <h1>{copy.hero.title}</h1>
                    <p>{copy.hero.description}</p>
                    <div className="demo-showcase__actions">
                        <a className="demo-showcase__button demo-showcase__button--primary" href="#features">{copy.hero.primary}</a>
                        <a className="demo-showcase__button demo-showcase__button--secondary" href="#install">{copy.hero.secondary}</a>
                    </div>
                </div>
                <div className="demo-showcase__hero-demo">
                    <div className="demo-showcase__window-bar" aria-hidden="true"><span /><span /><span /></div>
                    <div className="demo-showcase__hero-stage"><FivePixelsDemo scene="panel-overview" locale={locale} /></div>
                    <p><span aria-hidden="true">↗</span>{copy.hero.hint}</p>
                </div>
            </header>

            <section className="demo-showcase__metrics" aria-label="Demo overview">
                {copy.metrics.map((metric) => <div key={metric.label}><strong>{metric.value}</strong><span>{metric.label}</span></div>)}
            </section>

            <section id="features" className="demo-showcase__feature-intro">
                <span className="demo-showcase__eyebrow">{copy.featureIntro.eyebrow}</span>
                <h2>{copy.featureIntro.title}</h2>
                <p>{copy.featureIntro.description}</p>
            </section>

            <div className="demo-showcase__features">
                {FIVE_PIXELS_DEMO_SCENES.map((scene, index) => {
                    const feature = copy.features[scene];

                    return (
                        <section key={scene} className={`demo-showcase__feature ${index % 2 === 1 ? "demo-showcase__feature--reverse" : ""}`}>
                            <div className="demo-showcase__copy">
                                <span>{String(index + 1).padStart(2, "0")} / {String(FIVE_PIXELS_DEMO_SCENES.length).padStart(2, "0")}</span>
                                <h2>{feature.title}</h2>
                                <p>{feature.description}</p>
                                <small><span aria-hidden="true">↗</span>{feature.action}</small>
                                <code>{`<FivePixelsDemo scene="${scene}" locale="${locale}" />`}</code>
                            </div>
                            <div className="demo-showcase__demo"><FivePixelsDemo scene={scene} locale={locale} /></div>
                        </section>
                    );
                })}
            </div>

            <section id="install" className="demo-showcase__install">
                <div className="demo-showcase__install-copy">
                    <span className="demo-showcase__eyebrow">{copy.install.eyebrow}</span>
                    <h2>{copy.install.title}</h2>
                    <p>{copy.install.description}</p>
                </div>
                <div className="demo-showcase__code-card">
                    <div><span>{copy.install.commandLabel}</span><code>npm install @fivepixels-js/react</code></div>
                    <div>
                        <span>{copy.install.exampleLabel}</span>
                        <pre><code>{`import { FivePixelsDemo } from "@fivepixels-js/react/demo";\n\n<FivePixelsDemo\n  scene="feedback-composer"\n  locale="${locale}"\n/>`}</code></pre>
                    </div>
                </div>
            </section>

            <section className="demo-showcase__closing">
                <span className="demo-showcase__eyebrow">{copy.closing.eyebrow}</span>
                <h2>{copy.closing.title}</h2>
                <p>{copy.closing.description}</p>
                <a className="demo-showcase__button demo-showcase__button--light" href="#top">{copy.closing.action}<span aria-hidden="true">↑</span></a>
            </section>

            <footer className="demo-showcase__footer">
                <a className="demo-showcase__brand" href="#top"><span>fp.</span>fivepixels</a>
                <p>{copy.footer}</p>
            </footer>
        </main>
    );
}
