import { platform, arch } from "node:process";
import { existsSync } from "node:fs";

export default function getCompiledAppPath(): string {
  let executablePath = "";
  switch (platform) {
    case "darwin":
      if (arch === "x64") {
        executablePath =
          "dist/mac/denokv-gui-client.app/Contents/MacOS/denokv-gui-client";
      } else if (arch === "arm64") {
        executablePath =
          "dist/mac-arm64/denokv-gui-client.app/Contents/MacOS/denokv-gui-client";
      } else {
        throw new Error(`Unsupported macOS architecture: ${arch}`);
      }
      break;
    case "win32":
      executablePath = "dist/win-unpacked/denokv-gui-client.exe";
      break;
    case "linux":
      executablePath = "dist/linux-unpacked/denokv-gui-client";
      break;
    default:
      throw new Error(`Unsupported platform: ${platform}`);
  }

  if (!existsSync(executablePath)) {
    throw new Error(
      "App Executable path not found. Please compile the app first using: npm run compile",
    );
  }

  return executablePath;
}
