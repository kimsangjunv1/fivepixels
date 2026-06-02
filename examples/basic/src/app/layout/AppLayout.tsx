"use client";

import { Outlet } from "react-router-dom";

import Main from "../../widgets/layout/Main";
import { ExampleGuide, SiteHeader } from "../../widgets/layout/ui";

export function AppLayout() {
    return (
        <Main
            id="app"
            className={{
                container: "app-page",
                inner: "app-shell",
            }}
        >
            <SiteHeader />
            <div className="app-body">
                <ExampleGuide />
                <div className="app-outlet">
                    <Outlet />
                </div>
            </div>
        </Main>
    );
}
