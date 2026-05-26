# Frontend

React + Vite + TypeScript app, styled with Tailwind CSS v4 and shadcn/ui.

## Prerequisites

- Node.js 22.22+ or 24.15+
- npm 10+

## Install

```bash
npm install
```

## Run the development server

```bash
npm run dev
```

Vite prints a local URL (default `http://localhost:5173`) — open it in your browser. The page hot-reloads on save.

## Other scripts

| Command           | Description                                          |
| ----------------- | ---------------------------------------------------- |
| `npm run build`   | Type-check and produce a production build in `dist/` |
| `npm run preview` | Serve the production build locally                   |
| `npm run lint`    | Lint the project with ESLint                         |

## Adding shadcn/ui components

```bash
npx shadcn@latest add <component>
```

For example, `npx shadcn@latest add dialog`. Components land in `src/components/ui/`.
