# Deno KV GUI Client

![downloads](https://img.shields.io/github/downloads/abdulrhmangoni/denokv-gui-client/total.svg)

This is an open source desktop app client to manage [**Deno KV Databases**](https://docs.deno.com/deploy/kv/manual/). <br/>
It enables you to browse your data inside Deno KV Databases in a modern GUI, perform CRUD operations and more!.

It's like using **"MongoDB Compass"** with **MongoDB**, **"Redis Insight"** with **Redis**, **"pgAdmin"** with **Postgres** database, **"Beekeeper Studio"** with many different databases, etc...

## Some Screenshots

![Kv Stores Grid screenshot (Dark)](./screenshots/KvStoresGrid_dark.png#gh-dark-mode-only)
![Kv Stores Grid screenshot (Light)](./screenshots/KvStoresGrid_light.png#gh-light-mode-only)

![Kv Entries Table screenshot (Dark)](./screenshots/KvEntriesTable_dark.png#gh-dark-mode-only)
![Kv Entries Table screenshot (Light)](./screenshots/KvEntriesTable_light.png#gh-light-mode-only)

![Add Entry Form screenshot (Dark)](./screenshots/AddKvEntryForm_dark.png#gh-dark-mode-only)
![Add Entry Form screenshot (Light)](./screenshots/AddKvEntryForm_light.png#gh-light-mode-only)

For more screenshots about how this app looks like, check out [screenshots](./screenshots/SCREENSHOTS.md).

## Download

**_Always recommended to download from the latest release_**

> [!NOTE]
> For Windows and Mac Users: <br />
> This application is not code signed yet.
> When running the app, you may encounter security warnings like "Unknown Publisher" or "'\*.app' is damaged and can’t be opened", So please ensure you trust the source code before proceeding with the installation.

To download the **Deno KV GUI Client** app, go to [releases][releases-page] page, pick and download the file that matches your operating system:

### Linux

There are two options for Linux users:

#### `.AppImage` format (compatible with most Linux distributions)

> [!TIP]
> To easily download the `.AppImage` file and set up a desktop entry for the app, run:
>
> ```bash
> curl -sS https://abdulrhmangoni.github.io/denokv-gui-client/linux-AppImage-install.sh | sh
> ```
>
> If you've already downloaded the `.AppImage` file from the [releases][releases-page] page, you can pass its path to installation script to skip downloading it again and just set up the desktop entry:
>
> ```bash
> curl -sS https://abdulrhmangoni.github.io/denokv-gui-client/linux-AppImage-install.sh path/to/denokv-gui-client-x.x.x-linux-x86_64.AppImage | sh
> ```

> [!IMPORTANT]
> If you decided to manually download and run the `.AppImage` file, you might need to make it executable before running it:
>
> ```bash
> chmod +x path/to/denokv-gui-client-x.x.x-linux-x86_64.AppImage
> ```
>
> _Make sure to replace 'path/to' and 'x.x.x' with the actual location and version._

#### `.deb` format (Debian/Ubuntu installer)

If you picked `.deb` installer and downloaded it, you can install it like the following:

```bash
sudo dpkg -i path/to/denokv-gui-client-x.x.x-linux-x86_64.deb
```

### MacOS

The application is provided as a `.dmg` installer for both Apple Silicon (arm64) and Intel (x86_64) architectures.  
Download the correct version for your Mac from the [releases][releases-page] page:

- `denokv-gui-client-x.x.x-mac-arm64.dmg` for **Apple Silicon Macs**
- `denokv-gui-client-x.x.x-mac-x64.dmg` for **Intel-based Macs**

> [!IMPORTANT]
> When you download and install the app, you'll most likely be prevented from opening it and see a warnings like this:
>
> > “denokv-gui-client.app” is damaged and can’t be opened. You should move it to the Bin.
>
> You can bypass this using following command:
>
> ```sh
> xattr -c /path/to/denokv-gui-client.app
> ```
>
> _Make sure to set the right path_

### Windows

On Windows, you just need to download the `denokv-gui-client-x.x.x-win-x64.exe` file from [releases][releases-page] page and run it.

## Install and run locally

### Installation

1. Clone the repo and enter the project's directory

```bash
  git clone https://github.com/AbdulrhmanGoni/denokv-gui-client.git && cd denokv-gui-client
```

2. Install dependencies

```bash
  npm install
```

### Development Mode

You first need to run the migration to set up the development database:

```bash
  npm run migration up
```

> [!NOTE]
> A development SQLite database file will be created in the root directory of the project once you run the migration command for the first time.
> It will be where any data and settings created in development mode are stored.

Then run the app in development mode with:

```bash
  npm start
```

### Compiling The App

To compile or build the app for production use:

```bash
  npm run compile
```

> This command will create the build artifacts in `dist` directory

### Tests

To run the tests, compile the app first, and then run:

```bash
  npm run test
```

> [!NOTE]
> A testing SQLite database file will be created in the root directory of the project once you run the test command for the first time.

[releases-page]: https://github.com/AbdulrhmanGoni/denokv-gui-client/releases

## Contribution

Please refer to [CONTRIBUTING.md](./CONTRIBUTING.md) for contribution guidelines.