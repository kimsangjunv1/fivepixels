import { chromium } from "playwright";

const BASE = "http://localhost:5174";

async function main() {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();

    await page.goto(BASE);
    await page.waitForTimeout(1500);

    // Clear storage for fresh onboarding
    await page.evaluate(() => {
        localStorage.clear();
        sessionStorage.clear();
    });
    await page.reload();
    await page.waitForTimeout(1500);

    const log = [];
    const snap = async (label) => {
        const state = await page.evaluate(() => {
            const host = document.getElementById("fivepixels-root");
            const shadow = host?.shadowRoot;
            const overlay = shadow?.querySelector("[data-overlay-mode]");
            const onboarding = shadow?.textContent?.includes("세팅을 도와드릴게요") || shadow?.textContent?.includes("새로운 사용자");
            const stopFeedback = shadow?.textContent?.includes("피드백 중지");
            const pending = shadow?.textContent?.includes("등록 대기");
            const keys = Object.keys(localStorage).filter((k) => k.includes("fivepixels"));
            return {
                overlayMode: overlay?.getAttribute("data-overlay-mode") ?? null,
                hasOnboarding: Boolean(onboarding),
                hasStopFeedback: Boolean(stopFeedback),
                hasPending: Boolean(pending),
                storageKeys: keys,
            };
        });
        log.push(`${label}: ${JSON.stringify(state)}`);
    };

    await snap("initial");

    // Click new user in shadow DOM
    const shadowHost = page.locator("#fivepixels-root");
    await shadowHost.waitFor({ timeout: 10000 });

    const newUserBtn = page.locator("#fivepixels-root").locator("css=*").filter({ hasText: "새로운 사용자" });
    // Playwright can't pierce shadow easily with locator - use evaluate
    const clickedNew = await page.evaluate(() => {
        const host = document.getElementById("fivepixels-root");
        const shadow = host?.shadowRoot;
        if (!shadow) return false;
        const buttons = Array.from(shadow.querySelectorAll("button"));
        const btn = buttons.find((b) => b.textContent?.includes("새로운 사용자"));
        btn?.click();
        return Boolean(btn);
    });
    log.push(`clickedNewUser: ${clickedNew}`);
    await page.waitForTimeout(500);

    // Next through role step
    await page.evaluate(() => {
        const shadow = document.getElementById("fivepixels-root")?.shadowRoot;
        const btn = Array.from(shadow?.querySelectorAll("button") ?? []).find((b) => b.textContent?.trim() === "다음");
        btn?.click();
    });
    await page.waitForTimeout(500);

    // Enter name and create key
    await page.evaluate(() => {
        const shadow = document.getElementById("fivepixels-root")?.shadowRoot;
        const input = shadow?.querySelector("input");
        if (input) {
            const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value")?.set;
            nativeInputValueSetter?.call(input, "시발롬테스트");
            input.dispatchEvent(new Event("input", { bubbles: true }));
        }
    });
    await page.waitForTimeout(300);

    const keyResult = await page.evaluate(async () => {
        const shadow = document.getElementById("fivepixels-root")?.shadowRoot;
        const btn = Array.from(shadow?.querySelectorAll("button") ?? []).find((b) => b.textContent?.includes("키 생성"));
        btn?.click();
        await new Promise((r) => setTimeout(r, 800));
        const pre = shadow?.querySelector("pre");
        return { snippet: pre?.textContent ?? null };
    });
    log.push(`keySnippet: ${keyResult.snippet?.slice(0, 120)}`);
    await page.waitForTimeout(500);
    await snap("afterKeyGen");

    // Try add feedback (cube button area)
    const reportResult = await page.evaluate(() => {
        const shadow = document.getElementById("fivepixels-root")?.shadowRoot;
        const buttons = Array.from(shadow?.querySelectorAll("button") ?? []);
        // cube/select button - often has SelectIcon, try buttons in header
        const cubeBtn = buttons.find((b) => {
            const parent = b.closest("section");
            return parent?.querySelector("svg") && b.closest(".flex.flex-col");
        }) ?? buttons.find((b) => b.className.includes("hover:bg"));

        cubeBtn?.click();

        const stopFeedback = shadow?.textContent?.includes("피드백 중지");
        const error = shadow?.textContent?.includes("개인 키 설정이 필요");
        const overlay = shadow?.querySelector("[data-overlay-mode]");
        return {
            clicked: Boolean(cubeBtn),
            stopFeedback,
            error,
            overlayMode: overlay?.getAttribute("data-overlay-mode"),
        };
    });
    log.push(`addFeedback: ${JSON.stringify(reportResult)}`);
    await page.waitForTimeout(500);

    // If in report mode, try hover
    if (reportResult.overlayMode === "report") {
        const hoverResult = await page.evaluate(() => {
            const shadow = document.getElementById("fivepixels-root")?.shadowRoot;
            const overlay = shadow?.querySelector("[data-overlay-mode='report']");
            if (!overlay) return { error: "no overlay" };

            const event = new MouseEvent("mousemove", { clientX: 400, clientY: 300, bubbles: true });
            overlay.dispatchEvent(event);

            const highlight = shadow?.querySelector(".fivepixels-target-highlight");
            return { hasHighlight: Boolean(highlight) };
        });
        log.push(`hover: ${JSON.stringify(hoverResult)}`);
    }

    // Read localStorage key info
    const storageInfo = await page.evaluate(() => {
        const keys = Object.keys(localStorage).filter((k) => k.includes("personal-key"));
        const key = keys[0] ? localStorage.getItem(keys[0]) : null;
        if (!key) return { keys, bundle: null };
        try {
            const encoded = key.split(".")[1];
            const json = JSON.parse(atob(encoded.replace(/-/g, "+").replace(/_/g, "/")));
            return { keys, authorId: json.authorId, projectId: json.projectId, environment: json.environment };
        } catch {
            return { keys, parseError: true };
        }
    });
    log.push(`storage: ${JSON.stringify(storageInfo)}`);

    console.log(log.join("\n"));
    await browser.close();
}

main().catch((e) => {
    console.error(e);
    process.exit(1);
});
