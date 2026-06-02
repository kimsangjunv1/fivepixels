"use client";

import { LandingPageProvider } from "../../features/landing/model/LandingContext";
import * as LandingLayer from "./ui";

export default function Panel() {
    return (
        <LandingPageProvider>
            <main className="route-content">
                <LandingLayer.HeroIntro />
                <LandingLayer.FeatureGrid />
                <LandingLayer.BottomCta />
            </main>
        </LandingPageProvider>
    );
}
