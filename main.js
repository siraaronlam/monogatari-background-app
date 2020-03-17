require('dotenv').config();
const { app, BrowserWindow, ipcMain, Tray } = require('electron');
const fs = require('fs');
const path = require('path');
const request = require('request');
const Twitter = require('twitter');

const twitterClient = new Twitter({
  consumer_key: process.env.TWITTER_CONSUMER_API_KEY,
  consumer_secret: process.env.TWITTER_CONSUMER_API_SECRET,
  access_token_key: process.env.TWITTER_ACCESS_TOKEN_KEY,
  access_token_secret: process.env.TWITTER_ACCESS_TOKE_SECRET
});

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
};

const getWindowPosition = () => {
  const windowBounds = window.getBounds();
  const trayBounds = tray.getBounds();

  // Center window horizontally below the tray icon
  const x = Math.round(trayBounds.x + (trayBounds.width / 2) - (windowBounds.width / 2))
  // Position window 4 pixels vertically below the tray icon
  const y = Math.round(trayBounds.y + trayBounds.height + 4)
  return {x: x, y: y}
};

const showWindow = () => {
  const position = getWindowPosition();
  window.setPosition(position.x, position.y, false);
  window.show();
};

const toggleWindow = () => {
  window.isVisible() ? window.hide() : showWindow();
};

const createTray = () => {
  tray = new Tray(path.join('icon.png'));
  tray.on('click', function (event) {
    toggleWindow();
  })
};

const downloadImage = (uri, filename) => {
  request.head(uri, (err, res, body) => {
    request(uri).pipe(fs.createWriteStream(filename));
  });
};

const getTwitterResponse = async () => {
  var params = {screen_name: 'gatari_lines'};
  twitterClient.get('statuses/user_timeline', params, async (error, tweets, response) => {
    if (!error) {
      const media = tweets[0].entities.media;
      await downloadImage(media[0].media_url_https, 'test.png');
    }
  });
};

app.on('ready', () => {
  getTwitterResponse();
  createTray();
  createWindow();
});