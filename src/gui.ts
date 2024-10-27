import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import { crawl, write } from './core';
import { Config } from './config';
import Papa from 'papaparse';

let mainWindow: BrowserWindow | null = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  mainWindow.loadFile('index.html');

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

ipcMain.on('start-crawl', async (event, config: Config) => {
  try {
    await crawl(config);
    const outputFileName = await write(config);
    event.sender.send('crawl-complete', outputFileName);
  } catch (error: any) {
    event.sender.send('crawl-error', error.message);
  }
});
