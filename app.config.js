// app.config.js — extends app.json to inject Google Maps API key from env (kept out of git via .env / EAS Secrets)
const baseConfig = require('./app.json').expo

module.exports = {
  ...baseConfig,
  android: {
    ...baseConfig.android,
    config: {
      ...(baseConfig.android && baseConfig.android.config),
      googleMaps: {
        apiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_KEY,
      },
    },
  },
  ios: {
    ...baseConfig.ios,
    config: {
      ...(baseConfig.ios && baseConfig.ios.config),
      googleMapsApiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_KEY,
    },
  },
}
