import "./naver-landing.css";

import { NaverFooter } from "./NaverFooter";
import { NaverHeader } from "./NaverHeader";
import { NaverHero } from "./NaverHero";
import { NaverNewsGrid } from "./NaverNewsGrid";
import { NaverPartners } from "./NaverPartners";
import { NaverPromoBanner } from "./NaverPromoBanner";
import { NaverServices } from "./NaverServices";

export function NaverLanding() {
    return (
        <main className="naver-landing">
            <NaverHeader />
            <NaverHero />
            <NaverNewsGrid />
            <NaverPromoBanner />
            <NaverServices />
            <NaverPartners />
            <NaverFooter />
        </main>
    );
}
