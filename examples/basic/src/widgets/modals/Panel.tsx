"use client";

import { ModalDemoProvider } from "../../features/modals/model/ModalDemoContext";
import * as ModalLayer from "./ui";

export default function Panel() {
    return (
        <ModalDemoProvider>
            <main className="route-content">
                <ModalLayer.OpacityModalDemo />
                <ModalLayer.DisplayNoneModalDemo />
                <ModalLayer.ConditionalModalDemo />
                <ModalLayer.VisibilityModalDemo />
                <ModalLayer.ZustandModalDemo />
            </main>
        </ModalDemoProvider>
    );
}
