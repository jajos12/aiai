<p align="center">
  <img src="public/og-image.png" alt="AI Playground Banner" width="800" />
</p>

<h1 align="center">AI Playground</h1>

<p align="center">
  <strong>Interactive AI and math lessons built around visual intuition.</strong>
</p>

<p align="center">
  <a href="#overview">Overview</a> •
  <a href="#what-you-can-do">What You Can Do</a> •
  <a href="#current-curriculum">Current Curriculum</a> •
  <a href="#project-structure">Project Structure</a> •
  <a href="#getting-started">Getting Started</a> •
  <a href="#authoring-modules">Authoring Modules</a>
</p>

---

## Overview

AI Playground is a Next.js App Router app for learning AI and linear algebra through interactive, visual-first lessons instead of static notes alone.

Each module combines:

- guided steps with concise explanations
- interactive visualizations
- optional "Go Deeper" math sections
- playground experimentation
- challenge-based practice

The app currently stores learner progress in `localStorage`, generates public module routes from a runtime registry, and uses tier metadata to drive dashboard unlocks.

## What You Can Do

- move through curriculum tiers from a dashboard-first flow
- learn concepts in guided mode, then test intuition in playground mode
- validate understanding with challenge mode
- resume progress automatically from local persistence
- extend the curriculum by authoring and registering new modules

### Source of truth

If documentation and code disagree, trust these files:

- `src/core/registry.ts` for module registration and Tier 0 metadata
- `src/core/curriculum.ts` for tiers and unlock rules
- `src/modules/*` for live lesson implementations

Planning files in `docs/` are preserved for history and drafting, not runtime architecture.

---

## Current Curriculum

The live app currently ships these Tier 0 modules:

| Module ID | Title | Focus |
| --- | --- | --- |
| `vectors` | Vectors | Vector basics, magnitude, dot product, projections |
| `vector-spaces` | Vector Spaces | Span, independence, basis, dimension |
| `matrices` | Matrices | Matrix transforms, determinants, inverses |
| `eigenvalues` | Eigenvalues & Eigenvectors | Eigenspaces, decomposition, power iteration |
| `optimization` | Optimization & Gradient Descent | Loss landscapes, optimizers, partial derivatives |
| `chain-rule` | The Chain Rule | Computation graphs and gradient flow |

Tiers 1-5 are defined in curriculum metadata, but their module catalogs are not populated yet.

### Learning flow

1. Dashboard
2. Tier overview
3. Module hub
4. Guided, Playground, or Challenge mode

Public routes and sitemap entries are generated from the same runtime module data.

---

## Screenshots

<table>
  <tr>
    <td align="center"><img src="public/screenshoots/dashboard.png" alt="Dashboard" width="400" /><br /><strong>Dashboard</strong></td>
    <td align="center"><img src="public/screenshoots/tier_detail.png" alt="Tier Detail" width="400" /><br /><strong>Tier Overview</strong></td>
  </tr>
  <tr>
    <td align="center"><img src="public/screenshoots/module_detail.png" alt="Module Detail" width="400" /><br /><strong>Module Hub</strong></td>
    <td align="center"><img src="public/screenshoots/playground.png" alt="Playground" width="400" /><br /><strong>Playground</strong></td>
  </tr>
  <tr>
    <td align="center" colspan="2"><img src="public/screenshoots/challenges.png" alt="Challenges" width="400" /><br /><strong>Challenges</strong></td>
  </tr>
</table>

---

## Tech Stack

| Technology | Purpose |
| --- | --- |
| Next.js 16 | App Router, metadata routes, sitemap, bundling |
| React 19 | Interactive client components |
| TypeScript | Shared module and lesson contracts |
| KaTeX | Math rendering in deeper explanations |
| React Three Fiber + Drei | 3D optimization visualizations |
| localStorage | Progress and theme persistence |

---

## Project Structure

```text
src/
├── app/                    # App Router pages and metadata routes
├── components/             # Shared UI, lesson, dashboard, and layout components
├── core/                   # Runtime registry, curriculum metadata, shared types
├── hooks/                  # Client hooks for progress, lessons, theme, module loading
├── modules/                # Module implementations, one folder per module
└── types/                  # Persisted progress types
```

### Module layout

Each module lives under `src/modules/<module-id>/` and typically contains:

- `module.ts` for static lesson content
- `Visualization.tsx` for guided/playground rendering
- `ChallengeCanvas.tsx` for challenge interactions (optional)
- `index.ts` for runtime exports consumed by the registry

See `docs/module_authoring.md` for contributor workflow details.

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Install and run

```bash
git clone https://github.com/jajos12/aiai.git
cd aiai
npm install
npm run dev
```

Open `http://localhost:3000`.

### Quality checks

```bash
npm run lint
npm run build
```

---

## Authoring Modules

To add or update a module:

1. Create or update `src/modules/<module-id>/`
2. Export lesson data from `module.ts`
3. Export runtime components from `index.ts`
4. Register the module in `src/core/registry.ts`
5. Confirm the tier exists in `src/core/curriculum.ts`

Detailed workflow, contracts, and verification checklists live in `docs/module_authoring.md`.

Use `docs/content_template.md` as a design worksheet. Treat `docs/content_spec.md` and older planning docs as historical references.

---

## Roadmap

Near-term work is focused on expanding beyond Tier 0 with the current runtime architecture, beginning with Tier 1 module rollout and stronger author tooling.

Planned directions:

- Tier 1 module rollout
- dashboard and navigation polish
- optional cloud sync and account support
- deeper curriculum coverage in later tiers

---

## License

This project is open source and intended as a learning base for experimentation, teaching, and extension.
