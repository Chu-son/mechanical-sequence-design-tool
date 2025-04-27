/* eslint global-require: off, no-console: off, promise/always-return: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `npm run build` or `npm run build:main`, this file is compiled to
 * `./src/main.js` using webpack. This gives us some performance wins.
 */
import path from 'path';
import fs from 'fs';
import { app, BrowserWindow, shell, ipcMain, Menu } from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import MenuBuilder from './menu';
import { resolveHtmlPath } from './util';
import './database';

// ウィンドウの状態を格納する型定義
interface WindowState {
  x?: number;
  y?: number;
  width: number;
  height: number;
  isMaximized?: boolean;
}

// ウィンドウ状態を保存するファイルのパス
const stateFilePath = path.join(app.getPath('userData'), 'window-state.json');
console.log('Window state file path:', stateFilePath);

// ウィンドウ状態を読み込む関数
function loadWindowState(): WindowState {
  try {
    // ファイルが存在する場合は読み込む
    if (fs.existsSync(stateFilePath)) {
      const data = fs.readFileSync(stateFilePath, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('ウィンドウ状態の読み込みに失敗しました:', error);
  }

  // デフォルト値を返す
  return {
    width: 1024,
    height: 728,
  };
}

// ウィンドウ状態を保存する関数
function saveWindowState(window: BrowserWindow): void {
  if (!window) return;

  try {
    // 最小化されている場合は保存しない
    if (window.isMinimized()) return;

    const state: WindowState = {
      isMaximized: window.isMaximized(),
    };

    // 最大化されていない場合は位置とサイズを保存
    if (!state.isMaximized) {
      const bounds = window.getBounds();
      state.x = bounds.x;
      state.y = bounds.y;
      state.width = bounds.width;
      state.height = bounds.height;
    } else {
      // 最大化されている場合も画面サイズは保存しておく
      const bounds = window.getBounds();
      state.width = bounds.width;
      state.height = bounds.height;
    }

    // ファイルに保存
    fs.writeFileSync(stateFilePath, JSON.stringify(state));
  } catch (error) {
    console.error('ウィンドウ状態の保存に失敗しました:', error);
  }
}

class AppUpdater {
  constructor() {
    log.transports.file.level = 'info';
    autoUpdater.logger = log;
    autoUpdater.checkForUpdatesAndNotify();
  }
}

let mainWindow: BrowserWindow | null = null;

ipcMain.on('showMenu', () => {
  if (mainWindow) {
    const menu = Menu.buildFromTemplate(
      new MenuBuilder(mainWindow).buildDefaultTemplate(),
    );
    menu.popup();
  }
});

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

const isDebug =
  process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';

if (isDebug) {
  require('electron-debug')();
}

const installExtensions = async () => {
  try {
    const installer = require('electron-devtools-installer');
    const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
    const extensions = ['REACT_DEVELOPER_TOOLS'];

    return await installer
      .default(
        extensions.map((name) => installer[name]),
        { forceDownload, loadExtensionOptions: { allowFileAccess: true } },
      )
      .catch((err: Error) => {
        console.log(`拡張機能のインストールに失敗しました: ${err.message}`);
      });
  } catch (e) {
    console.log('開発者ツールの拡張機能をロード中にエラーが発生しました:', e);
  }
};

const createWindow = async () => {
  if (isDebug) {
    await installExtensions();
  }

  const RESOURCES_PATH = app.isPackaged
    ? path.join(process.resourcesPath, 'assets')
    : path.join(__dirname, '../../assets');

  const getAssetPath = (...paths: string[]): string => {
    return path.join(RESOURCES_PATH, ...paths);
  };

  // 保存されたウィンドウ状態を読み込む
  const windowState = loadWindowState();

  mainWindow = new BrowserWindow({
    show: false,
    // 保存された位置とサイズを適用
    x: windowState.x,
    y: windowState.y,
    width: windowState.width,
    height: windowState.height,
    icon: getAssetPath('icon.png'),
    titleBarStyle: 'hidden',
    // expose window controlls in Windows/Linux
    ...(process.platform !== 'darwin' ? { titleBarOverlay: true } : {}),
    webPreferences: {
      preload: app.isPackaged
        ? path.join(__dirname, 'preload.ts')
        : path.join(__dirname, '../../.erb/dll/preload.js'),
    },
  });

  mainWindow.loadURL(resolveHtmlPath('index.html'));

  mainWindow.on('ready-to-show', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    if (process.env.START_MINIMIZED) {
      mainWindow.minimize();
    } else {
      // 保存された状態が最大化なら最大化して表示
      if (windowState.isMaximized) {
        mainWindow.maximize();
      }
      mainWindow.show();
    }
  });

  // ウィンドウが閉じられる前に状態を保存
  mainWindow.on('close', () => {
    if (mainWindow) {
      saveWindowState(mainWindow);
    }
  });

  // ウィンドウサイズ変更時に状態を保存（スロットリングを適用）
  let resizeTimeout: NodeJS.Timeout | null = null;
  mainWindow.on('resize', () => {
    if (resizeTimeout) {
      clearTimeout(resizeTimeout);
    }
    resizeTimeout = setTimeout(() => {
      if (mainWindow) {
        saveWindowState(mainWindow);
      }
    }, 500); // 500ms後に実行（頻繁な保存を避ける）
  });

  // ウィンドウ移動時に状態を保存（スロットリングを適用）
  let moveTimeout: NodeJS.Timeout | null = null;
  mainWindow.on('move', () => {
    if (moveTimeout) {
      clearTimeout(moveTimeout);
    }
    moveTimeout = setTimeout(() => {
      if (mainWindow) {
        saveWindowState(mainWindow);
      }
    }, 500); // 500ms後に実行（頻繁な保存を避ける）
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  const menuBuilder = new MenuBuilder(mainWindow);
  menuBuilder.buildMenu();

  // Open urls in the user's browser
  mainWindow.webContents.setWindowOpenHandler((edata) => {
    shell.openExternal(edata.url);
    return { action: 'deny' };
  });

  // Remove this if your app does not use auto updates
  // eslint-disable-next-line
  new AppUpdater();
};

/**
 * Add event listeners...
 */

app.on('window-all-closed', () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app
  .whenReady()
  .then(() => {
    createWindow();
    app.on('activate', () => {
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (mainWindow === null) createWindow();
    });
  })
  .catch(console.log);
