import { createContext, useContext, type PropsWithChildren } from "react";

type InquiryTopic = {
    id: string;
    label: string;
};

type ContactChannel = {
    id: string;
    label: string;
    value: string;
    description: string;
};

type FaqItem = {
    id: string;
    question: string;
    answer: string;
};

type ContactContextValue = {
    topics: InquiryTopic[];
    channels: ContactChannel[];
    faqs: FaqItem[];
    officeHours: string;
};

const ContactContext = createContext<ContactContextValue | null>(null);

const contactValue: ContactContextValue = {
    topics: [
        { id: "contact-topic-sales", label: "도입 문의" },
        { id: "contact-topic-support", label: "기술 지원" },
        { id: "contact-topic-partner", label: "제휴 제안" },
        { id: "contact-topic-other", label: "기타" },
    ],
    channels: [
        {
            id: "contact-channel-email",
            label: "이메일",
            value: "hello@fivepixels.dev",
            description: "평균 1영업일 내 답변",
        },
        {
            id: "contact-channel-chat",
            label: "실시간 채팅",
            value: "평일 10:00 – 18:00",
            description: "Pro 이상 고객 우선 응대",
        },
        {
            id: "contact-channel-office",
            label: "오피스",
            value: "서울 강남구 테헤란로",
            description: "사전 예약 후 방문 가능",
        },
    ],
    faqs: [
        {
            id: "contact-faq-trial",
            question: "무료 체험 기간이 있나요?",
            answer: "Free 플랜은 별도 기한 없이 사용할 수 있으며, Pro는 14일 체험이 제공됩니다.",
        },
        {
            id: "contact-faq-security",
            question: "데이터는 어디에 저장되나요?",
            answer: "데모 환경은 브라우저 로컬 저장소를 사용하며, 실제 도입 시 정책에 맞게 구성할 수 있습니다.",
        },
        {
            id: "contact-faq-onboarding",
            question: "온보딩 지원을 받을 수 있나요?",
            answer: "Team 플랜 이상에서 전담 온보딩과 기술 세션을 제공합니다.",
        },
    ],
    officeHours: "운영 시간: 평일 09:00 – 18:00 (KST)",
};

export function ContactPageProvider({ children }: PropsWithChildren) {
    return <ContactContext.Provider value={contactValue}>{children}</ContactContext.Provider>;
}

export function useContactProvider() {
    const context = useContext(ContactContext);

    if (!context) {
        throw new Error("useContactProvider must be used within ContactPageProvider");
    }

    return context;
}
