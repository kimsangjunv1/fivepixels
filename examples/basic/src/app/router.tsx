import { Navigate, Route, Routes } from "react-router-dom";

import { LandingPageProvider } from "../features/landing/model/LandingContext";
import { ModalDemoProvider } from "../features/modals/model/ModalDemoContext";
import { PulseIssuesPage } from "../widgets/landing/pages/PulseIssuesPage";
import { PulseOverviewPage } from "../widgets/landing/pages/PulseOverviewPage";
import { PulseReleasePage } from "../widgets/landing/pages/PulseReleasePage";
import { PulseReviewsPage } from "../widgets/landing/pages/PulseReviewsPage";
import { PulseSettingsPage } from "../widgets/landing/pages/PulseSettingsPage";
import { PulseBoardLayout } from "../widgets/landing/ui/PulseBoardLayout";

import "../../styles/pulse-board.css";

export function AppRouter() {
    return (
        <LandingPageProvider>
            <ModalDemoProvider>
                <Routes>
                    <Route element={<PulseBoardLayout />}>
                        <Route index element={<PulseOverviewPage />} />
                        <Route path="issues" element={<PulseIssuesPage />} />
                        <Route path="reviews" element={<PulseReviewsPage />} />
                        <Route path="release" element={<PulseReleasePage />} />
                        <Route path="settings" element={<PulseSettingsPage />} />
                    </Route>
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </ModalDemoProvider>
        </LandingPageProvider>
    );
}
