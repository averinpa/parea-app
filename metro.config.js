const { getDefaultConfig } = require('expo/metro-config')

const config = getDefaultConfig(__dirname)

// phosphor-react-native has "react-native": "src/index.tsx" which exports all 9000+ icon
// source files, causing EMFILE on Windows. We import from individual compiled icons instead
// (lib/phosphor-icons.ts), so src/ should never be touched.
config.resolver.blockList = [
  /node_modules[/\\]phosphor-react-native[/\\]src[/\\].*/,
]

module.exports = config
