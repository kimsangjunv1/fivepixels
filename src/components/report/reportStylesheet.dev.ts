import adaptiveTokens from "../../theme/adaptive-tokens.css?inline";
import stitchableSemantics from "../../theme/stitchable-semantics.css?inline";
import panelProgressiveBlurTokens from "../panel/panel-progressive-blur.tokens.css?inline";
import report from "./report.css?inline";

export const REPORT_STYLESHEET = [adaptiveTokens, stitchableSemantics, panelProgressiveBlurTokens, report].join("\n");
