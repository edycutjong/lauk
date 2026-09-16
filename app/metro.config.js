// Stock Expo Metro config. The app imports nothing above app/ — the pure core
// lives in app/src/core and the root workspace imports it downward — so no
// watchFolders trick is needed here (unlike lunker).
const { getDefaultConfig } = require('expo/metro-config');

module.exports = getDefaultConfig(__dirname);
