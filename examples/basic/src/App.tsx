import { Report } from "stitchable";

import { BasicView } from "./views/basic/BasicView";

export function App() {
    return (
        <>
            <Report
                devOnly
                appearance="light"
                pathname="/examples/basic"
                visibleShortcutKeys
                fields={[
                    { key: "message", type: "textarea", label: "메시지", required: true },
                    { key: "isBug", type: "checkbox", label: "버그" },
                    { key: "isImportant", type: "checkbox", label: "중요" },
                ]}
            />
            <BasicView />
        </>
    );
}
