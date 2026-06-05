import { BrowserRouter } from "react-router-dom";
import { Report } from "stitchable";

import { AppRouter } from "./app/router";

export function App() {
    return (
        <>
            <Report
                projectId="stitchable-basic-example"
                devOnly
                appearance="system"
                pathname="/examples/basic"
                visibleShortcutKeys
                onFeedbackCreate={(event) => {
                    console.log("feedback created", event);
                }}
                identify={{ id: "demo-user", name: "김아영 주임" }}
                authors={[
                    { id: "1", name: "김아영 주임" },
                    { id: "2", name: "최민호 전임" },
                    { id: "3", name: "john doe" },
                ]}
                fields={[
                    { key: "message", type: "textarea", label: "", required: true },
                    { key: "isBug", type: "checkbox", label: "bug" },
                    { key: "isImportant", type: "checkbox", label: "IMPORTANT" },
                ]}
            />
            <BrowserRouter>
                <AppRouter />
            </BrowserRouter>
        </>
    );
}
