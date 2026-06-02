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
                fields={[
                    { key: "message", type: "textarea", label: "메시지", required: true },
                    { key: "isBug", type: "checkbox", label: "버그" },
                    { key: "isImportant", type: "checkbox", label: "중요" },
                ]}
            />
            <BrowserRouter>
                <AppRouter />
            </BrowserRouter>
        </>
    );
}
