import fs from "node:fs";

const path = "styles/demo-invest.css";
let css = fs.readFileSync(path, "utf8");

css = css.replace(/\.demo-invest \{[^}]+\}/, ".demo-invest {");

const map = [
    ["#101116", "var(--di-bg)"],
    ["#0e0f14", "var(--di-header-bg)"],
    ["#22232a", "var(--di-header-border)"],
    ["#17181d", "var(--di-surface)"],
    ["#202126", "var(--di-surface-2)"],
    ["#222329", "var(--di-surface-3)"],
    ["#25262d", "var(--di-surface-4)"],
    ["#282832", "var(--di-surface-5)"],
    ["#292b32", "var(--di-surface-6)"],
    ["#31323a", "var(--di-surface-7)"],
    ["#33343d", "var(--di-surface-8)"],
    ["#292a31", "var(--di-border)"],
    ["#27282e", "var(--di-border-2)"],
    ["#2b2c33", "var(--di-border-3)"],
    ["#30313a", "var(--di-border-4)"],
    ["#33343b", "var(--di-border-5)"],
    ["#34353d", "var(--di-border-6)"],
    ["#353740", "var(--di-border-7)"],
    ["#3a3b45", "var(--di-border-8)"],
    ["#3a3c45", "var(--di-border-9)"],
    ["#373840", "var(--di-line)"],
    ["#e6e8ed", "var(--di-text)"],
    ["#dfe1e6", "var(--di-text-2)"],
    ["#d5d7dd", "var(--di-text-3)"],
    ["#d0d3da", "var(--di-text-4)"],
    ["#d9dbe1", "var(--di-text-5)"],
    ["#e2e4e9", "var(--di-text-6)"],
    ["#e3e5e9", "var(--di-text-7)"],
    ["#e4e6eb", "var(--di-text-8)"],
    ["#e5e7ec", "var(--di-text-9)"],
    ["#a0a4af", "var(--di-sub)"],
    ["#696e7a", "var(--di-muted)"],
    ["#777c87", "var(--di-muted-2)"],
    ["#858a95", "var(--di-muted-3)"],
    ["#8a8f99", "var(--di-muted-4)"],
    ["#8b909a", "var(--di-muted-5)"],
    ["#868b96", "var(--di-nav)"],
    ["#f1f2f5", "var(--di-nav-active)"],
    ["#9a9ea8", "var(--di-search-text)"],
    ["#41414b", "var(--di-search-kbd-bg)"],
    ["#aaadb6", "var(--di-search-kbd-text)"],
    ["#272831", "var(--di-currency-bg)"],
    ["#606571", "var(--di-currency-text)"],
    ["#aeb2bc", "var(--di-currency-active)"],
    ["#626773", "var(--di-rail-btn)"],
    ["#2d3038", "var(--di-rail-btn-active-bg)"],
    ["#c6c9d0", "var(--di-rail-btn-active-text)"],
    ["#555966", "var(--di-rail-header)"],
    ["#191a20", "var(--di-row-hover)"],
    ["#18191e", "var(--di-row-hover-2)"],
    ["#202127", "var(--di-row-hover-3)"],
    ["#686d78", "var(--di-tab)"],
    ["#9296a0", "var(--di-summary-toggle)"],
    ["#818691", "var(--di-filter-text)"],
    ["#5a606c", "var(--di-rank)"],
    ["#59606b", "var(--di-heart)"],
    ["#31333a", "var(--di-chip-bg)"],
    ["#bbc0c8", "var(--di-chip-text)"],
    ["#57a4ff", "var(--di-ai-accent)"],
    ["#d4d6dc", "var(--di-ai-text)"],
    ["#565b66", "var(--di-ai-chevron)"],
    ["#3790ff", "var(--di-add-btn-icon)"],
    ["#282a31", "var(--di-add-btn-bg)"],
    ["#878c97", "var(--di-market-bar)"],
    ["#daddE3", "var(--di-market-bar-strong)"],
    ["#22b885", "var(--di-market-dot)"],
    ["#c8cbd2", "var(--di-market-btn-text)"],
    ["#c4c7ce", "var(--di-mini-label)"],
    ["#34353b", "var(--di-mini-badge-bg)"],
    ["#a3a7b0", "var(--di-mini-badge-text)"],
    ["#2d2f36", "var(--di-schedule-card-border)"],
    ["#727681", "var(--di-schedule-muted)"],
    ["#969aa4", "var(--di-schedule-text)"],
    ["#17a878", "var(--di-schedule-dot)"],
    ["#626875", "var(--di-schedule-dot-muted)"],
    ["#3993ff", "var(--di-hide-risk)"],
    ["#828792", "var(--di-detail-sub)"],
    ["#767b86", "var(--di-chart-label)"],
    ["#2d2e35", "var(--di-chart-border)"],
    ["#bec1c9", "var(--di-community-text)"],
    ["#676c78", "var(--di-community-meta)"],
    ["#303138", "var(--di-community-card-border)"],
    ["#23242a", "var(--di-community-card-bg)"],
    ["#c7cad1", "var(--di-opinion-btn-text)"],
    ["#33353d", "var(--di-opinion-btn-bg)"],
    ["#30323a", "var(--di-avatar-bg)"],
    ["#6c717c", "var(--di-avatar-muted)"],
    ["#6e737e", "var(--di-post-meta)"],
    ["#123c6b", "var(--di-follow-bg)"],
    ["#4da1ff", "var(--di-follow-text)"],
    ["#a8acb5", "var(--di-following-text)"],
    ["#c3c6cd", "var(--di-screener-nav-title)"],
    ["#5f6470", "var(--di-screener-nav-label)"],
    ["#303139", "var(--di-screener-nav-active)"],
    ["#17497c", "var(--di-screener-popular-bg)"],
    ["#4098ff", "var(--di-screener-popular-text)"],
    ["#303039", "var(--di-tooltip-bg)"],
    ["#43444d", "var(--di-tooltip-border)"],
    ["#bec1ca", "var(--di-tooltip-text)"],
    ["#3c3d46", "var(--di-screener-filter-border)"],
    ["#17375f", "var(--di-screener-filter-blue-bg)"],
    ["#173e6b", "var(--di-screener-filter-blue-border)"],
    ["#393a42", "var(--di-screener-row-border)"],
    ["#747984", "var(--di-screener-head)"],
    ["#dfe2e7", "var(--di-login-text)"],
    ["#8995a3", "var(--di-login-close)"],
    ["#17171c", "var(--di-login-card-bg)"],
    ["#5f626c", "var(--di-login-tab)"],
    ["#36363f", "var(--di-login-tab-active-bg)"],
    ["#41434d", "var(--di-login-input-border)"],
    ["#c9ccd3", "var(--di-login-input-text)"],
    ["#3a3b43", "var(--di-login-agree-border)"],
    ["#d2d4da", "var(--di-login-agree-text)"],
    ["#666a75", "var(--di-login-agree-check)"],
    ["#245b9e", "var(--di-login-submit-disabled)"],
    ["#7fa2cd", "var(--di-login-submit-disabled-text)"],
    ["#727985", "var(--di-login-footer)"],
    ["#3d9bff", "var(--di-login-link)"],
    ["#b9bcc4", "var(--di-login-without)"],
    ["#111217", "var(--di-ticker-bg)"],
    ["#2a2b31", "var(--di-ticker-border)"],
    ["#7c818c", "var(--di-ticker-toggle)"],
    ["#d0d3d9", "var(--di-ticker-text)"],
    ["#1d1e24", "var(--di-modal-bg)"],
    ["#3a3c46", "var(--di-modal-border)"],
    ["#2b2d34", "var(--di-modal-close-bg)"],
    ["#9ba0aa", "var(--di-modal-close-text)"],
    ["#303139", "var(--di-modal-footer-border)"],
    ["#15161b", "var(--di-modal-input-bg)"],
    ["#292b33", "var(--di-modal-result-hover)"],
    ["#b8bbc3", "var(--di-modal-filter-text)"],
    ["#173b68", "var(--di-modal-filter-selected-bg)"],
    ["#62a7ff", "var(--di-modal-filter-selected-text)"],
    ["#272931", "var(--di-toast-bg)"],
    ["#3b3e47", "var(--di-toast-border)"],
    ["#e8e9ed", "var(--di-toast-text)"],
    ["#9ca0aa", "var(--di-theme-btn-text)"],
    ["#707580", "var(--di-muted-2)"],
    ["#e1e3e8", "var(--di-text-8)"],
    ["#757a85", "var(--di-muted-3)"],
    ["#24262d", "var(--di-surface-2)"],
    ["#282a31", "var(--di-add-btn-bg)"],
    ["#5da5ff", "var(--di-ai-accent)"],
    ["#8fbfff", "var(--di-follow-text)"],
    ["#1f6fce", "var(--di-primary)"],
];

map.sort((a, b) => b[0].length - a[0].length);
for (const [hex, variable] of map) {
    css = css.split(hex).join(variable);
}

css = css.replace(
    /border: 1px solid var\(--di-border-8\); border-radius: 8px; background: var\(--di-surface-5\); color: #878b96;/,
    "border: 1px solid var(--di-search-border); border-radius: 8px; background: var(--di-search-bg); color: var(--di-search-text);",
);
css = css.replace(/filter: invert\(1\); opacity: \.5;/, "filter: var(--di-search-icon-filter); opacity: var(--di-search-icon-opacity);");
css = css.replace(
    /margin: 0 10px; overflow: hidden auto; border: 1px solid var\(--di-border-2\); border-radius: 12px; background: var\(--di-surface\);/,
    "margin: var(--di-main-margin); overflow: hidden auto; border: var(--di-main-border); border-radius: var(--di-main-radius); background: var(--di-surface); box-shadow: var(--di-main-shadow);",
);
css = css.replace(
    /\.demo-invest__watchlist \{ min-width: 0; overflow: hidden auto; border-left: 1px solid var\(--di-border-2\); background: var\(--di-bg\); \}/,
    ".demo-invest__watchlist { min-width: 0; overflow: hidden auto; border-left: 1px solid var(--di-border-2); background: var(--di-surface); }",
);
css = css.replace(
    /\.demo-invest__right-rail \{ position: relative; display: flex; flex-direction: column; align-items: stretch; border-left: 1px solid var\(--di-border-2\); background: var\(--di-bg\); \}/,
    ".demo-invest__right-rail { position: relative; display: flex; flex-direction: column; align-items: stretch; border-left: 1px solid var(--di-border-2); background: var(--di-rail-bg); }",
);
css = css.replace(
    /\.demo-invest__theme-button \{[^}]+\}/,
    ".demo-invest__theme-button { position: absolute; right: 11px; bottom: 12px; width: 33px; height: 33px; border: 0; border-radius: 8px; background: var(--di-theme-btn-bg); color: var(--di-theme-btn-text); font-size: 18px; cursor: pointer; }",
);
css = css.replace(
    /filter: invert\(1\) hue-rotate\(180deg\) brightness\(\.48\) saturate\(1\.5\);/,
    "filter: var(--di-chart-filter);",
);
css = css.replace(
    /background: radial-gradient\(circle at 36% -18%, #17445a 0, #152e46 39%, #14171d 78%\); color: var\(--di-login-text\);/,
    "background: var(--di-login-page-bg); color: var(--di-login-text);",
);
css = css.replace(/background: rgba\(4,5,9,\.72\);/, "background: var(--di-modal-overlay);");
css = css.replace(
    /\.demo-invest__rate-chip\.demo-invest__text-up \{ background: rgba\(240,68,82,\.14\); \}/,
    ".demo-invest__rate-chip.demo-invest__text-up { background: var(--di-rate-up-bg); }",
);
css = css.replace(/background: var\(--di-border-8\); color: var\(--di-text-7\);/g, "background: var(--di-filter-active-bg); color: var(--di-filter-active-text);");
css = css.replace(
    /\.demo-invest__ranking-filters button \{ height: 29px; padding: 0 10px; border: 1px solid var\(--di-border-7\); background: var\(--di-surface-4\); color: var\(--di-filter-text\);/,
    ".demo-invest__ranking-filters button { height: 29px; padding: 0 10px; border: 1px solid var(--di-filter-border); background: var(--di-filter-bg); color: var(--di-filter-text);",
);
css = css.replace(
    /\.demo-invest__login \{ display: grid; place-items: center; width: 60px; height: 34px; border: 0; border-radius: 8px; background: #3182f6; color: #fff;/,
    ".demo-invest__login { display: grid; place-items: center; width: 60px; height: 34px; border: 0; border-radius: 8px; background: var(--di-login-bg); color: var(--di-login-text);",
);
css = css.replace(
    /\.demo-invest__header-watch strong \{ margin-right: auto; font-size: 13px; \}/,
    ".demo-invest__header-watch strong { margin-right: auto; font-size: 13px; color: var(--di-text); }",
);
css = css.replace(
    /\.demo-invest__rail-btn \{[^}]+border-bottom: 1px solid #25262d;/,
    (match) => match.replace("#25262d", "var(--di-border-3)"),
);

fs.writeFileSync(path, css);
const remaining = css.match(/#[0-9a-fA-F]{3,8}/g) ?? [];
console.log("remaining hex count:", remaining.length, [...new Set(remaining)].slice(0, 20));
