import { createContext, useCallback, useContext, useEffect, useMemo, useState, type PropsWithChildren } from "react";
import { useNavigate } from "react-router-dom";

import { useModalDemo, type ModalCaseKey } from "../../../features/modals/model/ModalDemoContext";
import { watchlistTop10, type WatchlistItem } from "./mockMarketData";
import { DemoInvestModal } from "../ui/DemoInvestModal";

type DemoInvestInteractionContextValue = {
    openDialog: (key: ModalCaseKey) => void;
    showToast: (message: string) => void;
    watchlist: WatchlistItem[];
    removeWatch: (code: string) => void;
};

const DemoInvestInteractionContext = createContext<DemoInvestInteractionContextValue | null>(null);

const watchCandidates: WatchlistItem[] = [
    { code: "TSLA", name: "테슬라", logoSrc: "/demo-invest/logos/watch-4.png", price: "498,200원", change: "+8,700원", changeRate: "(1.78%)", direction: "up" },
    { code: "NVDA", name: "엔비디아", logoSrc: "/demo-invest/logos/watch-3.png", price: "247,300원", change: "+4,100원", changeRate: "(1.69%)", direction: "up" },
    { code: "AAPL", name: "애플", logoSrc: "/demo-invest/logos/watch-5.png", price: "319,800원", change: "-1,900원", changeRate: "(0.59%)", direction: "down" },
];

export function DemoInvestInteractionProvider({ children }: PropsWithChildren) {
    const navigate = useNavigate();
    const { isOpen, openModal, closeModal } = useModalDemo();
    const [watchlist, setWatchlist] = useState(watchlistTop10);
    const [search, setSearch] = useState("");
    const [selectedWatchCode, setSelectedWatchCode] = useState(watchCandidates[0].code);
    const [selectedFilters, setSelectedFilters] = useState(["국내", "대형주"]);
    const [opinion, setOpinion] = useState("");
    const [sentiment, setSentiment] = useState<"up" | "down">("up");
    const [toast, setToast] = useState<string | null>(null);

    const showToast = useCallback((message: string) => {
        setToast(message);
    }, []);

    useEffect(() => {
        if (!toast) {
            return;
        }

        const timeoutId = window.setTimeout(() => setToast(null), 2600);
        return () => window.clearTimeout(timeoutId);
    }, [toast]);

    useEffect(() => {
        const handleShortcut = (event: KeyboardEvent) => {
            const target = event.target as HTMLElement | null;
            if (event.key === "/" && !target?.matches("input, textarea, [contenteditable='true']")) {
                event.preventDefault();
                openModal("investSearch");
            }

            if (event.key === "Escape") {
                (["investSearch", "investWatchlist", "investFilter", "investOpinion", "investLogin"] as ModalCaseKey[])
                    .forEach(closeModal);
            }
        };

        window.addEventListener("keydown", handleShortcut);
        return () => window.removeEventListener("keydown", handleShortcut);
    }, [closeModal, openModal]);

    const removeWatch = useCallback((code: string) => {
        setWatchlist((current) => current.filter((item) => item.code !== code));
        showToast("관심 종목에서 제거했어요.");
    }, [showToast]);

    const value = useMemo(() => ({ openDialog: openModal, showToast, watchlist, removeWatch }), [openModal, removeWatch, showToast, watchlist]);
    const searchResults = useMemo(() => {
        const keyword = search.trim().toLowerCase();
        const candidates = [...watchlistTop10, ...watchCandidates];
        return keyword ? candidates.filter((item) => item.name.toLowerCase().includes(keyword)) : candidates.slice(0, 5);
    }, [search]);

    return (
        <DemoInvestInteractionContext.Provider value={value}>
            {children}

            {isOpen("investSearch") ? (
                <DemoInvestModal id="demo-modal-search" title="주식 통합 검색" description="키보드 / 단축키로 언제든 다시 열 수 있어요." onClose={() => closeModal("investSearch")}>
                    <input
                        autoFocus
                        className="demo-invest-modal__input"
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder="회사명이나 종목명을 입력하세요"
                        data-report-id="demo-search-modal-input"
                        data-report-type="item"
                    />
                    <div className="demo-invest-modal__search-results" data-report-id="demo-search-results" data-report-type="group">
                        {searchResults.length > 0 ? searchResults.map((item) => (
                            <button key={item.code} type="button" onClick={() => {
                                closeModal("investSearch");
                                navigate(`/?focusedProductCode=${item.code}`);
                                showToast(`${item.name} 상세 정보를 열었어요.`);
                            }}>
                                <img src={item.logoSrc} alt="" /><span><strong>{item.name}</strong><small>{item.code}</small></span><b>{item.price}</b>
                            </button>
                        )) : <p className="demo-invest-modal__empty">검색 결과가 없어요.</p>}
                    </div>
                </DemoInvestModal>
            ) : null}

            {isOpen("investWatchlist") ? (
                <DemoInvestModal
                    id="demo-modal-watchlist"
                    title="관심 종목 추가"
                    description="모달 내부의 선택 상태와 추가 후 목록 이동을 확인해보세요."
                    onClose={() => closeModal("investWatchlist")}
                    footer={<button type="button" className="demo-invest-modal__primary" onClick={() => {
                        const selected = watchCandidates.find((item) => item.code === selectedWatchCode);
                        if (selected && !watchlist.some((item) => item.code === selected.code)) {
                            setWatchlist((current) => [...current, selected]);
                            showToast(`${selected.name}을 관심 종목에 추가했어요.`);
                        }
                        closeModal("investWatchlist");
                    }}>선택 종목 추가</button>}
                >
                    <div className="demo-invest-modal__choice-list">
                        {watchCandidates.map((item) => (
                            <button key={item.code} type="button" className={selectedWatchCode === item.code ? "is-selected" : undefined} onClick={() => setSelectedWatchCode(item.code)}>
                                <img src={item.logoSrc} alt="" /><span><strong>{item.name}</strong><small>{item.price}</small></span><b>{selectedWatchCode === item.code ? "✓" : ""}</b>
                            </button>
                        ))}
                    </div>
                </DemoInvestModal>
            ) : null}

            {isOpen("investFilter") ? (
                <DemoInvestModal
                    id="demo-modal-filter"
                    title="스크리너 필터 만들기"
                    description="조건을 여러 개 선택하면 결과표가 갱신되는 케이스입니다."
                    onClose={() => closeModal("investFilter")}
                    footer={<button type="button" className="demo-invest-modal__primary" onClick={() => {
                        closeModal("investFilter");
                        showToast(`${selectedFilters.length}개 조건을 적용했어요.`);
                    }}>필터 적용</button>}
                >
                    <div className="demo-invest-modal__filter-grid">
                        {["국내", "해외", "대형주", "중소형주", "흑자기업", "배당주"].map((filter) => (
                            <button key={filter} type="button" className={selectedFilters.includes(filter) ? "is-selected" : undefined} onClick={() => setSelectedFilters((current) => current.includes(filter) ? current.filter((item) => item !== filter) : [...current, filter])}>{filter}</button>
                        ))}
                    </div>
                </DemoInvestModal>
            ) : null}

            {isOpen("investOpinion") ? (
                <DemoInvestModal
                    id="demo-modal-opinion"
                    title="오늘 시장 의견 남기기"
                    description="입력, 감정 선택, 토스트까지 이어지는 조건부 UI입니다."
                    onClose={() => closeModal("investOpinion")}
                    footer={<button type="button" className="demo-invest-modal__primary" disabled={!opinion.trim()} onClick={() => {
                        closeModal("investOpinion");
                        setOpinion("");
                        showToast("의견을 피드에 등록했어요.");
                    }}>의견 등록</button>}
                >
                    <div className="demo-invest-modal__sentiment">
                        <button type="button" className={sentiment === "up" ? "is-selected" : undefined} onClick={() => setSentiment("up")}>📈 상승할 것 같아요</button>
                        <button type="button" className={sentiment === "down" ? "is-selected" : undefined} onClick={() => setSentiment("down")}>📉 하락할 것 같아요</button>
                    </div>
                    <textarea value={opinion} onChange={(event) => setOpinion(event.target.value)} placeholder="시장에 대한 의견을 적어주세요" />
                </DemoInvestModal>
            ) : null}

            {isOpen("investLogin") ? (
                <DemoInvestModal
                    id="demo-modal-login"
                    title="로그인이 필요해요"
                    description="관심 종목과 계좌 기능은 로그인 후 이용할 수 있어요."
                    onClose={() => closeModal("investLogin")}
                    footer={<button type="button" className="demo-invest-modal__primary" onClick={() => {
                        closeModal("investLogin");
                        navigate("/signin");
                    }}>로그인 화면으로 이동</button>}
                >
                    <div className="demo-invest-modal__login-visual">🔐<strong>토스 앱으로 안전하게 로그인</strong><span>휴대폰 번호 또는 QR코드를 사용할 수 있어요.</span></div>
                </DemoInvestModal>
            ) : null}

            {toast ? <div className="demo-invest-toast" data-report-id="demo-invest-toast" data-report-type="item" role="status">✓ {toast}</div> : null}
        </DemoInvestInteractionContext.Provider>
    );
}

export function useDemoInvestInteractions() {
    const context = useContext(DemoInvestInteractionContext);
    if (!context) {
        throw new Error("useDemoInvestInteractions must be used within DemoInvestInteractionProvider");
    }
    return context;
}
