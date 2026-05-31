import { stitchablePartProps } from "../report/parts.js";

const BLUR_LAYER_COUNT = 6;

type PanelProgressiveBlurProps = {
    hidden?: boolean;
};

export function PanelProgressiveBlur({ hidden }: PanelProgressiveBlurProps) {
    if (hidden) {
        return null;
    }

    return (
        <div {...stitchablePartProps("panel-blur-stack")} aria-hidden="true">
            {Array.from({ length: BLUR_LAYER_COUNT }, (_, index) => (
                <div key={index} {...stitchablePartProps("panel-blur-layer")} />
            ))}
            <div {...stitchablePartProps("panel-blur-tint")} />
        </div>
    );
}
