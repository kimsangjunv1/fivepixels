import { useBasicProvider } from "../../../features/basic/model/BasicContext";

export function ExampleGuide() {
    const { steps, note } = useBasicProvider();

    return (
        <aside className="example-panel">
            <p className="example-eyebrow">stitchable example</p>
            <h1 className="example-title">기본 생성 · 조회 · 수정 흐름 데모</h1>
            <ol className="example-steps">
                {steps.map((step) => (
                    <li key={step}>{step}</li>
                ))}
            </ol>
            <p className="example-note">{note}</p>
        </aside>
    );
}
