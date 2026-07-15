# Contributing

[한국어](./CONTRIBUTING.md) | English

Thank you for contributing to fivepixels. Issues and pull requests are welcome.

## Getting started

- Node.js 20
- Clone the repository and run `npm ci`

## Branches

| Work | Base branch |
| ---- | ----------- |
| Features and fixes | Branch from `develop` |
| Hotfixes | Branch from `main` (only when necessary) |

Open PRs against `develop` when possible.

## Before opening a PR

```bash
npm run lint
```

`lint` runs `check:utils` (bans flat `@/utils/X.js` imports), `typecheck`, and `test`.

If needed, also run:

```bash
npm run build
npm run dev
```

CI runs `typecheck`, `test`, `build`, bundle size checks, and the example build.

## Documentation

| Doc | Audience |
| --- | -------- |
| [docs/architecture-hooks.md](./docs/architecture-hooks.md) | hooks/utils/providers layering |
| [docs/backend-api-route.md](./docs/backend-api-route.md) | Backend persistence handler integration |

Import utils from `@/utils/<domain>/<name>.js` in `components` and `hooks`.

## Pull requests

- Briefly describe what changed and why.
- Link related issues when applicable.
- Follow existing code style and patterns. Avoid unrelated refactors.

## Issues

For bugs and feature requests, use the templates on [GitHub Issues](https://github.com/kimsangjunv1/fivepixels/issues).
