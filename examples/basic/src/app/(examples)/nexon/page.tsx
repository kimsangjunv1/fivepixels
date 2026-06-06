export default function NexonPage() {
    return (
        <main
            className="nexon-page"
            style={{ display: "flex" }}
        >
            <img
                className="nexon-page__image"
                src="/nexon-page.png"
                alt="nexon corporate page screenshot"
                decoding="async"
                style={{ maxWidth: "1920px", width: "100%", margin: "0 auto" }}
            />
        </main>
    );
}
