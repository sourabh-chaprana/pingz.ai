export default {
  expo: {
    name: "pingz",
    slug: "pingz",
    version: "1.0.0",
    orientation: "portrait",
    platforms: ["ios", "android", "web"],
    plugins: [
      [
        "expo-build-properties",
        {
          "android": {
            "usesCleartextTraffic": true
          }
        }
      ]
    ],
    android: {
      permissions: ["INTERNET"],
      package: "com.yourcompany.pingz",
      jsEngine: "hermes",
    },
    extra: {
      // Disable TLS/SSL certificate validation in development
      // WARNING: NEVER use this in production!
      allowInsecureConnections: true
    }
  }
}; 