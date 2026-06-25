![fivepixels](https://raw.githubusercontent.com/kimsangjunv1/fivepixels/main/assets/fivepixels-banner.png)

# fivepixels &middot; [![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE) [![NPM badge](https://img.shields.io/npm/v/@fivepixels-js/react?logo=npm)](https://www.npmjs.com/package/@fivepixels-js/react)

[한국어](./README.md) | English

`fivepixels` is a React library for **DOM element-level feedback** on staging, QA, and internal tool screens. Drop markers by clicking targets, collaborate with replies and reviews, and optionally escalate to GitHub Issues. The UI renders in a **Shadow Root**, so **no CSS import** is required in the host app.

📖 **Full guide:** [library.codi-agit.com/fivepixels/guide](https://library.codi-agit.com/fivepixels/guide)

## Install

```bash
npm install @fivepixels-js/react react react-dom
```

## Usage

Add `data-report-id` to target elements and render `<FivePixels />` once on the page.

```tsx
import { FivePixels } from "@fivepixels-js/react";

export default function App() {
    return (
        <>
            <FivePixels project={{ id: "my-app" }} />

            <main>
                <section data-report-id="hero" data-report-type="group">
                    <button data-report-id="hero-cta">Get started</button>
                </section>
            </main>
        </>
    );
}
```

Omit handlers to use **localStorage**. Pass persistence handlers for API-backed storage.

```tsx
<FivePixels
    project={{ id: "my-app", env: "stage" }}
    onList={({ pathname }) => fetch(`/api/feedbacks?pathname=${pathname}`).then((r) => r.json())}
    onCreate={(payload) =>
        fetch("/api/feedbacks", { method: "POST", body: JSON.stringify(payload) }).then((r) => r.json())
    }
    onUpdate={(id, payload) =>
        fetch(`/api/feedbacks/${id}`, { method: "PATCH", body: JSON.stringify(payload) }).then((r) => r.json())
    }
/>
```

## Props

| Prop | Type | Description |
| ---- | ---- | ----------- |
| `project` | `{ id?, env?, version? }` | Project scope. `id` defaults to `"my-app"`. |
| `ui` | `{ appearance?, showFeedbackList?, visibleShortcutKeys?, shortcut?, locale?, messages? }` | UI options. `appearance`: `light` \| `dark` \| `system`. |
| `visibility` | `{ enabled?, devOnly?, routeKey? }` | Mount control. `devOnly` limits to dev environments. |
| `team` | `{ user?, reviewers?, requireReviewerKey? }` | Author and reviewers. `user`: `{ id, name }`. |
| `fields` | `ReportField[]` | Custom fields (`textarea`, `checkbox`). |
| `onList` | `(params) => Promise<ReportFeedback[]>` | List feedback by pathname. |
| `onCreate` | `(payload) => Promise<ReportFeedback>` | Create feedback. |
| `onUpdate` | `(id, payload) => Promise<ReportFeedback>` | Update feedback, replies, and review state. |
| `onDelete` | `(id) => Promise<void>` | Delete feedback. |
| `onListAll` | `(params) => Promise<{ items, nextCursor? }>` | Paginated cross-page list. |
| `onNavigate` | `(pathname) => void` | Navigate from View mode. |
| `onEvent` | `(event) => void` | create/update/delete/reply/github events. |
| `onReply` | `({ feedbackId, message }) => void` | Reply side effect hook. |
| `github` | `{ enabled?, modes?, onCreate? }` | GitHub Issue integration. |

> Pass `onList`, `onCreate`, and `onUpdate` **together**, or omit all three to use the localStorage adapter.

## DOM attributes

| Attribute | Required | Description |
| --------- | -------- | ----------- |
| `data-report-id` | ✅ | Element identifier used to restore marker position. |
| `data-report-type` | | `item` (default) or `group` for section-level targets. |

## UI modes

| Mode | Shortcut | Description |
| ---- | -------- | ----------- |
| **report** | `⌘⇧M` | Click elements to create feedback |
| **view** | `⌘⇧L` | Browse markers, replies, and reviews |

## Contributing

Issues and pull requests are welcome. Branch feature and fix work from `develop`.

Run `npm run lint` before opening a PR. See [CONTRIBUTING-en_us.md](./CONTRIBUTING-en_us.md) for details.

## License

MIT © Sangjun Kim. See [LICENSE](./LICENSE).
