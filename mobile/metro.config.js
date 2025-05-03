// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Minimize the number of files to watch
config.watchFolders = [path.resolve(__dirname, 'src')];

// Only include essential files in the resolver
config.resolver = {
  ...config.resolver,
  blockList: [/node_modules\/(?!react|@react|expo|@expo)/],
  extraNodeModules: new Proxy({}, {
    get: (target, name) => path.join(process.cwd(), `node_modules/${name}`)
  }),
  disableHierarchicalLookup: true,
  useWatchman: false
};

module.exports = config;
