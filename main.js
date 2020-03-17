const { app, BrowserWindow, ipcMain, Tray } = require('electron');
const path = require('path');
require('dotenv').config();

let tray = undefined;
let window = undefined;

// Don't show the app in the doc
app.dock.hide();

const createWindow = () => {
  window = new BrowserWindow({
      width: 320,
      height: 450,
      show: false,
      frame: false,
      fullscreenable: false,
      resizable: false,
      transparent: false,
  });
  window.loadFile('index.html');

  // Hide the window when it loses focus
  window.on('blur', () => {
      if (!window.webContents.isDevToolsOpened()) {
          window.hide();
      }
  });
}

const getWindowPosition = () => {
  const windowBounds = window.getBounds();
  const trayBounds = tray.getBounds();

  // Center window horizontally below the tray icon
  const x = Math.round(trayBounds.x + (trayBounds.width / 2) - (windowBounds.width / 2))
  // Position window 4 pixels vertically below the tray icon
  const y = Math.round(trayBounds.y + trayBounds.height + 4)
  return {x: x, y: y}
}

const showWindow = () => {
  const position = getWindowPosition();
  window.setPosition(position.x, position.y, false);
  window.show();
}

const toggleWindow = () => {
  window.isVisible() ? window.hide() : showWindow();
}

const createTray = () => {
  tray = new Tray(path.join('icon.png'));
  tray.on('click', function (event) {
      toggleWindow();
  })
}

app.on('ready', () => {
    createTray();
    createWindow();
});