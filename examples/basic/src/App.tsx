import { BrowserRouter } from "react-router-dom";
import { Report, type ReportFeedback } from "stitchable";

import { AppRouter } from "./app/router";

async function createGitHubIssue(feedback: ReportFeedback) {
    const response = await fetch("/api/github/issues", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            feedbackId: feedback.id,
            feedback,
        }),
    });

    if (!response.ok) {
        throw new Error("GitHub issue creation failed");
    }

    return response.json() as Promise<{
        issueNumber: number;
        issueUrl: string;
        state?: "open" | "closed";
    }>;
}

export function App() {
    return (
        <>
            <Report
                project={{
                    id: "stitchable-basic-example",
                    env: "STAGED",
                    version: "1.0.0",
                }}
                ui={{
                    locale: "ko",
                    appearance: "system",
                    visibleShortcutKeys: true,
                    showFeedbackList: true,
                }}
                visibility={{
                    devOnly: true,
                    routeKey: "/examples/basic",
                }}
                team={{
                    user: { id: "demo-user", name: "김아영 주임" },
                    reviewers: [
                        { id: "1", name: "김아영 주임" },
                        { id: "2", name: "최민호 전임" },
                        { id: "3", name: "john doe" },
                    ],
                }}
                integrations={{
                    github: { enabled: true },
                }}
                onGitHubIssueCreate={createGitHubIssue}
                onEvent={(event) => {
                    if (event.type === "feedback:create") {
                        console.log("feedback created", event.payload);
                    }

                    if (event.type === "feedback:github-issue-created") {
                        console.log("github issue created", event.payload.issueUrl);
                    }
                }}
                fields={[
                    { key: "message", type: "textarea", label: "", required: true },
                    { key: "isBug", type: "checkbox", label: "bug" },
                    { key: "isImportant", type: "checkbox", label: "important" },
                ]}
            />
            <BrowserRouter>
                <AppRouter />
            </BrowserRouter>
        </>
    );
}
