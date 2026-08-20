import { useState } from "react";

import { useDemoInvestInteractions } from "../model/DemoInvestInteractionContext";

const communities = [["🇺🇸", "미국주식이야기"], ["🇰🇷", "국내주식토론"], ["💰", "배당투자이야기"], ["🪙", "지금코인"], ["❓", "주식투자Q&A"], ["📒", "채권투자노트"], ["🙂", "아무말대잔치"]];
const rankings = [["제이아빠캐피탈", "+1,083,805,440원 (38.51%)"], ["고툼무와이프", "+402,645,977원 (68.67%)"], ["라이프인", "+312,977,366원 (2.54%)"]];
const news = [
    ["반도체", "SK하이닉스, AI 메모리 수요 확대로 장중 10% 상승", "12분 전"],
    ["미국 증시", "연준 위원 발언 이후 장기 국채 금리 하락", "28분 전"],
    ["바이오", "모더나·머크 맞춤형 암백신 임상 결과 발표", "43분 전"],
];

type FeedActionsProps = { postId: string; initialLikes: number; comments: number };

function FeedActions({ postId, initialLikes, comments }: FeedActionsProps) {
    const [liked, setLiked] = useState(false);
    const [commentsOpen, setCommentsOpen] = useState(false);
    const { showToast } = useDemoInvestInteractions();

    return (
        <>
            <div className="demo-invest__feed-actions" aria-label="게시글 반응" data-report-id={`demo-feed-actions-${postId}`} data-report-type="group">
                <button type="button" className={liked ? "is-active" : undefined} onClick={() => setLiked((current) => !current)} aria-pressed={liked}>♡ {initialLikes + Number(liked)}</button>
                <button type="button" onClick={() => setCommentsOpen((current) => !current)} aria-expanded={commentsOpen}>◯ {comments}</button>
                <button type="button" onClick={() => showToast("게시글을 리포스트했어요.")}>↻ 2</button>
                <button type="button" onClick={() => showToast("공유 링크를 복사했어요.")}>⌯</button>
            </div>
            {commentsOpen ? (
                <div className="demo-invest__inline-comments" data-report-id={`demo-feed-comments-${postId}`} data-report-type="group">
                    <strong>실시간 댓글</strong><p>오늘 흐름이 정말 강하네요.</p><p>정보 감사합니다 👏</p>
                </div>
            ) : null}
        </>
    );
}

export function FeedPage() {
    const [tab, setTab] = useState<"전체" | "뉴스">("전체");
    const [expandedPosts, setExpandedPosts] = useState<string[]>([]);
    const [following, setFollowing] = useState<string[]>([]);
    const [rankingTab, setRankingTab] = useState<"수익금" | "팔로워 급상승">("수익금");
    const { openDialog, showToast } = useDemoInvestInteractions();

    const toggleExpanded = (postId: string) => setExpandedPosts((current) => current.includes(postId) ? current.filter((id) => id !== postId) : [...current, postId]);
    const toggleFollow = (name: string) => setFollowing((current) => current.includes(name) ? current.filter((item) => item !== name) : [...current, name]);

    return (
        <div className="demo-invest__feed-page" data-report-id="demo-feed-page" data-report-type="group">
            <div className="demo-invest__feed-tabs" data-report-id="demo-feed-tabs" data-report-type="group">
                {(["전체", "뉴스"] as const).map((item) => <button key={item} type="button" className={tab === item ? "is-active" : undefined} onClick={() => setTab(item)} data-report-id={`demo-feed-tab-${item}`} data-report-type="item">{item}</button>)}
            </div>

            <div className="demo-invest__feed-layout">
                <section className="demo-invest__feed-stream">
                    <button type="button" className="demo-invest__opinion-box" onClick={() => openDialog("investOpinion")} data-fp-open="demo-modal-opinion" data-report-id="demo-opinion-trigger" data-report-type="item">
                        <span className="demo-invest__avatar demo-invest__avatar--muted">●</span><span>오늘 시장 어떻게 보세요?</span><b>의견 남기기</b>
                    </button>

                    {tab === "뉴스" ? (
                        <div className="demo-invest__news-feed" data-report-id="demo-news-feed" data-report-type="group">
                            {news.map(([category, title, time], index) => (
                                <article key={title} data-report-id={`demo-news-card-${index}`} data-report-type="item">
                                    <span>{category}</span><h3>{title}</h3><p>{time} · 토스증권 뉴스룸</p><button type="button" onClick={() => showToast("뉴스 상세 화면을 준비하고 있어요.")}>기사 보기 ›</button>
                                </article>
                            ))}
                        </div>
                    ) : (
                        <>
                            <article className="demo-invest__feed-post" data-report-id="demo-feed-post-ai" data-report-type="group">
                                <div className="demo-invest__post-head">
                                    <span className="demo-invest__avatar demo-invest__avatar--red">1%</span>
                                    <div><strong>사팔사팔상위일프로</strong> <em>팔로워 부자</em><small>2시간 (수정됨) · SK하이닉스에 남긴 글</small></div>
                                    <button type="button" className={following.includes("사팔사팔상위일프로") ? "is-following" : undefined} onClick={() => toggleFollow("사팔사팔상위일프로")}>{following.includes("사팔사팔상위일프로") ? "팔로잉" : "팔로우"}</button>
                                </div>
                                <p className={expandedPosts.includes("ai") ? "is-expanded" : undefined}>오늘부터 자사주 매입은<br />기타법인 으로 수급 들어올 확률이 크니<br />수급현황 에서 🎁기타법인🎁 을 봐야겠습니다<br /><br />AI답변 참고🙂<span> 시장 수급과 거래량 변화도 함께 확인해보세요. 장기 투자 관점에서는 변동성 관리가 중요합니다.</span></p>
                                <button type="button" className="demo-invest__more" onClick={() => toggleExpanded("ai")}>{expandedPosts.includes("ai") ? "접기" : "더 보기"}</button>
                                <img className="demo-invest__feed-media demo-invest__feed-media--answer" src="/demo-invest/feed-ai-answer.webp" alt="AI 답변" />
                                <FeedActions postId="ai" initialLikes={31} comments={2} />
                            </article>

                            <article className="demo-invest__feed-post" data-report-id="demo-feed-post-market" data-report-type="group">
                                <div className="demo-invest__post-head">
                                    <span className="demo-invest__avatar">🇰🇷</span>
                                    <div><strong>국내주식토론</strong><small>1시간 · 제이투룬님이 남긴 글</small></div>
                                    <button type="button" className={following.includes("국내주식토론") ? "is-following" : undefined} onClick={() => toggleFollow("국내주식토론")}>{following.includes("국내주식토론") ? "팔로잉" : "팔로우"}</button>
                                </div>
                                <p className={expandedPosts.includes("market") ? "is-expanded" : undefined}>모더나와 머크가 공동 개발한 맞춤형 암백신의 임상 성공 소식에 바이오주가 급등했네요.~<br />모더나는 하루 만에 세 배 가까이 뛰었고 머크도 두 자릿수 상승하며 헬스케어 업종을<br />끌어올렸어요.~<span> 미국 장기 국채 금리 하락도 투자심리를 지지했어요.</span></p>
                                <button type="button" className="demo-invest__more" onClick={() => toggleExpanded("market")}>{expandedPosts.includes("market") ? "접기" : "더 보기"}</button>
                                <div className="demo-invest__feed-cartoon" aria-label="움직이는 이미지"><span className="demo-invest__cartoon-window" /><span className="demo-invest__cartoon-face">😆</span><span className="demo-invest__cartoon-paper">▤</span></div>
                                <FeedActions postId="market" initialLikes={11} comments={1} />
                            </article>
                        </>
                    )}
                </section>

                <aside className="demo-invest__community-panel">
                    <h3>주제별 커뮤니티</h3>
                    <ul>{communities.map(([icon, name]) => <li key={name}><button type="button" onClick={() => showToast(`${name} 커뮤니티를 선택했어요.`)}><span>{icon}</span>{name}</button></li>)}</ul>
                    <h3 className="demo-invest__ranking-title">주간 프로필 랭킹</h3>
                    <div className="demo-invest__ranking-tabs">{(["수익금", "팔로워 급상승"] as const).map((item) => <button key={item} type="button" className={rankingTab === item ? "is-active" : undefined} onClick={() => setRankingTab(item)}>{item}</button>)}</div>
                    <ol>{rankings.map(([name, value], index) => <li key={name}><b>{index + 1}</b><span className="demo-invest__profile-dot" /><div><strong>{name}</strong><small>{rankingTab === "수익금" ? value : `+${398 - index * 71}명`}</small></div></li>)}</ol>
                </aside>
            </div>
        </div>
    );
}
