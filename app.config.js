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
          android: {
            usesCleartextTraffic: true,
          },
        },
      ],
      [
        "expo-media-library",
        {
          photosPermission: "Allow $(PRODUCT_NAME) to access your photos.",
          savePhotosPermission: "Allow $(PRODUCT_NAME) to save photos.",
          isAccessMediaLocationEnabled: true,
        },
      ],
      [
        "expo-splash-screen",
        {
          "image": "./assets/images/pingz.png",
          "resizeMode": "contain",
          "backgroundColor": "#ffffff",
          "imageWidth": null,
          "imageHeight": null
        }
      ],
    ],
    android: {
      permissions: [
        "INTERNET",
        "CAMERA",
        "READ_EXTERNAL_STORAGE",
        "WRITE_EXTERNAL_STORAGE",
        "MEDIA_LIBRARY",
        "ACCESS_MEDIA_LOCATION"
      ],
      package: "com.yourcompany.pingz",
      jsEngine: "hermes",
      adaptiveIcon: {
        // foregroundImage: "apk icon"
        foregroundImage: "./assets/images/pingz.png",
        backgroundColor: "#ffffff",
      },
    },
    ios: {
      supportsTablet: true,
      infoPlist: {
        NSPhotoLibraryUsageDescription:
          "Allow $(PRODUCT_NAME) to access your photos.",
        NSPhotoLibraryAddUsageDescription:
          "Allow $(PRODUCT_NAME) to save photos.",
      },
    },
    extra: {
      // Disable TLS/SSL certificate validation in development
      // WARNING: NEVER use this in production!
      allowInsecureConnections: true,
    },
    icon: "./assets/images/pingz.png",
    splash: {
      image: "./assets/images/pingz.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff"
    },
  },
};
