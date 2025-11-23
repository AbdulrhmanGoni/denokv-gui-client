# Deno KV GUI Client

![downloads](https://img.shields.io/github/downloads/abdulrhmangoni/denokv-gui-client/total.svg)

This is an open source desktop app client for [**Deno KV Database**](https://docs.deno.com/deploy/kv/manual/). <br/>
It enable you to browse your stored data inside Deno KV Databases and preform CRUD operations in a nice and modern GUI.

It's like using **"MongoDB Compass"** with **MongoDB**, **"Redis Insight"** with **Redis**, **"pgAdmin"** with "Postgres" database, **"Beekeeper Studio"** with many different databases, etc...


## Some Screenshots

![Kv Entries Table screenshot (Dark)](./screenshots/kv-stores-grid-dark.png#gh-dark-mode-only)
![Kv Entries Table screenshot (Light)](./screenshots/kv-stores-grid-light.png#gh-light-mode-only)

![Kv Entries Table screenshot (Dark)](./screenshots/entries-table-dark.png#gh-dark-mode-only)
![Kv Entries Table screenshot (Light)](./screenshots/entries-table-light.png#gh-light-mode-only)

![Kv Entries Table screenshot (Dark)](./screenshots/add-entry-form-dark.png#gh-dark-mode-only)
![Kv Entries Table screenshot (Light)](./screenshots/add-entry-form-light.png#gh-light-mode-only)

## Download

***Always recommended to download from the latest release***

> [!NOTE]
> For Windows and Mac Users: <br />
> This application is not code signed yet. When installing, you may encounter "Unknown Publisher" or similar security warnings.
> So please ensure you trust the source code before proceeding with the installation.

To download the **Deno KV GUI Client** app, go to [releases](https://github.com/AbdulrhmanGoni/denokv-gui-client/releases) page, pick and download the file that matches your operating system:

- **Linux**
  - `.AppImage` (for all common Linux distributions)
  - `.deb` (Debian/Ubuntu installer)
- **Windows**
  - `.exe` (installer)
- **macOS**
  - `.dmg` (installer)

> [!IMPORTANT]
> If you are a linux user and downloaded the `.AppImage` file, you may need to make it executable before running it.
>
> You can make it executable like this: :point_down:
>
> ```bash
> chmod +x path/to/denokv-gui-client-x.x.x-linux-x86_64.AppImage
> # make sure to set the right path and replace x.x.x with the proper version
> ```

> [!IMPORTANT]
> In Mac, When you download and install the app, you'll most likely be prevented from opening it and see a warnings like this:
> > “denokv-gui-client.app” is damaged and can’t be opened. You should move it to the Bin.
>
> You can bypass this by running the following command:
> ```sh
> xattr -c /path/to/denokv-gui-client.app
> # make sure to set the right path
> ```

## Install and run localy

### Installation

1. clone the repo and entry project's directory

```bash
  git clone https://github.com/AbdulrhmanGoni/denokv-gui-client.git && cd denokv-gui-client
```

2. Install dependencies

```bash
  npm install
```

### Development Mode

You first need to run the mingrations to set up the development database:

```bash
  npm mingration up
```

Then run the app in development mode with:

```bash
  npm start
```

### Compiling The App

To compile or build the app use:

```bash
  npm run compile
```

> This command will create the build artifacts in `dist` directory

### Tests

To run the tests use:

```bash
  npm run test
```

> [!NOTE]
> To be able to run the tests, you should compile the app by running `npm run compile` first, Because the tests will be run on the compiled app inside `dist` directory.
