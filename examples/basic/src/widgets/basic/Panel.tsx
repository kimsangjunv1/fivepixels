"use client";

import { BasicPageProvider } from "../../features/basic/model/BasicContext";
import Main from "../layout/Main";
import * as BasicSection from "./ui";

export default function Panel() {
    return (
        <BasicPageProvider>
            <Main
                id="basic"
                className={{
                    container: "example-page",
                    inner: "example-shell",
                }}
            >
                <BasicSection.ExampleGuide />
                <main className="example-content">
                    <BasicSection.HeroCard />
                    <BasicSection.FeatureGrid />
                </main>
            </Main>
        </BasicPageProvider>
    );
}
