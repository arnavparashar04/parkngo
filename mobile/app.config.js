import 'dotenv/config';

export default {
  expo: {
    name: "mobile",
    slug: "mobile",
    scheme: "parkngo",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "dark",
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.arnav.parkngo",
      ...(process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY ? {
        config: {
          googleMapsApiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY
        }
      } : {})
    },
    android: {
      package: "com.arnav.parkngo",
      adaptiveIcon: {
        backgroundColor: "#E6F4FE",
        foregroundImage: "./assets/android-icon-foreground.png",
        backgroundImage: "./assets/android-icon-background.png",
        monochromeImage: "./assets/android-icon-monochrome.png"
      },
      predictiveBackGestureEnabled: false,
      ...(process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY ? {
        config: {
          googleMaps: {
            apiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY
          }
        }
      } : {})
    },
    web: {
      favicon: "./assets/favicon.png"
    },
    plugins: [
      "expo-router"
    ]
  }
};
