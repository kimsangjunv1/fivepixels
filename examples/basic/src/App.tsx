import { Report } from "stitchable";

import { BasicView } from "./views/basic/BasicView";

export function App() {
    return (
        <>
            <Report
                appearance="light"
                pathname="/examples/basic"
                fields={[
                    { key: "message", type: "textarea", label: "메시지", required: true },
                    { key: "isBug", type: "checkbox", label: "버그인가요?" },
                    { key: "isImportant", type: "checkbox", label: "중요한가요?" },
                ]}
            />
            <BasicView />
        </>
    );
}
