# Contributing

First and foremost, thank you! I appreciate that you want to contribute to **Denokv GUI Client**.

## Tech Stack

Of course in order to be able to contribute to the project, you should be familiar with the technologies used in its development:

### Back End side

- Node.js + Electron
- SQLite Database 
- [@deno/kv](https://www.npmjs.com/package/@deno/kv): npm package to deal with Deno KV databases
- [Hono](https://hono.dev/): to create the HTTP server that serves data from Deno KV database to the front end
- [dbmate](https://github.com/amacneil/dbmate): database migration tool

### Front End side

- Svelte
- Tailwind CSS
- [Shadcn Svelte](https://shadcn-svelte.com/): for ui components
- [Lucide](https://lucide.dev/icons/): for ui icons
- [CodeJar](https://github.com/antonmedv/codejar): code editor for constrasting js values to store in Deno KV

## Issues

- All reports of bugs, problems, and flaws are welcome.
- If you have a question or a request for help.

## Pull Requests

**Before proposing any changes to the app, create an issue first for discussing your proposal.**

Follow these steps to make the pull request: 👇

1. Follow the [Install and Run instructions](README.md#install-and-run-localy) in the `README.md` file to set up dev environment.

2. Create a new branch for the change you are willing to introduce.

3. Run the tests locally and make sure all tests pass and nothing broke. follow [Tests](README.md#tests) guide for how to run tests.

4. Follow the conventional commits [specification](https://www.conventionalcommits.org/en/v1.0.0/#specification) when writing your commit messages.

5. Create your pull request once you are ready 👍
