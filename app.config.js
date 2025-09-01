export default ({ config }) => ({
  ...config,
  expo: {
    name: "MyGenealogy",
    slug: "genealogie_reactnative",
    version: "3.1.6",
    orientation: "portrait",
    icon: "./assets/images/arbre.png",
    scheme: "genealogiereactnative",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    ios: {
      supportsTablet: true
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/images/arbre.png",
        backgroundColor: "#ffffff"
      },
      edgeToEdgeEnabled: true,
      package: "com.mat95rix7.genealogie_reactnative"
    },
    web: {
      bundler: "metro",
      output: "static",
      favicon: "./assets/images/arbre.png"
    },
    plugins: [
      "expo-router",
      [
        "expo-splash-screen",
        {
          image: "./assets/images/arbre.png",
          imageWidth: 200,
          resizeMode: "contain",
          backgroundColor: "#ffffff"
        }
      ],
      "expo-font",
      "expo-secure-store"
    ],
    experiments: {
      typedRoutes: true
    },
    extra: {
      supabaseUrl:
        process.env.EXPO_PUBLIC_SUPABASE_URL ?? "https://your-default-supabase-url",
      supabaseAnonKey:
        process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? "your-default-anon-key",
      router: {},
      eas: {
        projectId: "ca0f6f8b-94b1-4416-9086-b49340240874",
      },

        // projectId: "c5ea548e-4e15-44f2-9b7d-c5ab74bde215"
    }
  }
}); 