import { BrowserRouter } from "react-router-dom";
import { Report } from "stitchable";

import { AppRouter } from "./app/router";

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
                onEvent={(event) => {
                    if (event.type === "feedback:create") {
                        console.log("feedback created", event.payload);
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
