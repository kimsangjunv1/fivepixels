import { Navigate, Route, Routes } from "react-router-dom";

import ContactPage from "./(public)/contact/page";
import LandingPage from "./(public)/landing/page";
import NaverPage from "./(examples)/naver/page";
import KraftonPage from "./(examples)/krafton/page";
import DanggnPage from "./(examples)/danggn/page";
import PricingPage from "./(public)/pricing/page";
import { AppLayout } from "./layout/AppLayout";

export function AppRouter() {
    return (
        <Routes>
            <Route
                path="/examples/naver"
                element={<NaverPage />}
            />
            <Route
                path="/examples/krafton"
                element={<KraftonPage />}
            />
            <Route
                path="/examples/danggn"
                element={<DanggnPage />}
            />
            <Route element={<AppLayout />}>
                <Route
                    path="/"
                    element={<LandingPage />}
                />
                <Route
                    path="/pricing"
                    element={<PricingPage />}
                />
                <Route
                    path="/contact"
                    element={<ContactPage />}
                />
                <Route
                    path="*"
                    element={
                        <Navigate
                            to="/"
                            replace
                        />
                    }
                />
            </Route>
        </Routes>
    );
}
