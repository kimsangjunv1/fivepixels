![fivepixels](https://raw.githubusercontent.com/kimsangjunv1/fivepixels/main/assets/fivepixels-banner.png)

# fivepixels &middot; [![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE) [![NPM badge](https://img.shields.io/npm/v/@fivepixels-js/react?logo=npm)](https://www.npmjs.com/package/@fivepixels-js/react)

[한국어](./README.md) | English

`fivepixels` is a React library for **DOM element-level feedback** on staging, QA, and internal tool screens. Drop markers by clicking targets, collaborate with replies and reviews, and optionally escalate to GitHub Issues. **UI Edit mode** lets you tweak styles and layout on the live page so stakeholders can show—not just describe—desired changes. The UI renders in a **Shadow Root**, so **no CSS import** is required in the host app.

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

Omit handlers to use **localStorage**. Pass persistence handlers for API-backed storage. **Stabilize handlers with `useCallback`**—inline functions can trigger repeated list fetches.

```tsx
import { useCallback } from "react";
import { FivePixels } from "@fivepixels-js/react";

const onList = useCallback(
    ({ pathname }) => fetch(`/api/feedbacks?pathname=${pathname}`).then((r) => r.json()),
    [],
);

export function App() {
    return (
        <FivePixels
            project={{ id: "my-app", env: "stage" }}
            onList={onList}
            onCreate={(payload) =>
                fetch("/api/feedbacks", { method: "POST", body: JSON.stringify(payload) }).then((r) => r.json())
            }
            onUpdate={(id, payload) =>
                fetch(`/api/feedbacks/${id}`, { method: "PATCH", body: JSON.stringify(payload) }).then((r) => r.json())
            }
        />
    );
}
```

For REST routes, rollout phases, and call sequencing, see [docs/backend-api-route.md](./docs/backend-api-route.md).

## Props

| Prop | Type | Description |
| ---- | ---- | ----------- |
| `project` | `{ id?, env?, version? }` | Project scope. `id` defaults to `"my-app"`. |
| `ui` | `{ appearance?, showFeedbackList?, visibleShortcutKeys?, shortcut?, locale?, messages? }` | UI options. `appearance`: `light` \| `dark` \| `system`. |
| `visibility` | `{ enabled?, devOnly?, routeKey? }` | Mount control. `devOnly` limits to dev environments. |
| `team` | `{ user?, reviewers?, requireReviewerKey? }` | Author and reviewers. `user`: `{ id, name }`. |
| `mode` | `"default"` \| `"presentation"` | Presentation mode for demos and viewer switching. |
| `fields` | `ReportField[]` | Custom fields (`textarea`, `checkbox`). |
| `onList` | `(params) => Promise<ReportFeedback[]>` | List feedback by pathname. |
| `onCreate` | `(payload) => Promise<ReportFeedback>` | Create feedback. |
| `onUpdate` | `(id, payload) => Promise<ReportFeedback>` | Update feedback, replies, and review state. |
| `onDelete` | `(id) => Promise<void>` | Delete feedback. |
| `onListAll` | `(params) => Promise<{ items, nextCursor? }>` | Paginated cross-page list. |
| `onListReplies` | `(commentId, params?) => Promise<...>` | Lazy reply loading (P2). |
| `onCreateReply` | `(commentId, payload) => Promise<ReportReply>` | Create reply (P2). |
| `onPanelBootstrap` | `(params) => Promise<...>` | Panel stats bootstrap (P3, optional). |
| `onActivitySummary` | `(params) => Promise<...>` | Activity heatmap summary (P3, optional). |
| `onNavigate` | `(pathname) => void` | Navigate from View mode. |
| `onRevealTarget` | `(report) => boolean \| Promise<boolean>` | Reveal a cross-page feedback target. |
| `onEvent` | `(event) => void` | create/update/delete/reply/github events. |
| `onReply` | `({ feedbackId, message }) => void` | Reply side effect hook. |
| `github` | `{ enabled?, modes?, onCreate? }` | GitHub Issue integration. |

> Pass `onList`, `onCreate`, and `onUpdate` **together**, or omit all three to use the localStorage adapter.

## Custom UI extension

Instead of `<FivePixels />`, compose panel and overlay UI with `ReportProvider` and context hooks from `@fivepixels-js/react/report`.

| Hook | Scope |
| ---- | ----- |
| `useReport()` | Full state (backward compatible) |
| `useReportPreferences()` | appearance, locale, role, messages, … |
| `useReportSession()` | mode, draft, markers, pickProbe, composers |
| `useReportData()` | lists, filters, CRUD, stats, reply history |

Layering rules: [docs/architecture-hooks.md](./docs/architecture-hooks.md).

## DOM attributes

| Attribute | Required | Description |
| --------- | -------- | ----------- |
| `data-report-id` | Recommended | Element identifier for marker restore. Without it, targets fall back to a CSS selector. |
| `data-report-type` | | `item` (default) or `group` for section-level targets. |

## UI modes

| Mode | Shortcut | Description |
| ---- | -------- | ----------- |
| **report** | `⌘⇧M` | Click elements to create feedback. Right-click for design probe and delete. |
| **view** | `⌘⇧L` | Browse markers, replies, and reviews |

## UI Edit mode (design probe)

In feedback mode you can **edit the real DOM live** for the current browser session—useful when PMs and designers need to align on spacing, color, or layout on staging without mockups.

### Getting started

1. Enter **Add feedback** mode and select an element.
2. **Right-click → Edit** to open the design probe panel.
3. Change values and click **Apply** to update the DOM. Applied elements show a **Modified** badge.

Applied edits **stay on the page** after you stop feedback (**Stop feedback**).

### What you can adjust

| Area | Fields |
| ---- | ------ |
| Text | `textContent`, `fontSize`, `lineHeight` — hidden on non-text elements (e.g. images, plain buttons) |
| Box | `padding`, `margin` (− / + stepper) |
| Color | `textColor`, `backgroundColor`, `borderColor` — hex input, native color picker, copy button |
| **flex** | Main/cross alignment (icons), horizontal/vertical direction + reverse, `gap` |
| **grid** | Column/row count (− / +, 1–12), `gap` |

Layout controls appear only when `display` is `flex` / `inline-flex` or `grid` / `inline-grid`. Alignment icons use **screen-relative** labels (left/center/right, top/center/bottom) and swap axes when direction is column.

### Right-click context menu

| Action | Effect |
| ------ | ------ |
| **Edit** | Open the design probe panel |
| **Revert** | Undo style changes for that element only (recorded in undo history) |
| **Delete** | Highlight animation, then remove from the DOM (restorable in-session) |

### Panel banner (UI Edit active)

When any edit or deletion exists, the panel shows **「UI Edit mode is active」**.

| Control | Effect |
| ------- | ------ |
| **Reset** | Restore all session style edits and deletions at once |
| **◀ / ▶** | Step **undo** / **redo** for apply, revert, and delete actions |
| **Before / After** | Compare saved style changes (shown when style edits exist) |

### Reflect changes in feedback

While drafting feedback, if design probe changes exist, a banner asks whether to **insert the style change summary**. **Apply** creates a **new case** with a formatted summary of edits.

### Behavior and limits

- Changes apply via **inline `element.style`**, overriding class-based CSS (e.g. Tailwind) while the session lasts.
- Edits persist only for the **current browser tab session**. A **full page reload** returns to the app’s original markup.
- UI Edit is for QA and design communication—not automatic commits to your codebase.
- Grid editing is simplified to **track count** and **gap**; uneven templates and cell spanning are not supported in the probe UI.

## Contributing

Issues and pull requests are welcome. Branch feature and fix work from `develop`.

Run `npm run lint` before opening a PR. See [CONTRIBUTING-en_us.md](./CONTRIBUTING-en_us.md) for details.

## License

MIT © Sangjun Kim. See [LICENSE](./LICENSE).
