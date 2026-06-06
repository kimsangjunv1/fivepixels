import type { IncomingMessage, ServerResponse } from "node:http";
import react from "@vitejs/plugin-react";
import type { Plugin } from "vite";
import { defineConfig } from "vite";
import type { ReportFeedback } from "../../src/types/report.js";
import { formatFeedbackAsGitHubIssueBody } from "../../src/utils/formatGitHubIssue.js";

const reportStylesheetDev = new URL("../../src/styles/reportStylesheet.dev.ts", import.meta.url).pathname;

function stitchableDevReportStylesheet(): Plugin {
    return {
        name: "stitchable-dev-report-stylesheet",
        enforce: "pre",
        resolveId(source, importer) {
            if (!source.endsWith("styles/reportStylesheet.js") || !importer?.includes("ShadowReportRoot")) {
                return null;
            }

            return reportStylesheetDev;
        },
    };
}

type CreateGitHubIssueRequest = {
    feedbackId?: string;
    feedback?: ReportFeedback;
};

function readJsonBody(request: IncomingMessage) {
    return new Promise<CreateGitHubIssueRequest>((resolve, reject) => {
        const chunks: Buffer[] = [];

        request.on("data", (chunk: Buffer | string) => {
            chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
        });

        request.on("end", () => {
            try {
                const raw = Buffer.concat(chunks).toString("utf8");
                resolve(raw ? (JSON.parse(raw) as CreateGitHubIssueRequest) : {});
            } catch (error) {
                reject(error);
            }
        });

        request.on("error", reject);
    });
}

function sendJson(response: ServerResponse, statusCode: number, payload: unknown) {
    response.statusCode = statusCode;
    response.setHeader("Content-Type", "application/json");
    response.end(JSON.stringify(payload));
}

async function handleGitHubIssuesProxy(request: IncomingMessage, response: ServerResponse) {
    if (request.method !== "POST") {
        sendJson(response, 405, { error: "Method not allowed" });
        return;
    }

    try {
        const body = await readJsonBody(request);
        const feedback = body.feedback;

        if (!feedback?.id) {
            sendJson(response, 400, { error: "feedback is required" });
            return;
        }

        const issueNumber = Math.floor(1000 + Math.random() * 9000);
        const owner = process.env.GITHUB_OWNER ?? "kimsangjunv1";
        const repo = process.env.GITHUB_REPO ?? "stitchable";
        const issueUrl = `https://github.com/${owner}/${repo}/issues/${issueNumber}`;
        const markdownBody = formatFeedbackAsGitHubIssueBody(feedback);

        console.info("[github-issues-proxy] mock issue created", {
            feedbackId: feedback.id,
            issueNumber,
            issueUrl,
            bodyPreview: markdownBody.slice(0, 240),
        });

        sendJson(response, 200, {
            issueNumber,
            issueUrl,
            state: "open",
        });
    } catch (error) {
        console.error("[github-issues-proxy] failed", error);
        sendJson(response, 500, { error: "Failed to create mock GitHub issue" });
    }
}

function stitchableGitHubIssuesProxy(): Plugin {
    return {
        name: "stitchable-github-issues-proxy",
        configureServer(server) {
            server.middlewares.use("/api/github/issues", (request, response, next) => {
                void handleGitHubIssuesProxy(request, response).catch(() => {
                    next();
                });
            });
        },
    };
}

export default defineConfig({
    plugins: [react(), stitchableDevReportStylesheet(), stitchableGitHubIssuesProxy()],
    css: {
        postcss: new URL("../../postcss.config.js", import.meta.url).pathname,
    },
    root: new URL("./", import.meta.url).pathname,
    build: {
        outDir: "dist",
        reportCompressedSize: true,
    },
    resolve: {
        alias: {
            stitchable: new URL("../../src/index.ts", import.meta.url).pathname,
        },
    },
});
