import { Navigate, Route, Routes } from "react-router-dom";

import ContactPage from "./(public)/contact/page";
import LandingPage from "./(public)/landing/page";
import PricingPage from "./(public)/pricing/page";
import { AppLayout } from "./layout/AppLayout";

export function AppRouter() {
    return (
        <Routes>
            <Route element={<AppLayout />}>
                <Route path="/" element={<LandingPage />} />
                <Route path="/pricing" element={<PricingPage />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
        </Routes>
    );
}
