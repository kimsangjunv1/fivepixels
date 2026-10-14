import type { ConceptShotSceneId } from "./conceptShotConfig";

const ANALYTICS_BARS = [42, 58, 49, 72, 64, 86, 78, 96, 82, 108, 99, 122];
const ANALYTICS_ROWS = [
    ["Organic search", "42,831", "7.8%", "$98,420"],
    ["Product Hunt", "18,240", "11.2%", "$64,890"],
    ["Partner referrals", "12,992", "9.4%", "$51,230"],
];
const INCIDENT_LOGS = [
    ["10:42:18", "POST", "/v1/checkout/confirm", "500", "1.84s"],
    ["10:42:17", "POST", "/v1/payment/intents", "502", "2.12s"],
    ["10:42:16", "GET", "/v1/cart/7g2", "200", "128ms"],
    ["10:42:14", "POST", "/v1/checkout/confirm", "500", "1.76s"],
];

function target(id: string) {
    return { "data-fp-id": id, "data-fp-type": "item" } as const;
}

function CheckoutScene() {
    return (
        <div className="cs-app cs-checkout">
            <header className="cs-app__header">
                <strong {...target("checkout-brand")}>Northstar</strong>
                <nav aria-label="Store navigation"><span>New arrivals</span><span>Collections</span><span>Journal</span></nav>
                <span>Bag · 2</span>
            </header>
            <main className="cs-checkout__main">
                <section className="cs-checkout__details">
                    <p className="cs-app__eyebrow">Secure checkout</p>
                    <h2 {...target("checkout-title")}>Complete your order</h2>
                    <article className="cs-checkout__product" {...target("checkout-product")}>
                        <div className="cs-checkout__product-image" aria-hidden="true">N</div>
                        <div><strong>Orbit Runner</strong><span>Cloud / EU 42</span><small>Ships in 1–2 business days</small></div>
                        <b>$118</b>
                    </article>
                    <div className="cs-checkout__option-row" {...target("checkout-product-options")}>
                        <label>Quantity <select aria-label="Quantity" defaultValue="1"><option>1</option><option>2</option></select></label>
                        <button type="button">Edit options</button>
                    </div>
                    <section className="cs-checkout__payment" {...target("checkout-payment-fields")}>
                        <div><span>Payment</span><small>Encrypted and secure</small></div>
                        <label>Card number <input readOnly value="4242 4242 4242 4242" /></label>
                        <div className="cs-checkout__payment-grid"><label>Expiry <input readOnly value="08 / 29" /></label><label>CVC <input readOnly value="•••" /></label></div>
                    </section>
                </section>
                <aside className="cs-checkout__summary">
                    <p className="cs-app__eyebrow">Order summary</p>
                    <div><span>Subtotal</span><strong>$118.00</strong></div>
                    <div {...target("checkout-shipping")}><span>Express shipping</span><strong>$10.00</strong></div>
                    <div><span>Estimated tax</span><strong>$0.00</strong></div>
                    <div className="cs-checkout__total"><span>Total</span><strong>$128.00</strong></div>
                    <button className="cs-checkout__submit" type="button" {...target("checkout-submit")}>Pay $128.00 <span>→</span></button>
                    <p className="cs-checkout__trust" {...target("checkout-trust-note")}>30-day returns · Carbon-neutral delivery</p>
                </aside>
            </main>
        </div>
    );
}

function AnalyticsScene() {
    return (
        <div className="cs-app cs-analytics">
            <aside className="cs-analytics__sidebar">
                <strong>Metric</strong>
                <nav aria-label="Analytics navigation"><b>Overview</b><span>Revenue</span><span>Customers</span><span>Funnels</span><span>Reports</span></nav>
                <small>Workspace<br /><strong>Northstar Labs</strong></small>
            </aside>
            <main className="cs-analytics__content">
                <header><div><p className="cs-app__eyebrow">Performance</p><h2>Growth overview</h2></div><button type="button" {...target("analytics-date-filter")}>Last 30 days⌄</button></header>
                <section className="cs-analytics__kpis">
                    <article {...target("analytics-revenue")}><span>Net revenue</span><strong>$284,510</strong><small>↑ 18.4%</small></article>
                    <article><span>New customers</span><strong>8,492</strong><small>↑ 12.1%</small></article>
                    <article><span>Activation rate</span><strong>68.2%</strong><small>↑ 4.6%</small></article>
                </section>
                <section className="cs-analytics__chart" {...target("analytics-chart")}>
                    <div><div><span>Revenue trend</span><strong>$284.5k</strong></div><small>Compared with $240.2k last period</small></div>
                    <div className="cs-analytics__bars" aria-label="Revenue bar chart">
                        {ANALYTICS_BARS.map((height, index) => <i key={index} style={{ height }} />)}
                    </div>
                </section>
                <section className="cs-analytics__table" {...target("analytics-table")}>
                    <header><strong>Top acquisition channels</strong><button type="button" {...target("analytics-export")}>Export CSV</button></header>
                    <div className="cs-analytics__table-row cs-analytics__table-head"><span>Channel</span><span>Visitors</span><span>Conversion</span><span>Revenue</span></div>
                    {ANALYTICS_ROWS.map((row) => <div key={row[0]} className="cs-analytics__table-row">{row.map((cell) => <span key={cell}>{cell}</span>)}</div>)}
                </section>
            </main>
        </div>
    );
}

function LandingScene() {
    return (
        <div className="cs-app cs-landing">
            <header className="cs-landing__header"><strong>relay.</strong><nav aria-label="Landing navigation"><span>Product</span><span>Solutions</span><span>Pricing</span></nav><button type="button">Sign in</button></header>
            <main className="cs-landing__main">
                <section className="cs-landing__hero">
                    <div className="cs-landing__hero-copy">
                        <span className="cs-landing__badge">New · AI workflows</span>
                        <h2 {...target("landing-hero-copy")}>Your team's work,<br />finally in sync.</h2>
                        <p>Plan projects, share context, and ship thoughtful work without losing momentum between tools.</p>
                        <div><button type="button" {...target("landing-primary-cta")}>Start for free <span>→</span></button><button type="button">Watch overview</button></div>
                        <small>No credit card required · Set up in 2 minutes</small>
                        <div className="cs-landing__meta-row">
                            <section className="cs-landing__proof" {...target("landing-proof")}><span>Trusted by modern product teams</span><div><b>Arc</b><b>Northstar</b><b>Canvas</b><b>Plain</b></div></section>
                            <section className="cs-landing__pricing" {...target("landing-pricing")}><p className="cs-app__eyebrow">Simple pricing</p><strong>$16 <small>/ user</small></strong></section>
                        </div>
                    </div>
                    <div className="cs-landing__product" aria-label="Relay product preview">
                        <aside><i /><i /><i /><i /></aside>
                        <section><span>Launch workspace</span><article><b>Website refresh</b><small>8 tasks · 3 teammates</small><em>76%</em></article><article><b>Mobile onboarding</b><small>12 tasks · 5 teammates</small><em>42%</em></article></section>
                    </div>
                </section>
            </main>
        </div>
    );
}

function MobileScene() {
    return (
        <div className="cs-mobile-wrap">
            <div className="cs-mobile-copy"><span>Responsive review</span><h2>Every detail,<br />on the actual device.</h2><p>Markers stay attached to the exact mobile UI your team is discussing.</p></div>
            <div className="cs-mobile-phone">
                <div className="cs-mobile__status"><span>9:41</span><span>● ◒ ▰</span></div>
                <header {...target("mobile-header")}><button type="button">☰</button><strong>vault</strong><button type="button">◎</button></header>
                <main>
                    <section className="cs-mobile__balance" {...target("mobile-balance")}><span>Total balance</span><strong>$24,892.40</strong><small>+$1,240.82 this month</small></section>
                    <section className="cs-mobile__actions" {...target("mobile-quick-actions")}><button type="button"><b>↑</b><span>Send</span></button><button type="button"><b>↓</b><span>Receive</span></button><button type="button"><b>＋</b><span>Deposit</span></button></section>
                    <section className="cs-mobile__chart" {...target("mobile-chart")}><header><strong>Portfolio</strong><span>1M⌄</span></header><svg viewBox="0 0 320 90" role="img" aria-label="Portfolio trend"><path d="M0 72 C40 68 52 41 86 52 S134 62 162 34 S214 52 244 24 S286 30 320 8" fill="none" stroke="currentColor" strokeWidth="4" /><path d="M0 72 C40 68 52 41 86 52 S134 62 162 34 S214 52 244 24 S286 30 320 8 V90 H0Z" fill="currentColor" opacity=".08" /></svg></section>
                    <section className="cs-mobile__activity"><header><strong>Recent activity</strong><span>See all</span></header><div><i>↗</i><span><b>Figma</b><small>Subscription</small></span><strong>−$15.00</strong></div><div><i>↙</i><span><b>Acme Inc.</b><small>Payment received</small></span><strong className="positive">+$840.00</strong></div></section>
                </main>
                <nav className="cs-mobile__nav" aria-label="Mobile navigation" {...target("mobile-bottom-nav")}><b>⌂<span>Home</span></b><i>◫<span>Cards</span></i><i>⇄<span>Activity</span></i><i>◉<span>Profile</span></i></nav>
            </div>
        </div>
    );
}

function IncidentScene() {
    return (
        <div className="cs-app cs-incident">
            <aside><strong>trace<span>kit</span></strong><nav aria-label="Incident navigation"><b>Overview</b><span>Services</span><span>Traces</span><span>Logs</span><span>Alerts</span></nav><small>PRODUCTION</small></aside>
            <main>
                <header><div><p className="cs-app__eyebrow">Incident #2841</p><h2>Checkout failures · us-east-1</h2></div><button type="button" {...target("incident-status")}>Investigating</button></header>
                <section className="cs-incident__metrics"><article><span>Error rate</span><strong>12.8%</strong><small>↑ 11.9%</small></article><article {...target("incident-latency")}><span>P95 latency</span><strong>1.84s</strong><small>↑ 620ms</small></article><article><span>Affected users</span><strong>1,284</strong><small>Last 24 min</small></article></section>
                <section className="cs-incident__chart" {...target("incident-error-chart")}><header><div><strong>5xx response rate</strong><span>checkout-api</span></div><b>Threshold 3%</b></header><svg viewBox="0 0 740 160" role="img" aria-label="Error rate spike"><path d="M0 135 L70 132 L110 128 L150 131 L188 124 L220 128 L250 122 L278 126 L300 118 L326 120 L344 104 L360 109 L378 58 L396 72 L414 28 L432 48 L450 22 L468 40 L486 18 L504 44 L522 30 L540 58 L570 48 L600 66 L630 60 L670 78 L710 72 L740 88" fill="none" stroke="currentColor" strokeWidth="4" /><line x1="0" x2="740" y1="105" y2="105" stroke="currentColor" strokeDasharray="5 7" opacity=".3" /></svg></section>
                <section className="cs-incident__lower"><article {...target("incident-deploy")}><span>Latest deploy</span><strong>checkout-api · 7f81c2</strong><small>24 minutes ago by Mina Park</small><button type="button">View changes</button></article><div {...target("incident-log-row")}><header><strong>Live errors</strong><span>Streaming</span></header>{INCIDENT_LOGS.map((row) => <div key={row.join("-")}>{row.map((cell) => <span key={cell}>{cell}</span>)}</div>)}</div></section>
            </main>
        </div>
    );
}

function AgentScene() {
    return (
        <div className="cs-agent">
            <section className="cs-agent__panel">
                <button type="button" className="cs-agent__thought" {...target("agent-thought")}>Thought for 37s ⌄</button>

                <div className="cs-agent__source-row">
                    <article {...target("agent-source-docs")}><b>Docs</b><span>Launch Brief &amp; Goals</span></article>
                    <article><b>Slides</b><span>Product Metrics</span></article>
                    <article {...target("agent-source-hubspot")}><b>HubSpot</b><span>October Campaign</span></article>
                    <article className="cs-agent__source-more"><b>···</b><span>15 sources</span><i aria-hidden="true">⤢</i></article>
                </div>

                <p className="cs-agent__lede" {...target("agent-lede")}>
                    The <strong>October campaign</strong> outperformed benchmarks for engagement and conversion, setting a strong baseline for <strong>Q4 growth initiatives</strong>.
                    <span className="cs-agent__cite" aria-hidden="true">▣ ▣ +2</span>
                </p>

                <h3 {...target("agent-summary")}>Executive summary</h3>
                <p className="cs-agent__body">
                    The campaign exceeded engagement targets, driving a <strong>+42% lift in new leads</strong> and a <strong>3-point increase</strong> in feature adoption across activated workspaces.
                </p>

                <button type="button" className="cs-agent__fab" aria-label="Inspect">⌕</button>
            </section>
        </div>
    );
}

export function ConceptShotScene({ scene }: { scene: ConceptShotSceneId }) {
    switch (scene) {
        case "checkout": return <CheckoutScene />;
        case "analytics": return <AnalyticsScene />;
        case "landing": return <LandingScene />;
        case "mobile": return <MobileScene />;
        case "incident": return <IncidentScene />;
        case "agent": return <AgentScene />;
    }
}
