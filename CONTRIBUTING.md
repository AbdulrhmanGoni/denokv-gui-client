# Contributing

First and foremost, thank you! I appreciate that you want to contribute to **Deno Kv GUI Client** project.

To contribute effectively, it is helpful to be familiar with the project's architecture and its core development technologies.

This document provides an overview of the project structure, development technologies, and testing processes, followed by contribution guidelines.

## Project Architecture

The project is structured as a monorepo containing 6 packages that compose the app, alongside a separate codebase for the landing page.

This project uses `pnpm` as its package manager. Using `pnpm@11.1.0` or later is **required**, as well as **Node.js `>= 24.15.0`**.

```sh
.
├── package.json
├── pnpm-lock.yaml
├── electron-builder.mjs # electron-builder's configuration
├── packages
│   ├── /bridge-server # HTTP server that provides an API for the front-end to communicate with Deno KV databases
│   ├── /main # Electron main process (modular back-end services)
│   ├── /renderer # The front-end part of the app
│   ├── /preload # The script that exposes APIs from the main process to the renderer process
│   ├── /db-migration # Database schema migration functionality used by the main process
│   ├── /electron-versions # Shares helper functions to get the versions of internal components bundled within Electron
│   ├── dev-mode.js
│   └── entry-point.mjs
├── /landing # Landing page source code
├── /screenshots # Screenshots of the app
├── /scripts
├── /tests # End-to-end application UI tests
├── /types
├── CHANGELOG.md
├── CONTRIBUTING.md
├── LICENSE
└── README.md
```

### main package

This package contains the **main process** of the Electron application and the application's core back-end logic.
It consists of distinct modules (back-end services) that handle app startup, window lifecycle management, configurations, auto-updates, launching/managing the `bridge-server`, managing the local database where user data (like Kv Stores data and per-Kv-Store preferences and configurations) is stored, executing schema migrations, etc...

The package is organized using a **modular architecture**, where each module is a class that sets up what it needs inside its constructor method (like for example registering event listeners or IPC handlers) to do its job when it's created.

**Tech Stack**:

- Node.js + Electron + TypeScript
- Native `node:sqlite` (SQLite Database)

### renderer package

This package contains the source code for the application's front-end.
It typically communicates with the main process through the `preload` package using Electron's **IPC** (Inter-Process Communication) mechanism or via HTTP requests when communicating with the bridge-server to access Deno KV Databases.

Example:

```ts
import { kvStoresService } from "@app/preload";

kvStoresService.create(newKvStore);

kvStoresService.getAll();
```

**Tech Stack**:

- Svelte + Vite + TypeScript
- Tailwind CSS
- [Shadcn Svelte](https://shadcn-svelte.com/): For UI components
- [Lucide](https://lucide.dev/icons/): For UI icons
- [CodeJar](https://github.com/antonmedv/codejar): Code editor for constructing/editing js values to store in Deno KV

### bridge-server package

This package creates an HTTP server that provides an API for the front-end (renderer) to access Deno KV databases.
See [packages/bridge-server/README.md](packages/bridge-server/README.md) for more information.

This package is also published to [JSR](https://jsr.io/) as [@denokv-gui-client/bridge-server](https://jsr.io/@denokv-gui-client/bridge-server) so it can be used outside this app as a library. You can see [here the deployment workflow](./.github/workflows/publish-bridge-server.yml) of this package

**Tech Stack**:

- Node.js + Vite
- [Hono](https://hono.dev/): to create an HTTP server
- [@deno/kv](https://www.npmjs.com/package/@deno/kv) npm package: to interact with Deno KV databases in Node.js
- [Vitest](https://vitest.dev/): for testing

### preload package

This package contains the preload script for the Electron application.
It securely exposes the back-end services via **IPC** from the main process to the renderer process using Electron's [contextBridge](https://www.electronjs.org/docs/latest/api/context-bridge) API.

### db-migration package

This package provides a simple database schema migration functionality to the main process package for handling building and syncing the schema of the SQL database this application uses.

### electron-versions package

This package provides a set of helper functions for the other packages to get the versions of the internal components bundled within **Electron** like **Node** and **Chromium**

This package is used in development only by the **Vite** configuration files of the other packages to target specific **Node** and **Chromium** version when bundling.

### Landing Page

The source code for the project's landing page is located in the `/landing` directory.
It is not part of the NPM workspace and is managed separately using `pnpm`.

**Tech Stack**:

- [Astro](https://astro.build/)
- Tailwind CSS

## Tests

### E2E Application Tests

The compiled application is tested end-to-end (E2E) by launching and controlling it with [Playwright](https://playwright.dev/) to perform user actions and check that the application behaves as expected.
See [./tests/e2e.spec.ts](./tests/e2e.spec.ts) for more information on how the E2E testing is written.

To run the tests, make sure you have compiled the app first by running `pnpm run compile`, and then run:

```bash
  pnpm run test
```

> [!NOTE]
> Every time you make changes on one of the 6 packages in the workspace, you will have to re-compile application again to see the impact of the changes on the tests.

### bridge-server tests

The bridge-server package uses [Vitest](https://vitest.dev/) to write two types of tests:

- **Unit tests**: For testing individual functions and modules.
- **E2E tests**: For testing API endpoints by sending HTTP requests to a running instance of the bridge-server.

See the [bridge-server tests directory](./packages/bridge-server/tests) for details on how these tests are written.

To run the bridge-server tests use:

```bash
  pnpm run --filter=@app/bridge-server test
```

This will run all unit and e2e tests of the bridge-server package.

### db-migration package tests

The db-migration package uses [Vitest](https://vitest.dev/) to write tests for:

- **Migration files parsing**
- **"migrate up"** command/function
- **"migrate down"** command/function
- Helper functions

See the [tests directory](./packages/db-migration/tests) of this package for details on how these tests are written.

To run the db-migration tests use:

```bash
  pnpm run --filter=@app/db-migration test
```

## Code Style, Linting & Formatting

The project uses [oxlint](https://oxc.rs/docs/guide/usage/linter) for linting and [oxfmt](https://oxc.rs/docs/guide/usage/formatter) for formatting. Their configurations live in [.oxlintrc.json](.oxlintrc.json) and [.oxfmtrc.json](.oxfmtrc.json) respectively.

To check and fix your code before committing, use:

```bash
  # Lint the codebase (add --fix to auto-fix issues)
  pnpm run lint:check

  # Check formatting (add --write to auto-format)
  pnpm run format:check

  # Type-check all workspace packages
  pnpm run typecheck
```

Alternatively, you can run all of the above checks plus a full build with a single command:

```bash
  pnpm run checks
```

**Please make sure `pnpm run checks` passes before opening a pull request.**

## Issues

- Bug reports, feature requests, and suggestions are always welcome.
- If you have questions or need help, please feel free to open a new issue.

## Pull Requests

**Before proposing significant changes, please open an issue first to discuss your ideas.**

Follow these steps to submit a pull request: 👇

1. Fork the repository.

2. Follow the [Install and Run instructions](README.md#install-and-run-locally) in the `README.md` to set up your development environment.

3. Create a new branch and make your changes in it.

4. Run `pnpm run checks` (build, type-check, lint, and format) and make sure it passes.

5. Run the tests to ensure all of them pass and no regressions are introduced.

6. Create your pull request once you are ready 👍
