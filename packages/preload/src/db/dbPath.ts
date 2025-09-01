import os from 'node:os';
import path from 'node:path';
import fs from 'node:fs';

function getAppDataPath(appName: string) {
    const home = os.homedir();
    const platform = process.platform;

    if (platform === 'win32') {
        const localAppData = (process.env.LOCALAPPDATA || process.env.APPDATA) as string;
        return path.join(localAppData, appName);
    }

    if (platform === 'darwin') {
        return path.join(home, 'Library', 'Application Support', appName);
    }

    const xdgData = path.join(home, '.local', 'share');
    return path.join(xdgData, appName);
}

export function getDatabasePath() {
    const dbDir = getAppDataPath('denokv-gui-client');

    const dbPath = path.join(dbDir, 'kv-stores-database.sqlite');

    if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir)
    }

    return dbPath
}
