#!/bin/sh

set -e

if ! command -v curl > /dev/null 2>&1; then
    echo '"curl" tool is missing, this script depends on it' >&2
    exit 1
fi

appDir="$HOME/.denokv-gui-client"
mkdir -p "$appDir"

appRepo=AbdulrhmanGoni/denokv-gui-client

downloadedAppPath="$1"
if [ -n "$downloadedAppPath" ]; then
    if [ ! -e "$downloadedAppPath" ]; then
        echo "The '$downloadedAppPath' file does not exist" >&2
        exit 1
    fi

    if [ ! -f "$downloadedAppPath" ] || [ ! "${downloadedAppPath##*.}" = "AppImage" ]; then
        echo "The '$downloadedAppPath' file is not a '.AppImage' file" >&2
        exit 1
    fi
else
    # Should be set automatically from `deploy-landing-page` workflow before deployment
    appVersion=""

    # Download the AppImage of the app
    appName="denokv-gui-client-$appVersion-linux-x86_64.AppImage"
    echo "Downloading \"$appName\""
    curl -fC - -L -# -o "$appDir/$appName" "https://github.com/$appRepo/releases/download/v$appVersion/$appName"

    if [ ! -s "$appDir/$appName" ]; then
        echo "Downloading \"$appName\" failed ❌" >&2
        exit 1
    fi

    echo "Downloading \"$appName\" is done ✅"

    downloadedAppPath="$appDir/$appName"
fi

# Move the downloaded AppImage file into the app directory 
mv -f "$downloadedAppPath" "$appDir/app.AppImage"

# Ensure the AppImage file is executable 
chmod +x "$appDir/app.AppImage"

# Download the icon of the app
echo "Downloading app icon..."
curl -fsSL -o "$appDir/icon.png" "https://raw.githubusercontent.com/$appRepo/main/buildResources/icon.png"
echo "Downloading app icon is done ✅"

desktopEntryData="\
[Desktop Entry]
Type=Application
Name=Deno KV GUI Client
GenericName=Desktop App Client to manage Deno KV Databases
Exec=$appDir/app.AppImage
Icon=$appDir/icon.png
Categories=Development;Database;\
"
echo "$desktopEntryData" > "$HOME/.local/share/applications/denokv-gui-client.desktop"
