export const BASIC_EXAMPLE_PROJECT_SCOPE = {
    projectId: "fivepixels-basic-example",
    environment: "STAGED",
    appVersion: "1.0.0",
};

export const EDGECASE_PATHNAME = "/edgecase";
export const SETTINGS_PATHNAME = "/settings";
export const HOME_PATHNAME = "/";
export const FEED_PATHNAME = "/feed";
export const SCREENER_PATHNAME = "/screener";
export const INDICES_PATHNAME = "/indices/SPX";
export const SIGNIN_PATHNAME = "/signin";

export const DEMO_FEEDBACK_SEED_PREFIXES = [
    "edgecase-seed-",
    "settings-seed-",
    "home-seed-",
    "feed-seed-",
    "screener-seed-",
    "indices-seed-",
    "signin-seed-",
] as const;
