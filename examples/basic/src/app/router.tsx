import { Navigate, Route, Routes } from "react-router-dom";

import { ModalDemoProvider } from "../features/modals/model/ModalDemoContext";
import { DemoInvestThemeProvider } from "../widgets/demo-invest/model/DemoInvestThemeContext";
import { DemoInvestShell, FeedPage, HomePage, IndexDetailPage, LoginPage, ResponsiveCheckPage, ScreenerPage } from "../widgets/demo-invest";
import { PulseEdgecasePage } from "../widgets/landing/pages/PulseEdgecasePage";
import { DemoShowcasePage } from "../widgets/demo-showcase/DemoShowcasePage";

import "../../styles/pulse-board.css";
import "../../styles/demo-invest-tokens.css";
import "../../styles/demo-invest.css";
import "../../styles/demo-showcase.css";

export function AppRouter() {
    return (
        <DemoInvestThemeProvider>
            <ModalDemoProvider>
                <Routes>
                    <Route element={<DemoInvestShell />}>
                        <Route index element={<HomePage />} />
                        <Route path="feed" element={<FeedPage />} />
                        <Route path="screener" element={<ScreenerPage />} />
                        <Route path="responsive-check" element={<ResponsiveCheckPage />} />
                        <Route path="indices/:code" element={<IndexDetailPage />} />
                    </Route>
                    <Route path="signin" element={<LoginPage />} />
                    <Route path="edgecase" element={<PulseEdgecasePage />} />
                    <Route path="demo-showcase" element={<DemoShowcasePage />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </ModalDemoProvider>
        </DemoInvestThemeProvider>
    );
}
