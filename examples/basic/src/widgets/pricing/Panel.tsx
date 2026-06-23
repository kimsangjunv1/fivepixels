"use client";

import { PricingPageProvider } from "../../features/pricing/model/PricingContext";
import * as PricingLayer from "./ui";

export default function Panel() {
    return (
        <PricingPageProvider>
            <main className="route-content">
                <PricingLayer.PlanCards />
                <PricingLayer.FeatureComparison />
            </main>
        </PricingPageProvider>
    );
}
