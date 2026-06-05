"use client";

import { ContactPageProvider } from "../../features/contact/model/ContactContext";
import * as ContactLayer from "./ui";

export default function Panel() {
    return (
        <ContactPageProvider>
            <main className="route-content">
                <ContactLayer.InquiryForm />
                <ContactLayer.ContactInfo />
                <ContactLayer.FaqList />
            </main>
        </ContactPageProvider>
    );
}
