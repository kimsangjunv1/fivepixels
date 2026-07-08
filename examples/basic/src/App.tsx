import { BrowserRouter, useNavigate } from "react-router-dom";
import { FivePixels, type ReportFeedback } from "@fivepixels-js/react";

import { AppRouter } from "./app/router";
import { invokeModalRevealHandler } from "./features/modals/model/modalRevealRegistry";

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
    }>;
}

function AppContent() {
    const navigate = useNavigate();

    return (
        <>
            {/* team={{
                    reviewers: [
                        {
                            id: "ebd74014-8e76-4c8d-b7d4-48ba0678317d",
                            name: "나는 리센느임 ㅋ",
                            publicKey:
                                "stpub1.eyJjcnYiOiJQLTI1NiIsImV4dCI6dHJ1ZSwia2V5X29wcyI6WyJ2ZXJpZnkiXSwia3R5IjoiRUMiLCJ4IjoiNnVENTQ0VThJLW9mVjVkaVFsWmF0aTBBbGVqcE5DZGxPeWpJN1h2QThpTSIsInkiOiJXYWF3dXZUSEpya2tyVXFTaWxFa3FRTG8wUFZHRldLRFh0QXd0VGhrTDhBIn0",
                        },
                    ],
                }} */}
            <FivePixels
                project={{
                    id: "fivepixels-basic-example",
                    env: "STAGED",
                    version: "1.0.0",
                }}
                // team={{
                //     reviewers: [
                //         {
                //             id: "5d82f429-38b4-4ㅂㅈㅇㅂㅈㅇㅈㅂㅇc72-b94b-5d931af68cad",
                //             name: "기모ㅂㅈㅇ띠",
                //             publicKey:
                //                 "stpub1.eyJjcnYiOiJㅂㅈㅇㅂㅈㅇㅂㅈㅇQLTI1NiIsImV4dCI6dHJ1ZSwia2V5X29wcyI6WyJ2ZXJpZnkiXSwia3R5IjoiRUMiLCJ4IjoiZkRDUUZwY1Nidk4ta0pKNGVMM2dBZHNOOE03cDkzd3NQeGRERWx4Nmk4cyIsInkiOiJHejZBZGFtSjlJRmd5SmwyMFNhUjI5cnI4UjBjWE9leGZiQXpGZk9oOXhrIn0",
                //         },
                //     ],
                // }}
                // mode="presentation"
                // ui={{
                //     locale: "ko",
                //     appearance: "system",
                //     visibleShortcutKeys: true,
                //     showFeedbackList: true,
                // }}
                // visibility={{
                //     devOnly: true,
                // }}
                // team={{
                //     user: { id: "demo-user", name: "Alex" },
                //     reviewers: [
                //         { id: "1", name: "김상준", department: "FrontEnd 2실", publicKey: "" },
                //         { id: "2", name: "Sophia", department: "QA", publicKey: "" },
                //         { id: "3", name: "William", department: "Engineering", publicKey: "" },
                //         { id: "4", name: "Emma", department: "Design", publicKey: "" },
                //     ],
                // }}
                // github={{
                //     enabled: true,
                //     modes: ["on-create", "from-list"],
                //     onCreate: createGitHubIssue,
                // }}
                // onNavigate={(pathname) => {
                //     navigate(pathname);
                // }}
                // onRevealTarget={invokeModalRevealHandler}
                // onEvent={(event) => {
                //     if (event.type === "feedback:create") {
                //         console.log("feedback created", event.payload);
                //     }

                //     if (event.type === "feedback:github-issue-created") {
                //         console.log("github issue created", event.payload.issueUrl);
                //     }

                //     const result = fetch("asd");
                // }}
                // fields={[
                //     { key: "message", type: "textarea", label: "", required: true },
                //     { key: "isBug", type: "checkbox", label: "bug" },
                //     { key: "isImportant", type: "checkbox", label: "important" },
                // ]}
            />
            <AppRouter />
        </>
    );
}

export function App() {
    return (
        <BrowserRouter>
            <AppContent />
        </BrowserRouter>
    );
}
