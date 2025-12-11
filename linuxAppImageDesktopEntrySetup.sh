#!/bin/sh

set -e

for cmd in curl jq
do
    if ! command -v "$cmd" > /dev/null 2>&1; then
        echo "Missing dependency: $cmd" >&2
        exit 1
    fi
done

appDirPath="$HOME/.denokv-gui-client"
mkdir -p "$appDirPath"

appRepository=AbdulrhmanGoni/denokv-gui-client

downloadedAppImagePath="$1"
if [ -n "$downloadedAppImagePath" ]; then
    if [ ! -e "$downloadedAppImagePath" ]; then
        echo "The '$downloadedAppImagePath' file does not exist" >&2
        exit 1
    fi

    if [ ! -f "$downloadedAppImagePath" ] || [ ! "${downloadedAppImagePath##*.}" = "AppImage" ]; then
        echo "The '$downloadedAppImagePath' file is not a '.AppImage' file" >&2
        exit 1
    fi
else 
    # Fetch the latest release of the app
    echo "Fetching the latest release of \"denokv-gui-client\"..."
    latestReleaseUrl="https://api.github.com/repos/$appRepository/releases/latest"
    latestReleaseTag=$(curl -fsSL "$latestReleaseUrl" | jq -r '.tag_name // empty')
    if [ -z "$latestReleaseTag" ]; then
        echo "Failed to resolve the latest release tag of \"denokv-gui-client\" app from: \"$latestReleaseUrl\"" >&2
        exit 1
    fi

    appVersion="${latestReleaseTag#?}"
    echo "The latest release of \"denokv-gui-client\" is \"$appVersion\" 🔖"

    # Download the latest release
    appName="denokv-gui-client-$appVersion-linux-x86_64.AppImage"
    echo "Downloading \"$appName\""
    appDownloadLink="https://github.com/$appRepository/releases/download/$latestReleaseTag/$appName"
    curl -fC - -L -# -o "$appDirPath/$appName" "$appDownloadLink"

    if [ ! -s "$appDirPath/$appName" ]; then
        echo "Downloading \"$appName\" failed ❌" >&2
        exit 1
    fi

    echo "Downloading \"$appName\" is done ✅"

    downloadedAppImagePath="$appDirPath/$appName"
fi

# Move the downloaded AppImage file into the app directory 
mv -f "$downloadedAppImagePath" "$appDirPath/app.AppImage"

# Ensure the AppImage file is executable 
chmod +x "$appDirPath/app.AppImage"

# Download the icon of the app
echo "Downloading app icon..."
iconDownloadLink="https://raw.githubusercontent.com/$appRepository/main/buildResources/icon.png"
curl -fsSL -o "$appDirPath/icon.png" "$iconDownloadLink"
echo "Downloading app icon is done ✅"

desktopEntryData="\
[Desktop Entry]
Type=Application
Name=Deno KV GUI Client
GenericName=Desktop App Client to manage Deno KV Databases
Exec=$appDirPath/app.AppImage
Icon=$appDirPath/icon.png
Categories=Development;Database;\
"
echo "$desktopEntryData" > "$HOME/.local/share/applications/denokv-gui-client.desktop"
